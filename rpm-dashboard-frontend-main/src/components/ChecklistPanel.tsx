import { useState } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { fetchChecklist, updateTaskStatus, fetchAuditLog, type ChecklistTask, type AuditEntry } from '../api'
import { useAuth } from '../context/AuthContext'
import MediaModal from './MediaModal'

type ChecklistPanelProps = {
  subsystemId: string | null
  subsystemLabel: string | null
}

type GatekeepingData = {
  has_warning: boolean
  low_stock_items: string[]
}

// ─── Audit Trail Drawer (per task) ───────────────────────────────────────────

function AuditDrawer({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { data: entries, isLoading } = useQuery<AuditEntry[]>({
    queryKey: ['audit-log', taskId],
    queryFn: () => fetchAuditLog(taskId),
  })

  return (
    <div className="audit-drawer">
      <div className="audit-drawer-header">
        <span>📋 Audit Trail (Live from MySQL)</span>
        <button onClick={onClose} className="audit-close-btn">✕</button>
      </div>
      {isLoading && <p className="loading-text" style={{ padding: '8px' }}>Loading trail...</p>}
      {entries && entries.length === 0 && (
        <p className="loading-text" style={{ padding: '8px' }}>No changes recorded yet.</p>
      )}
      {entries?.map((entry) => (
        <div key={entry.id} className="audit-entry">
          <span className="audit-who">👤 {entry.changed_by}</span>
          <span className={`audit-status audit-status-${(entry.new_status || '').toLowerCase()}`}>
            {entry.old_status} → {entry.new_status}
          </span>
          <span className="audit-when">{entry.changed_at}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
  isPending,
  onOpenMedia,
}: {
  task: ChecklistTask
  onToggle: (task: ChecklistTask) => void
  isPending: boolean
  onOpenMedia: (task: ChecklistTask) => void
}) {
  const { canChecklist, currentUser } = useAuth()
  const [auditOpen, setAuditOpen] = useState(false)

  const hasMedia = !!(task.video_ref_filename || task.image_ref_filename)

  return (
    <div className={`task-card ${task.completion_status === 'COMPLETE' ? 'task-complete' : ''}`}>
      <div className="task-card-header">
        <label className="checkbox-container" title={canChecklist ? 'Toggle task completion' : `Restricted to Technician or Administrator (Current: ${currentUser.role})`}>
          <input
            type="checkbox"
            checked={task.completion_status === 'COMPLETE'}
            onChange={() => canChecklist && onToggle(task)}
            disabled={isPending || !canChecklist}
            style={{ cursor: canChecklist ? (isPending ? 'wait' : 'pointer') : 'not-allowed' }}
          />
          <span className="custom-checkbox" />
        </label>

        <div className="task-title-group">
          <div className="task-title">{task.task_title}</div>
          <div className="task-badges-row">
            {task.mandatory_flag === 'Y' && (
              <span className="mandatory-badge" title="Mandatory task">Mandatory</span>
            )}
            {task.step_no && (
              <span className="step-badge">Step {task.step_no}</span>
            )}
          </div>
        </div>

        {/* Media Button */}
        <button
          className={`task-media-btn ${hasMedia ? 'has-media' : ''}`}
          onClick={() => onOpenMedia(task)}
          title="Open Video Procedure & Diagram Guide"
        >
          🎥 Media Guide
        </button>

        {/* Audit Button */}
        <button
          className="audit-toggle-btn"
          onClick={() => setAuditOpen((o) => !o)}
          title="View audit trail"
        >
          🕐
        </button>
      </div>

      {task.task_description && (
        <div className="task-description">{task.task_description}</div>
      )}

      <div className="task-meta">
        {task.approx_time_min != null && <span>⏱ {task.approx_time_min} min</span>}
        {task.special_tools && <span>🔧 {task.special_tools}</span>}
        {task.ppe_requirements && <span>🦺 {task.ppe_requirements}</span>}
      </div>

      {auditOpen && (
        <AuditDrawer taskId={task.task_id} onClose={() => setAuditOpen(false)} />
      )}
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

function ChecklistPanel({ subsystemId, subsystemLabel }: ChecklistPanelProps) {
  const queryClient = useQueryClient()
  const { userTag } = useAuth()
  const [selectedMediaTask, setSelectedMediaTask] = useState<ChecklistTask | null>(null)

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['checklist', subsystemId],
    queryFn: () => fetchChecklist(subsystemId!),
    enabled: !!subsystemId,
  })

  const { data: gatekeeping } = useQuery<GatekeepingData>({
    queryKey: ['gatekeeping', subsystemId],
    queryFn: async () => {
      const res = await fetch(`/api/gatekeeping/${subsystemId}`)
      if (!res.ok) throw new Error('Failed to fetch gatekeeping status')
      return res.json()
    },
    enabled: !!subsystemId,
  })

  const mutation = useMutation({
    mutationFn: ({ taskId, status, actor }: { taskId: string; status: string; actor: string }) =>
      updateTaskStatus(taskId, status, actor),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<ChecklistTask[]>(['checklist', subsystemId], (old) =>
        old?.map((t) => (t.task_id === updatedTask.task_id ? updatedTask : t))
      )
      // Invalidate audit log for this task so it refetches in drawer
      queryClient.invalidateQueries({ queryKey: ['audit-log', updatedTask.task_id] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
    },
  })

  function toggleComplete(task: ChecklistTask) {
    const newStatus = task.completion_status === 'COMPLETE' ? 'PENDING' : 'COMPLETE'
    mutation.mutate({ taskId: task.task_id, status: newStatus, actor: userTag })
  }

  function handleTaskMediaUpdated(updated: ChecklistTask) {
    queryClient.setQueryData<ChecklistTask[]>(['checklist', subsystemId], (old) =>
      old?.map((t) => (t.task_id === updated.task_id ? updated : t))
    )
    setSelectedMediaTask(updated)
  }

  // Completion progress bar
  const total = tasks?.length ?? 0
  const completed = tasks?.filter((t) => t.completion_status === 'COMPLETE').length ?? 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="checklist-panel">
      <div className="panel-header">
        <div>
          <h2>{subsystemLabel || 'Checklist'}</h2>
          {subsystemId && <span className="panel-subsystem-id">Subsystem: {subsystemId}</span>}
        </div>
        {total > 0 && (
          <div className="checklist-progress">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#22c55e' : '#3b82f6' }}
              />
            </div>
            <span className="progress-label">{completed}/{total} ({pct}%)</span>
          </div>
        )}
      </div>

      {/* Low-stock gatekeeping warning */}
      {gatekeeping?.has_warning && (
        <div className="gatekeeping-warning">
          <strong>⚠️ Inventory Gatekeeping Warning:</strong> Low-stock consumables detected for this subsystem:
          <ul>
            {gatekeeping.low_stock_items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {isLoading && <p className="panel-empty">Loading tasks...</p>}
      {!subsystemId && <p className="panel-empty">Select a date and subsystem to view its checklist.</p>}
      {subsystemId && !isLoading && tasks?.length === 0 && (
        <p className="panel-empty">No checklist tasks found for this subsystem.</p>
      )}

      {tasks?.map((task) => (
        <TaskCard
          key={task.task_id}
          task={task}
          onToggle={toggleComplete}
          isPending={mutation.isPending}
          onOpenMedia={(t) => setSelectedMediaTask(t)}
        />
      ))}

      {/* Video & Media Modal */}
      {selectedMediaTask && (
        <MediaModal
          isOpen={!!selectedMediaTask}
          onClose={() => setSelectedMediaTask(null)}
          task={selectedMediaTask}
          onTaskUpdated={handleTaskMediaUpdated}
        />
      )}
    </div>
  )
}

export default ChecklistPanel
