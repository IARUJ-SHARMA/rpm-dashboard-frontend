import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { uploadExcel, fetchLastUpdate } from '../api'

function DataUpload() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: lastUpdate } = useQuery({
    queryKey: ['last-update'],
    queryFn: fetchLastUpdate,
  })

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setMessage('')

    try {
      const result = await uploadExcel(file)
      const totalInserted = Object.values(result.summary).reduce((sum, s) => sum + s.inserted, 0)
      const totalUpdated = Object.values(result.summary).reduce((sum, s) => sum + s.updated, 0)
      setStatus('success')
      setMessage(`${totalInserted} rows added, ${totalUpdated} rows updated.`)

      // Immediately set local time cache so it matches your exact computer clock
      queryClient.setQueryData(['last-update'], {
        filename: file.name,
        uploaded_at: new Date().toISOString(),
      })

      // Refresh every piece of data and summary metrics that could have changed
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      await queryClient.invalidateQueries({ queryKey: ['consumables'] })
      await queryClient.invalidateQueries({ queryKey: ['spares'] })
      await queryClient.invalidateQueries({ queryKey: ['summary'] })
      await queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Upload failed')
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const lastUpdatedText = lastUpdate?.uploaded_at
    ? new Date(lastUpdate.uploaded_at).toLocaleString()
    : 'No data uploaded yet'

  return (
    <div className="data-upload">
      <div className="data-upload-info">
        <span className="last-updated-label">Data last updated:</span>
        <span className="last-updated-value">{lastUpdatedText}</span>
      </div>

      <label className="upload-button">
        {status === 'uploading' ? 'Uploading...' : 'Upload Excel'}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelected}
          disabled={status === 'uploading'}
          hidden
        />
      </label>

      {message && (
        <span className={`upload-message ${status === 'error' ? 'upload-error' : 'upload-ok'}`}>
          {message}
        </span>
      )}
    </div>
  )
}

export default DataUpload
