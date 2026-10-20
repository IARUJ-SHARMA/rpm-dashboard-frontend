import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchConsumables, fetchSpares, adjustConsumableStock, type Consumable } from '../api'
import { useAuth } from '../context/AuthContext'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusClass(status: string) {
  const s = status.toLowerCase()
  if (s.includes('low') || s.includes('due') || s.includes('critical')) return 'status-low'
  if (s.includes('adequate') || s.includes('ok') || s.includes('good')) return 'status-ok'
  return 'status-neutral'
}

function alertClass(alertLevel: string) {
  const a = alertLevel.toLowerCase()
  if (a.includes('expired')) return 'status-expired'
  if (a.includes('warning')) return 'status-warning'
  if (a.includes('ok')) return 'status-ok'
  return 'status-neutral'
}

// ─── Consumable Row with +/- stock controls ──────────────────────────────────

function ConsumableRow({ item }: { item: Consumable }) {
  const queryClient = useQueryClient()
  const { canAdjustStock, userTag, currentUser } = useAuth()
  const [feedback, setFeedback] = useState<string | null>(null)

  const adjustMutation = useMutation({
    mutationFn: (delta: number) => adjustConsumableStock(item.item_id, delta, userTag),
    onSuccess: (updated) => {
      // Optimistically update the consumables list in cache
      queryClient.setQueryData<Consumable[]>(['consumables'], (old) =>
        old?.map((c) =>
          c.item_id === updated.item_id
            ? { ...c, current_qty: updated.current_qty, status: updated.status }
            : c
        )
      )
      // Also refresh summary cards (low-stock count may change)
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['gatekeeping'] })

      const msg = updated.status === 'Low Stock' ? '⚠️ Low Stock!' : '✓ Updated'
      setFeedback(msg)
      setTimeout(() => setFeedback(null), 1800)
    },
    onError: (err: Error) => {
      setFeedback(`❌ ${err.message}`)
      setTimeout(() => setFeedback(null), 2500)
    },
  })

  const isLow =
    item.current_qty !== null &&
    item.alert_threshold !== null &&
    item.current_qty <= item.alert_threshold

  const adjustTooltip = canAdjustStock
    ? 'Adjust stock count'
    : `Restricted to Logistics or Administrator (Current: ${currentUser.role})`

  return (
    <div className={`inventory-row consumable-row${isLow ? ' low-stock-row' : ''}`}>
      <div className="consumable-info">
        <span className="inventory-name">{item.consumable_item_name}</span>
        {item.unit_of_measure && (
          <span className="inventory-sub"> ({item.unit_of_measure})</span>
        )}
      </div>

      <div className="stock-controls">
        {/* Quantity display */}
        <span className={`stock-qty${isLow ? ' stock-qty-low' : ''}`}>
          {item.current_qty ?? '—'}
        </span>

        {/* Decrement */}
        <button
          className="stock-btn stock-btn-dec"
          onClick={() => canAdjustStock && adjustMutation.mutate(-1)}
          disabled={!canAdjustStock || adjustMutation.isPending || (item.current_qty ?? 0) <= 0}
          title={adjustTooltip}
        >
          −
        </button>

        {/* Increment */}
        <button
          className="stock-btn stock-btn-inc"
          onClick={() => canAdjustStock && adjustMutation.mutate(1)}
          disabled={!canAdjustStock || adjustMutation.isPending}
          title={adjustTooltip}
        >
          +
        </button>

        {/* Status badge */}
        <span className={`inventory-status ${statusClass(item.status)}`}>
          {feedback ?? item.status}
        </span>
      </div>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

function InventoryPanel() {
  const [tab, setTab] = useState<'consumables' | 'spares'>('consumables')

  const { data: consumables, isLoading: loadingConsumables } = useQuery({
    queryKey: ['consumables'],
    queryFn: fetchConsumables,
  })

  const { data: spares, isLoading: loadingSpares } = useQuery({
    queryKey: ['spares'],
    queryFn: fetchSpares,
  })

  const lowStockCount = consumables?.filter(
    (c) => c.current_qty !== null && c.alert_threshold !== null && c.current_qty <= c.alert_threshold
  ).length ?? 0

  return (
    <div className="inventory-panel">
      <h3>
        System Inventory Monitor
        {lowStockCount > 0 && (
          <span className="low-stock-badge">{lowStockCount} Low</span>
        )}
      </h3>

      <div className="inventory-tabs">
        <button
          className={tab === 'consumables' ? 'tab-active' : ''}
          onClick={() => setTab('consumables')}
        >
          Consumables
        </button>
        <button
          className={tab === 'spares' ? 'tab-active' : ''}
          onClick={() => setTab('spares')}
        >
          Spares
        </button>
      </div>

      <div className="inventory-list">
        {/* ── Consumables tab ── */}
        {tab === 'consumables' && loadingConsumables && (
          <p className="loading-text">Loading consumables...</p>
        )}
        {tab === 'consumables' &&
          consumables?.map((item) => <ConsumableRow key={item.item_id} item={item} />)}

        {/* ── Spares tab ── */}
        {tab === 'spares' && loadingSpares && (
          <p className="loading-text">Loading spares...</p>
        )}
        {tab === 'spares' &&
          spares?.map((item) => (
            <div key={item.spare_id} className="spare-card">
              <div className="inventory-row">
                <span className="inventory-name">
                  {item.spare_item_name}
                  {item.months_remaining !== null && (
                    <span className="inventory-sub"> ({item.months_remaining}mo left)</span>
                  )}
                </span>
                <span className={`inventory-status ${alertClass(item.alert_level ?? 'OK')}`}>
                  {item.alert_level}
                </span>
              </div>
              {item.replacement_action &&
                (item.alert_level?.toLowerCase().includes('warning') ||
                  item.alert_level?.toLowerCase().includes('expired')) && (
                  <div className="spare-action">{item.replacement_action}</div>
                )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default InventoryPanel
