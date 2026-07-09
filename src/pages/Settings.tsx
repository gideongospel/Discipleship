import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { profile } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">Profile</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium">{profile?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Worker ID</dt>
            <dd className="font-mono font-medium">{profile?.loginId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium capitalize">{profile?.role}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">
          To change your PIN, ask an administrator to reset it from the Admin Panel.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">Appearance</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm">Dark mode</span>
          <button onClick={toggleTheme} className="btn-secondary">
            {theme === 'dark' ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  )
}
