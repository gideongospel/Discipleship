import { useEffect, useState, type FormEvent } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useGoogleCalendar } from '../context/GoogleCalendarContext'
import { CalendarCheck } from '../components/ui/icons'
import { DEFAULT_FOLLOW_UP_SETTINGS, getFollowUpSettings, saveFollowUpSettings, type FollowUpSettings } from '../services/followUpSettingsService'

export default function Settings() {
  const { profile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const calendar = useGoogleCalendar()
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSettings>(DEFAULT_FOLLOW_UP_SETTINGS)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')

  useEffect(() => {
    if (profile?.role !== 'administrator') return
    getFollowUpSettings().then(setFollowUpSettings).catch(() => setSettingsMessage('Unable to load follow-up settings.'))
  }, [profile])

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault()
    if (!profile || profile.role !== 'administrator') return
    setSettingsSaving(true)
    setSettingsMessage('')
    try {
      await saveFollowUpSettings(followUpSettings, profile)
      setSettingsMessage('Follow-up thresholds saved.')
    } catch {
      setSettingsMessage('Unable to save settings. Check your connection and permissions.')
    } finally {
      setSettingsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="page-title">Settings</h1>

      <div className="card p-5">
        <h2 className="mb-3 font-display text-xl font-medium">Profile</h2>
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
        <h2 className="mb-1 font-display text-xl font-medium">Google Calendar</h2>
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

      {profile?.role === 'administrator' && (
        <form onSubmit={saveSettings} className="card space-y-4 p-5">
          <div><h2 className="font-display text-xl font-medium">Shepherding thresholds</h2><p className="mt-1 text-xs text-slate-500">These settings guide reminders only. They do not rate spiritual maturity or faithfulness.</p></div>
          <label className="block text-sm">Flag a disciple when no follow-up is recorded for (days)<input className="input mt-1" type="number" min="1" max="365" required value={followUpSettings.neglectAfterDays} onChange={(event) => setFollowUpSettings((current) => ({ ...current, neglectAfterDays: Number(event.target.value) }))} /></label>
          <label className="block text-sm">Missed meetings before a reminder<input className="input mt-1" type="number" min="1" max="20" required value={followUpSettings.missedMeetingThreshold} onChange={(event) => setFollowUpSettings((current) => ({ ...current, missedMeetingThreshold: Number(event.target.value) }))} /></label>
          <label className="block text-sm">New convert follow-up interval (days)<input className="input mt-1" type="number" min="1" max="60" required value={followUpSettings.newConvertFollowUpDays} onChange={(event) => setFollowUpSettings((current) => ({ ...current, newConvertFollowUpDays: Number(event.target.value) }))} /></label>
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{settingsMessage}</p><button className="btn-primary" disabled={settingsSaving}>{settingsSaving ? 'Saving…' : 'Save thresholds'}</button></div>
        </form>
      )}

      <div className="card p-5">
        <h2 className="mb-3 font-display text-xl font-medium">Appearance</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm">Dark mode</span>
          <button
            role="switch"
            aria-checked={theme === 'dark'}
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-md transition-colors duration-300 ${theme === 'dark' ? 'bg-gold-500' : 'bg-slate-300'}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded bg-white shadow-sm transition-transform duration-300 ease-out ${theme === 'dark' ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
