import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'
import AuthShell from '../brand/AuthShell'
import DoorsMark from '../brand/DoorsMark'

export function RequireAuth() {
  const { firebaseUser, profile, profileState, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!firebaseUser) return <Navigate to="/login" replace />
  if (profileState === 'loading') return <FullScreenLoader />
  // Signed in but no usable profile: never spin forever — give a way out.
  if (!profile) return <AccountNotReady failed={profileState === 'error'} />

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
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <DoorsMark size={64} tone="auto" motion="loop" />
    </div>
  )
}

function AccountNotReady({ failed }: { failed: boolean }) {
  const { logout } = useAuth()
  return (
    <AuthShell>
      <p className="eyebrow mb-2">{failed ? 'Connection problem' : 'Account not ready'}</p>
      <h1 className="page-title mb-2">{failed ? 'Couldn\u2019t load your account.' : 'Setup wasn\u2019t finished.'}</h1>
      <p className="mb-7 text-sm text-slate-500 dark:text-slate-400">
        {failed
          ? 'Check your internet connection and try again. If it keeps happening, sign out and sign back in.'
          : 'You are signed in, but no profile was saved for this login \u2014 usually because first-time setup was interrupted. Sign out, then start again.'}
      </p>
      <button onClick={() => window.location.reload()} className="btn-secondary mb-3 w-full py-3.5">
        Try again
      </button>
      <button onClick={logout} className="btn-primary w-full py-3.5">
        Sign out
      </button>
    </AuthShell>
  )
}
