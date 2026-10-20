import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchUsers, type AppUser } from '../api'

// Fallback default users if network is offline during initial mount
const DEFAULT_USERS: AppUser[] = [
  { user_id: 'ADMIN001', full_name: 'Radar Admin User', role: 'Administrator', permissions: 'Full access', email: 'admin@radar.mil', status: 'Active' },
  { user_id: 'TECH001', full_name: 'Technician Alpha', role: 'Technician', permissions: 'Checklists & inventory read', email: 'tech1@radar.mil', status: 'Active' },
  { user_id: 'ENG001', full_name: 'Systems Engineer', role: 'Engineer', permissions: 'Schedule/Reschedule/Export', email: 'eng1@radar.mil', status: 'Active' },
  { user_id: 'LOG001', full_name: 'Logistics Officer', role: 'Logistics', permissions: 'Inventory & stock levels', email: 'log1@radar.mil', status: 'Active' },
  { user_id: 'SUP001', full_name: 'Commander / Supervisor', role: 'Supervisor', permissions: 'Overview & approvals', email: 'sup1@radar.mil', status: 'Active' },
]

export type AuthContextType = {
  currentUser: AppUser
  setCurrentUser: (user: AppUser) => void
  users: AppUser[]
  isLoadingUsers: boolean
  canChecklist: boolean
  canAdjustStock: boolean
  canReschedule: boolean
  canUploadExcel: boolean
  userTag: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(DEFAULT_USERS)
  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('rpm_current_user')
    if (saved) {
      try { return JSON.parse(saved) } catch (_) {}
    }
    return DEFAULT_USERS[0]
  })
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        if (data && data.length > 0) {
          setUsers(data)
          // Keep current selection if valid, or sync
          const matched = data.find((u) => u.user_id === currentUser.user_id)
          if (matched) {
            setCurrentUser(matched)
          } else {
            setCurrentUser(data[0])
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load users from backend, using defaults:', err)
      })
      .finally(() => {
        setIsLoadingUsers(false)
      })
  }, [])

  function handleSetUser(user: AppUser) {
    setCurrentUser(user)
    try {
      localStorage.setItem('rpm_current_user', JSON.stringify(user))
    } catch (_) {}
  }

  // Role permissions matrix
  const role = currentUser.role || 'Technician'
  const isAdmin = role.toLowerCase().includes('admin')
  const isTech = role.toLowerCase().includes('tech')
  const isLogistics = role.toLowerCase().includes('logistics')
  const isEng = role.toLowerCase().includes('engineer')
  const isSupervisor = role.toLowerCase().includes('supervisor')

  const canChecklist = isAdmin || isTech
  const canAdjustStock = isAdmin || isLogistics
  const canReschedule = isAdmin || isEng || isSupervisor
  const canUploadExcel = isAdmin

  const userTag = `${currentUser.user_id} - ${currentUser.full_name} (${currentUser.role})`

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetUser,
        users,
        isLoadingUsers,
        canChecklist,
        canAdjustStock,
        canReschedule,
        canUploadExcel,
        userTag,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
