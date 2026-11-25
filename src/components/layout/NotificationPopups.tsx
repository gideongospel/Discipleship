import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarClock, X } from '../ui/icons'
import { useAuth } from '../../context/AuthContext'
import { listFollowUps } from '../../services/followUpService'
import { listChurchEvents } from '../../services/churchEventService'
import { daysFromToday } from '../../utils/format'

interface AppAlert {
  id: string
  title: string
  message: string
  path: string
  priority: 'important' | 'normal'
  kind: 'follow-up' | 'event'
}

function seenKey(uid: string) {
  return `discipleship_seen_alerts_${uid}`
}

function readSeen(uid: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(seenKey(uid)) || '[]')
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []
  } catch {
    return []
  }
}

function saveSeen(uid: string, ids: string[]) {
  localStorage.setItem(seenKey(uid), JSON.stringify(ids.slice(-150)))
}

export default function NotificationPopups() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<AppAlert[]>([])

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    async function load() {
      const [followUps, events] = await Promise.all([listFollowUps(profile!), listChurchEvents(false)])
      if (cancelled) return
      const candidates: AppAlert[] = []

      for (const followUp of followUps) {
        if (!['scheduled', 'postponed', 'pending', 'rescheduled'].includes(followUp.status)) continue
        const days = daysFromToday(followUp.scheduledDate)
        if (days > 0) continue
        candidates.push({
          id: `follow-up:${followUp.id}:${followUp.scheduledDate}`,
          title: days < 0 ? 'Overdue follow-up' : 'Follow-up due today',
          message: `${followUp.discipleName} · ${followUp.purpose || 'Check in with this disciple'}`,
          path: '/follow-ups',
          priority: 'important',
          kind: 'follow-up',
        })
      }

      for (const event of events) {
        const days = daysFromToday(event.date)
        if (days < 0 || days > 1) continue
        candidates.push({
          id: `event:${event.id}:${event.date}`,
          title: days === 0 ? 'Church event today' : 'Church event tomorrow',
          message: `${event.title} · ${event.startTime}`,
          path: '/events',
          priority: 'normal',
          kind: 'event',
        })
      }

      const seen = new Set(readSeen(profile!.uid))
      const fresh = candidates.filter((alert) => !seen.has(alert.id)).slice(0, 4)
      if (fresh.length) {
        saveSeen(profile!.uid, [...seen, ...fresh.map((alert) => alert.id)])
        setAlerts(fresh)
      }
    }

    load().catch(() => {
      if (!cancelled) setAlerts([])
    })
    return () => { cancelled = true }
  }, [profile])

  const dismiss = (id: string) => setAlerts((current) => current.filter((alert) => alert.id !== id))
  const open = (alert: AppAlert) => {
    dismiss(alert.id)
    navigate(alert.path)
  }

  if (!alerts.length) return null

  return (
    <div className="fixed right-3 top-20 z-50 flex w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2" aria-live="polite">
      {alerts.map((alert) => (
        <article key={alert.id} className="card animate-rise border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 ${alert.priority === 'important' ? 'text-amber-600 dark:text-amber-400' : 'text-gold-600 dark:text-gold-400'}`}>
              {alert.kind === 'follow-up' ? <AlertTriangle size={18} /> : <CalendarClock size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{alert.message}</p>
              <div className="mt-3 flex gap-3">
                <button className="link-u text-xs font-semibold" onClick={() => open(alert)}>Open</button>
                <button className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => dismiss(alert.id)}>Dismiss</button>
              </div>
            </div>
            <button aria-label="Dismiss notification" onClick={() => dismiss(alert.id)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={15} /></button>
          </div>
        </article>
      ))}
    </div>
  )
}
