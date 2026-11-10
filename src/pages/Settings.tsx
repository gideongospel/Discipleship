import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useGoogleCalendar } from '../context/GoogleCalendarContext'
import { CalendarCheck } from 'lucide-react'

export default function Settings() {
  const { profile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const calendar = useGoogleCalendar()

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="page-title">Settings</h1>

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
        <h2 className="mb-1 font-semibold">Google Calendar</h2>
        <p className="mb-3 text-xs text-slate-500">
          Connects your <em>personal</em> Google Calendar to receive follow-up reminders. Each worker
          connects their own — there's no shared church calendar. The connection lasts about an hour
          per session; you'll need to reconnect after that or after closing the app.
        </p>

        {calendar.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {calendar.error}
          </p>
        )}

        {calendar.accessToken && !calendar.isLikelyExpired() ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CalendarCheck size={16} /> Connected this session
            </span>
            <button onClick={calendar.disconnect} className="btn-secondary">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={calendar.connect} disabled={calendar.connecting} className="btn-primary w-full">
            <CalendarCheck size={16} /> {calendar.connecting ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
        )}
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
