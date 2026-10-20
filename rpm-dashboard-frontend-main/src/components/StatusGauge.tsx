type StatusGaugeProps = {
  percentage: number
}

function StatusGauge({ percentage }: StatusGaugeProps) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const radius = 40
  const circumference = Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const color = clamped >= 70 ? '#22c55e' : clamped >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="status-gauge">
      <svg viewBox="0 0 100 55" width="100" height="55">
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="status-gauge-value" style={{ color }}>
        {clamped}%
      </div>
    </div>
  )
}

export default StatusGauge