import React, { useState, useRef, useEffect } from 'react'
import { getMediaUrl, uploadTaskMedia, type ChecklistTask } from '../api'
import { useAuth } from '../context/AuthContext'

type MediaModalProps = {
  isOpen: boolean
  onClose: () => void
  task: ChecklistTask
  onTaskUpdated?: (updated: ChecklistTask) => void
}

function MediaModal({ isOpen, onClose, task, onTaskUpdated }: MediaModalProps) {
  const { userTag, canChecklist } = useAuth()
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video')
  const [videoError, setVideoError] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Reset errors when task or open state changes
  useEffect(() => {
    setVideoError(false)
    setImageError(false)
    setUploadMessage(null)
  }, [task.task_id, isOpen])

  // Animated Technical Radar Simulation for placeholder preview
  useEffect(() => {
    if (!isOpen || activeTab !== 'video' || (!videoError && task.video_ref_filename)) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let angle = 0

    function render() {
      if (!ctx || !canvas) return
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(cx, cy) - 20

      // Dark radar background
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, w, h)

      // Grid rings
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (r / 4) * i, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Crosshairs
      ctx.beginPath()
      ctx.moveTo(cx - r, cy)
      ctx.lineTo(cx + r, cy)
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx, cy + r)
      ctx.stroke()

      // Radar sweep
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, angle, angle + 0.35)
      ctx.closePath()
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)')
      grad.addColorStop(1, 'rgba(14, 165, 233, 0.0)')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()

      // Rotating line
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
      ctx.stroke()

      // Radar pulses
      const pulseCount = 3
      for (let p = 0; p < pulseCount; p++) {
        const px = cx + (r * 0.5 + p * 25) * Math.cos((p + 1) * 1.5)
        const py = cy + (r * 0.5 + p * 25) * Math.sin((p + 1) * 1.5)
        ctx.fillStyle = '#22c55e'
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // HUD text
      ctx.fillStyle = '#38bdf8'
      ctx.font = '12px monospace'
      ctx.fillText(`SYS: ${task.subsystem_id || 'RPM'} | TASK: ${task.task_id}`, 18, 25)
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(`GUIDE: ${task.video_ref_filename || 'Instructional Video'}`, 18, 45)
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`STATUS: PRE-OPERATIONAL WALKTHROUGH READY`, 18, h - 20)

      angle += 0.03
      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isOpen, activeTab, videoError, task])

  if (!isOpen) return null

  const videoUrl = task.video_ref_filename ? getMediaUrl(task.video_ref_filename) : null
  const imageUrl = task.image_ref_filename ? getMediaUrl(task.image_ref_filename) : null

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadMessage('Uploading media file...')

    try {
      const isVid = activeTab === 'video' || /\.(mp4|webm|mkv|mov|avi)$/i.test(file.name)
      const res = await uploadTaskMedia(task.task_id, file, userTag, isVid ? 'video' : 'image')
      setUploadMessage(`✅ Successfully attached: ${res.original_name}`)
      if (res.media_type === 'video') {
        setVideoError(false)
      } else {
        setImageError(false)
      }
      if (onTaskUpdated && res.task) {
        onTaskUpdated(res.task)
      }
    } catch (err: any) {
      setUploadMessage(`❌ Upload error: ${err.message || 'Failed to upload'}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="media-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="media-modal-header">
          <div className="media-header-left">
            <span className="media-task-badge">{task.task_id}</span>
            <div className="media-title-group">
              <h3>{task.task_title}</h3>
              <p className="media-subtitle">
                {task.step_no ? `Step ${task.step_no} • ` : ''}
                {task.approx_time_min ? `${task.approx_time_min} mins • ` : ''}
                {task.special_tools || 'Standard tools'}
              </p>
            </div>
          </div>
          <button className="media-close-btn" onClick={onClose} title="Close guide">✕</button>
        </div>

        {/* Tab switcher */}
        <div className="media-tabs-bar">
          <button
            className={`media-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            🎥 Video Procedure Guide
            {task.video_ref_filename && <span className="tab-pill">Attached</span>}
          </button>
          <button
            className={`media-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            🖼️ Technical Diagram / Photo
            {task.image_ref_filename && <span className="tab-pill">Attached</span>}
          </button>
        </div>

        {/* Content Body */}
        <div className="media-modal-body">
          {/* ── VIDEO TAB ── */}
          {activeTab === 'video' && (
            <div className="video-player-container">
              {videoUrl && !videoError ? (
                <div className="native-video-wrapper">
                  <video
                    key={videoUrl}
                    controls
                    playsInline
                    className="media-video-player"
                    onError={() => setVideoError(true)}
                  >
                    <source src={videoUrl} />
                    Your browser does not support HTML5 video streaming.
                  </video>
                  <div className="media-file-info">
                    <span>File: <code>{task.video_ref_filename}</code></span>
                  </div>
                </div>
              ) : (
                <div className="simulation-player-wrapper">
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={340}
                    className="radar-simulation-canvas"
                  />
                  <div className="simulation-overlay-badge">
                    <span>📡 Procedure Walkthrough Ready</span>
                    <span className="file-ref">Expected: {task.video_ref_filename || 'Task_Guide.mp4'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── IMAGE TAB ── */}
          {activeTab === 'image' && (
            <div className="image-viewer-container">
              {imageUrl && !imageError ? (
                <div className="native-image-wrapper">
                  <img
                    src={imageUrl}
                    alt={task.task_title}
                    className="media-diagram-img"
                    onError={() => setImageError(true)}
                  />
                  <div className="media-file-info">
                    <span>Schematic / Diagram: <code>{task.image_ref_filename}</code></span>
                  </div>
                </div>
              ) : (
                <div className="diagram-placeholder">
                  <div className="diagram-blueprint">
                    <div className="blueprint-header">📐 TECHNICAL SCHEMATIC REFERENCE</div>
                    <div className="blueprint-box">
                      <div className="blueprint-line" />
                      <div className="blueprint-center">{task.task_id} SPECIFICATION</div>
                      <div className="blueprint-line" />
                    </div>
                    <p className="blueprint-notes">
                      Refer to Radar Technical Manual Volume IV for wire loom schematics and connector pinouts.
                    </p>
                    <p className="blueprint-filename">Reference: <code>{task.image_ref_filename || 'Diagram.jpg'}</code></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Task Description Notes */}
          {task.task_description && (
            <div className="media-task-instructions">
              <strong>Instructions:</strong>
              <p>{task.task_description}</p>
              {task.ppe_requirements && (
                <span className="ppe-pill">🦺 PPE: {task.ppe_requirements}</span>
              )}
            </div>
          )}

          {/* Upload bar (Supports all video/image formats) */}
          <div className="media-upload-section">
            <div className="upload-section-left">
              <span className="upload-title">
                {activeTab === 'video' ? 'Attach Video Guide' : 'Attach Technical Diagram'}
              </span>
              <span className="upload-subtitle">
                Supports all formats (.mp4, .webm, .mov, .mkv, .avi, .jpg, .png, .pdf)
              </span>
            </div>

            <div className="upload-actions">
              <input
                ref={fileInputRef}
                type="file"
                id="media-file-input"
                style={{ display: 'none' }}
                accept={activeTab === 'video' ? 'video/*,.mkv,.avi,.mp4,.mov,.webm' : 'image/*,.pdf'}
                onChange={handleFileUpload}
              />
              <button
                className="media-upload-btn"
                disabled={isUploading || !canChecklist}
                onClick={() => fileInputRef.current?.click()}
                title={canChecklist ? 'Select video or image to attach' : 'Restricted to Technician / Admin'}
              >
                {isUploading ? 'Uploading...' : `📤 Upload ${activeTab === 'video' ? 'Video' : 'Diagram'}`}
              </button>
            </div>
          </div>

          {uploadMessage && (
            <div className="upload-status-banner">{uploadMessage}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MediaModal
