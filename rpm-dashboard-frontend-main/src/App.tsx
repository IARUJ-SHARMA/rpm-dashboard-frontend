import { useState } from 'react'
import Calendar from './components/Calendar'
import ChecklistPanel from './components/ChecklistPanel'
import StatCards from './components/StatCards'
import InventoryPanel from './components/InventoryPanel'
import DataUpload from './components/DataUpload'
import SubsystemEligibility from './components/SubsystemEligibility'
import RescheduleModal from './components/RescheduleModal'
import UserSwitcher from './components/UserSwitcher'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

function DashboardContent() {
  const { canReschedule, canUploadExcel, currentUser } = useAuth()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())

  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string | null>(null)
  const [selectedSubsystemLabel, setSelectedSubsystemLabel] = useState<string | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [isMonthlyView, setIsMonthlyView] = useState(false)

  const dateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null

  function handleDaySelect(day: number) {
    setSelectedDay(day)
    setSelectedSubsystemId(null)
    setSelectedSubsystemLabel(null)
  }

  function goToPreviousMonth() {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
    setSelectedDay(null)
    setSelectedSubsystemId(null)
    setSelectedSubsystemLabel(null)
  }

  function goToNextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
    setSelectedDay(null)
    setSelectedSubsystemId(null)
    setSelectedSubsystemLabel(null)
  }

  function handleExportPDF() {
    if (isMonthlyView) {
      window.open(`/api/export/month/${year}/${month + 1}`, '_blank')
    } else {
      const exportDateStr = dateStr ?? `${year}-${String(month + 1).padStart(2, '0')}-01`
      window.open(`/api/export/${exportDateStr}`, '_blank')
    }
  }

  function handleRescheduleSuccess() {
    setRefreshKey((k) => k + 1)
    setSelectedSubsystemId(null)
    setSelectedSubsystemLabel(null)
  }

  return (
    <div className="dashboard" key={refreshKey}>
      {/* ── Header Bar ── */}
      <div className="header-bar">
        <div className="header-title">
          <div className="header-icon">📡</div>
          <div>
            <h1>Radar Preventive Maintenance Dashboard</h1>
            <span className="header-sub">Industrial Asset & Preventive Maintenance Management</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Active User & Role Switcher */}
          <UserSwitcher />

          <button
            className="header-button"
            onClick={handleExportPDF}
            title="Download formatted maintenance plan as PDF"
          >
            📄 Export Plan (PDF)
          </button>

          <button
            className={`header-button primary ${!canReschedule ? 'btn-disabled-role' : ''}`}
            onClick={() => canReschedule && setRescheduleOpen(true)}
            disabled={!canReschedule}
            title={canReschedule ? 'Reschedule a PM event' : `Restricted to Engineer, Supervisor or Admin (Current: ${currentUser.role})`}
          >
            📅 Reschedule PM
          </button>
        </div>
      </div>

      {/* ── Data Upload (Admin only or with info note) ── */}
      {canUploadExcel ? (
        <DataUpload />
      ) : (
        <div className="role-info-banner">
          <span>ℹ️ Logged in as <strong>{currentUser.full_name} ({currentUser.role})</strong> — Master Excel Ingestion is restricted to Administrator role.</span>
        </div>
      )}

      {/* ── KPI Stat Cards ── */}
      <StatCards
        year={year}
        month={month}
        selectedDay={selectedDay}
        onViewModeChange={(mode) => setIsMonthlyView(mode === 'monthly')}
      />

      {/* ── Frequency Legend ── */}
      <div className="frequency-legend">
        <span className="legend-item"><span className="legend-swatch" style={{ backgroundColor: '#1D4ED8' }} />Weekly</span>
        <span className="legend-item"><span className="legend-swatch" style={{ backgroundColor: '#B91C1C' }} />Monthly</span>
        <span className="legend-item"><span className="legend-swatch" style={{ backgroundColor: '#15803D' }} />Quarterly</span>
        <span className="legend-item"><span className="legend-swatch" style={{ backgroundColor: '#92400E' }} />Annual</span>
      </div>

      {/* ── 3-Column Work Area ── */}
      <div className="three-column-layout">
        <div className="col-calendar">
          <Calendar
            year={year}
            month={month}
            selectedDay={selectedDay}
            setSelectedDay={handleDaySelect}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
          />
        </div>

        <div className="col-eligibility">
          <SubsystemEligibility
            dateStr={dateStr}
            selectedSubsystemId={selectedSubsystemId}
            setSelectedSubsystemId={(id, label) => {
              setSelectedSubsystemId(id)
              setSelectedSubsystemLabel(label)
            }}
          />
          <InventoryPanel />
        </div>

        <div className="col-checklist">
          <ChecklistPanel
            subsystemId={selectedSubsystemId}
            subsystemLabel={selectedSubsystemLabel}
          />
        </div>
      </div>

      {/* ── Reschedule Modal ── */}
      <RescheduleModal
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        dateStr={dateStr}
        preselectedSubsystemId={selectedSubsystemId}
        onSuccess={handleRescheduleSuccess}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}

export default App
