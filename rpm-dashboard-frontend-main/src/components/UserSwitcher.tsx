import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { type AppUser } from '../api'

function roleBadgeColor(role: string): { bg: string; color: string; border: string } {
  const r = role.toLowerCase()
  if (r.includes('admin')) return { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' }
  if (r.includes('tech')) return { bg: '#dcfce7', color: '#15803d', border: '#86efac' }
  if (r.includes('engineer')) return { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' }
  if (r.includes('logistics')) return { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' }
  if (r.includes('supervisor')) return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' }
  return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
}

function UserSwitcher() {
  const { currentUser, setCurrentUser, users } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentColors = roleBadgeColor(currentUser.role)

  return (
    <div className="user-switcher-container" ref={menuRef}>
      <button
        className="user-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch active user / role"
      >
        <span className="user-avatar-circle">
          {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
        </span>
        <div className="user-details-text">
          <span className="user-fullname">{currentUser.full_name}</span>
          <span
            className="user-role-tag"
            style={{
              backgroundColor: currentColors.bg,
              color: currentColors.color,
              borderColor: currentColors.border,
            }}
          >
            {currentUser.role}
          </span>
        </div>
        <span className="user-chevron">▼</span>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <span>SWITCH ACTIVE USER & ROLE</span>
          </div>
          <div className="user-list">
            {users.map((u: AppUser) => {
              const isSelected = u.user_id === currentUser.user_id
              const colors = roleBadgeColor(u.role)
              return (
                <div
                  key={u.user_id}
                  className={`user-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setCurrentUser(u)
                    setIsOpen(false)
                  }}
                >
                  <span className="user-item-avatar">{u.full_name.charAt(0)}</span>
                  <div className="user-item-info">
                    <div className="user-item-top">
                      <span className="user-item-name">{u.full_name}</span>
                      <span
                        className="user-role-tag"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.color,
                          borderColor: colors.border,
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                    <span className="user-item-id">ID: {u.user_id}</span>
                  </div>
                  {isSelected && <span className="user-check">✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserSwitcher
