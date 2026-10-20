import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchEligibility, rescheduleTask } from '../api'

type RescheduleModalProps = {
  isOpen: boolean
  onClose: () => void
  dateStr: string | null
  preselectedSubsystemId: string | null
  onSuccess: () => void
}

function RescheduleModal({ 
  isOpen, 
  onClose, 
  dateStr, 
  preselectedSubsystemId, 
  onSuccess 
}: RescheduleModalProps) {
  const [chosenSubsystemId, setChosenSubsystemId] = useState('')
  const [newDate, setNewDate] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: eligible } = useQuery({
    queryKey: ['eligibility', dateStr],
    queryFn: () => fetchEligibility(dateStr!),
    enabled: !!dateStr && isOpen,
  })

  useEffect(() => {
    if (isOpen) {
      setChosenSubsystemId(preselectedSubsystemId || '')
      setNewDate('')
      setReason('')
      setStatus('idle')
    }
  }, [isOpen, preselectedSubsystemId])

  useEffect(() => {
    if (!chosenSubsystemId && eligible && eligible.length > 0) {
      setChosenSubsystemId(eligible[0].subsystem_id)
    }
  }, [eligible, chosenSubsystemId])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!chosenSubsystemId || !dateStr || !newDate || !reason.trim()) {
      setErrorMsg('Please fill in all fields.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      await rescheduleTask(chosenSubsystemId, dateStr, newDate, reason)
      setStatus('idle')
      onSuccess()
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Reschedule failed')
      setStatus('error')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reschedule PM</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {!dateStr ? (
          <p className="modal-hint">Select a date first, then click Reschedule PM.</p>
        ) : !eligible || eligible.length === 0 ? (
          <p className="modal-hint">No subsystems are scheduled on {dateStr}.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-field">
              <label htmlFor="subsystem-select">Subsystem</label>
              <select
                id="subsystem-select"
                value={chosenSubsystemId}
                onChange={(e) => setChosenSubsystemId(e.target.value)}
              >
                {eligible.map((item) => (
                  <option key={item.subsystem_id} value={item.subsystem_id}>
                    {item.subsystem_full_name} ({item.pm_frequency}) — {item.est_duration_hrs}h
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Current Date</label>
              <div className="modal-static-value">{dateStr}</div>
            </div>

            <div className="modal-field">
              <label htmlFor="new-date">New Date</label>
              <input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>

            <div className="modal-field">
              <label htmlFor="reason">Reason for Rescheduling</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Technician unavailable, part awaiting delivery..."
                required
              />
            </div>

            {status === 'error' && <p className="modal-error">{errorMsg}</p>}

            <div className="modal-actions">
              <button type="button" className="modal-button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="modal-button-primary" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default RescheduleModal