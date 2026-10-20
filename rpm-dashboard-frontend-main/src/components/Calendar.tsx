import { useQuery } from '@tanstack/react-query'
import { fetchCalendarEvents } from '../api'

type CalendarProps = {
  year: number
  month: number
  selectedDay: number | null
  setSelectedDay: (day: number) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function Calendar({ year, month, selectedDay, setSelectedDay, onPreviousMonth, onNextMonth }: CalendarProps) {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: fetchCalendarEvents,
  })

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (isLoading) return <p className="loading-text">Loading calendar...</p>
  if (error) return <p className="loading-text">Failed to load calendar data.</p>

  return (
    <div>
      <div className="calendar-nav">
        <button onClick={onPreviousMonth}>← Prev</button>
        <span className="calendar-month-label">{MONTH_NAMES[month]} {year}</span>
        <button onClick={onNextMonth}>Next →</button>
      </div>

      <div className="weekday-header">
        {weekdayLabels.map((label) => (
          <div key={label} className="weekday-label">{label}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((day, index) => {
          const dayEvents = events?.filter((e) => {
            const eventDate = new Date(e.event_date)
            return day !== null && eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
          }) ?? []

          const isSelected = day === selectedDay

          return (
            <div
              key={index}
              className={
                day
                  ? `day-cell${isSelected ? ' selected' : ''}`
                  : 'day-cell empty'
              }
              onClick={() => {
                if (day) setSelectedDay(day)
              }}
            >
              {day && <div className="day-number">{day}</div>}
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="event-tag"
                  style={{ backgroundColor: event.colour_code }}
                >
                  {event.calendar_label}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar