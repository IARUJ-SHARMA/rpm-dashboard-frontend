import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchEligibility } from '../api'

type Props = {
  dateStr: string | null
  selectedSubsystemId: string | null
  setSelectedSubsystemId: (id: string, label: string) => void
}

function SubsystemEligibility({ dateStr, selectedSubsystemId, setSelectedSubsystemId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['eligibility', dateStr],
    queryFn: () => fetchEligibility(dateStr!),
    enabled: !!dateStr,
  })

  useEffect(() => {
    if (data && data.length > 0 && !selectedSubsystemId) {
      setSelectedSubsystemId(data[0].subsystem_id, data[0].subsystem_full_name)
    }
  }, [data])

  if (!dateStr) return null
  if (isLoading) return <p className="loading-text">Loading eligibility...</p>
  if (!data || data.length === 0) return null

  return (
    <div className="eligibility-panel">
      <h3>Subsystem Eligibility</h3>
      <div className="eligibility-list">
        {data.map((item) => (
          <div
            key={item.subsystem_id}
            className={`eligibility-row ${item.subsystem_id === selectedSubsystemId ? 'eligibility-selected' : ''}`}
            onClick={() => setSelectedSubsystemId(item.subsystem_id, item.subsystem_full_name)}
          >
            <span>{item.subsystem_full_name} ({item.pm_frequency})</span>
            <span className="eligibility-hrs">{item.est_duration_hrs}h</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubsystemEligibility