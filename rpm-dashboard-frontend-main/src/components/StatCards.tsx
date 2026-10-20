import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSummary, fetchMonthlySummary } from '../api'
import StatusGauge from './StatusGauge'

type StatCardsProps = {
  year: number
  month: number
  selectedDay: number | null
  onViewModeChange?: (mode: 'daily' | 'monthly') => void
}

function StatCards({ year, month, selectedDay, onViewModeChange }: StatCardsProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')

  function handleToggle(mode: 'daily' | 'monthly') {
    setViewMode(mode)
    onViewModeChange?.(mode)
  }

  const dateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null

  const { data: dailySummary, isLoading: dailyLoading } = useQuery({
    queryKey: ['summary', dateStr],
    queryFn: () => fetchSummary(dateStr!),
    enabled: !!dateStr && viewMode === 'daily',
  })

  const { data: monthlySummary, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-summary', year, month],
    queryFn: () => fetchMonthlySummary(year, month + 1),
    enabled: viewMode === 'monthly',
  })

  const toggle = (
    <div className="view-toggle">
      <button
        className={viewMode === 'daily' ? 'toggle-active' : ''}
        onClick={() => handleToggle('daily')}
      >
        Daily
      </button>
      <button
        className={viewMode === 'monthly' ? 'toggle-active' : ''}
        onClick={() => handleToggle('monthly')}
      >
        Monthly
      </button>
    </div>
  )

  if (viewMode === 'daily') {
    if (!selectedDay) {
      return (
        <>
          {toggle}
          <p className="stat-cards-empty">Select a date to see maintenance summary.</p>
        </>
      )
    }
    if (dailyLoading) {
      return (
        <>
          {toggle}
          <p className="stat-cards-empty">Loading summary...</p>
        </>
      )
    }
    return (
      <>
        {toggle}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-label">Planned Checks Today</div>
            <div className="stat-value">{dailySummary?.planned_checks_today}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Estimated Maintenance Time</div>
            <div className="stat-value">{dailySummary?.estimated_maintenance_hours}h</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Subsystems Eligible</div>
            <div className="stat-value">{dailySummary?.subsystems_eligible}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Status (Completed Today)</div>
            <StatusGauge percentage={dailySummary?.status_percentage ?? 0} />
          </div>
          <div className="stat-card stat-card-small">
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value">{dailySummary?.low_stock_alerts}</div>
          </div>
          <div className="stat-card stat-card-small">
            <div className="stat-label">Life Span Alerts</div>
            <div className="stat-value">{dailySummary?.life_span_alerts}</div>
          </div>
          <div className="stat-card stat-card-small">
            <div className="stat-label">Active Subsystems</div>
            <div className="stat-value">{dailySummary?.total_active_subsystems}</div>
          </div>
          <div className="stat-card stat-card-small">
            <div className="stat-label">PM Completion (MTD)</div>
            <div className="stat-value">{dailySummary?.pm_completion_rate_mtd}%</div>
          </div>
        </div>
      </>
    )
  }

  if (monthlyLoading) {
    return (
      <>
        {toggle}
        <p className="stat-cards-empty">Loading monthly summary...</p>
      </>
    )
  }

  return (
    <>
      {toggle}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-label">Pending Tasks (Monthly)</div>
          <div className="stat-value">{monthlySummary?.pending_tasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Tasks (Monthly)</div>
          <div className="stat-value">{monthlySummary?.total_tasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Estimated Maintenance Time</div>
          <div className="stat-value">{monthlySummary?.estimated_maintenance_hours}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Subsystems Eligible</div>
          <div className="stat-value">{monthlySummary?.subsystems_eligible}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status (Completed Monthly)</div>
          <StatusGauge percentage={monthlySummary?.status_percentage ?? 0} />
        </div>
      </div>
    </>
  )
}

export default StatCards