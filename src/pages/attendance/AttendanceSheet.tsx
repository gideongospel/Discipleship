import { useEffect, useState } from 'react'
import { Plus, X } from '../../components/ui/icons'
import { useAuth } from '../../context/AuthContext'
import { listDisciples } from '../../services/discipleService'
import {
  createAttendanceSession,
  listAttendanceSessions,
  calculateAttendanceStats,
} from '../../services/attendanceService'
import type { AttendanceSession, Disciple, ServiceType } from '../../types'
import { SERVICE_TYPE_LABELS } from '../../types'
import { SERVICE_TYPE_OPTIONS } from '../../utils/constants'
import PageLoader from '../../components/ui/PageLoader'
import EmptyState from '../../components/ui/EmptyState'

export default function AttendanceSheet() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    if (!profile) return
    const [s, d] = await Promise.all([listAttendanceSessions(), listDisciples(profile)])
    setSessions(s)
    setDisciples(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Church Attendance</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Take Attendance
        </button>
      </div>

      {showForm && (
        <TakeAttendanceForm
          disciples={disciples}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            load()
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-display text-xl font-medium">Recent Sessions</h2>
          {sessions.length === 0 ? (
            <EmptyState title="No sessions yet">Take attendance after your next gathering.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.slice(0, 10).map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {SERVICE_TYPE_LABELS[s.serviceType]}
                    {s.title ? ` — ${s.title}` : ''}
                  </span>
                  <span className="text-slate-500">
                    {s.date} · {s.presentDiscipleIds.length} present
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-display text-xl font-medium">Attendance by Disciple</h2>
          {disciples.length === 0 ? (
            <EmptyState title="No disciples yet">Register disciples to track their attendance.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {disciples.map((d) => {
                const stat = calculateAttendanceStats(sessions, d.id, d.dateFirstContacted)
                return (
                  <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{d.name}</span>
                    <span className="text-slate-500">
                      {stat.rate}% ({stat.attended}/{stat.totalSessions})
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function TakeAttendanceForm({
  disciples,
  onClose,
  onSaved,
}: {
  disciples: Disciple[]
  onClose: () => void
  onSaved: () => void
}) {
  const { profile } = useAuth()
  const [serviceType, setServiceType] = useState<ServiceType>('sunday_service')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [title, setTitle] = useState('')
  const [present, setPresent] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggle = (id: string) => {
    setPresent((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await createAttendanceSession(
      { serviceType, date, title: title || undefined, presentDiscipleIds: Array.from(present) },
      profile,
    )
    setSaving(false)
    onSaved()
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="card modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Take Attendance</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="label">Service type</label>
            <select className="input" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
              {SERVICE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="mb-4">
          <label className="label">Title (optional)</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Youth Revival Night" />
        </div>

        <p className="label mb-2">Mark present ({present.size} selected)</p>
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800">
          {disciples.map((d) => (
            <label key={d.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
              <input type="checkbox" checked={present.has(d.id)} onChange={() => toggle(d.id)} />
              {d.name}
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save attendance'}
          </button>
        </div>
      </div>
    </div>
  )
}
