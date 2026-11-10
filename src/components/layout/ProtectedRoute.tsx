import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

export function RequireAuth() {
  const { firebaseUser, profile, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!firebaseUser) return <Navigate to="/login" replace />
  if (!profile) return <FullScreenLoader />

  if (profile.status === 'suspended') {
    return <Navigate to="/login" replace state={{ blocked: 'suspended' }} />
  }

  return <Outlet />
}

export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { profile } = useAuth()
  if (!profile) return <FullScreenLoader />
  if (!roles.includes(profile.role)) return <Navigate to="/" replace />
  return <Outlet />
}

export function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
    </div>
  )
}
