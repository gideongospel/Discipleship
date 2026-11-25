import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X, Check, Pencil } from '../../components/ui/icons'
import { useAuth } from '../../context/AuthContext'
import { useGoogleCalendar } from '../../context/GoogleCalendarContext'
import { createCalendarEvent } from '../../services/googleCalendarService'
import { listDisciples } from '../../services/discipleService'
import { createFollowUp, listFollowUps, updateFollowUp } from '../../services/followUpService'
import type { Disciple, FollowUp, FollowUpStatus } from '../../types'
import PageLoader from '../../components/ui/PageLoader'
import EmptyState from '../../components/ui/EmptyState'

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'text-gold-700 dark:text-gold-300',
  completed: 'text-emerald-700 dark:text-emerald-400',
  missed: 'text-rose-700 dark:text-rose-300',
  rescheduled: 'text-slate-600 dark:text-slate-300',
  postponed: 'text-amber-700 dark:text-amber-300',
  pending: 'text-slate-600 dark:text-slate-300',
}

const ACTIVE_STATUSES: FollowUpStatus[] = ['scheduled', 'postponed', 'pending', 'rescheduled']
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export default function FollowUpTracker() {
  const { profile } = useAuth()
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<FollowUp | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    if (!profile) return
    const [f, d] = await Promise.all([listFollowUps(profile), listDisciples(profile)])
    setFollowUps(f)
    setDisciples(d)
    setLoading(false)
  }

  useEffect(() => { load().catch(() => setLoading(false)) }, [profile])

  const markComplete = async (f: FollowUp) => {
    if (!profile) return
    const summary = prompt('Record the outcome of this follow-up:')
    if (summary === null) return
    await updateFollowUp(f.id, {
      status: 'completed',
      completedDate: today(),
      summary,
      discipleId: f.discipleId,
      nextStepDate: undefined,
    }, profile)
    await load()
  }

  const changeStatus = async (f: FollowUp, status: FollowUpStatus) => {
    if (!profile) return
    if (status === 'postponed') {
      const nextDate = prompt('New follow-up date (YYYY-MM-DD):', f.scheduledDate)
      if (!nextDate) return
      await updateFollowUp(f.id, { status, scheduledDate: nextDate }, profile)
    } else {
      await updateFollowUp(f.id, { status }, profile)
    }
    await load()
  }

  if (loading) return <PageLoader />

  const active = followUps.filter((f) => ACTIVE_STATUSES.includes(f.status))
  const history = followUps.filter((f) => !ACTIVE_STATUSES.includes(f.status))

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Care &amp; connection</p>
          <h1 className="page-title mt-3">Follow-up Tracker</h1>
          <p className="mt-2 text-sm text-slate-500">Schedule, update and keep a record of every discipleship conversation.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={16} /> Schedule Follow-up
        </button>
      </header>

      {showForm && (
        <FollowUpForm
          disciples={disciples}
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); load() }}
        />
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl">Scheduled and pending</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr><th className="th">Disciple</th><th className="th">Purpose</th><th className="th">Scheduled</th><th className="th">Method</th><th className="th">Status</th><th className="th">Worker</th><th className="th"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {active.length === 0 && <tr><td colSpan={7} className="p-0"><EmptyState title="No follow-ups scheduled">Schedule a call, message or visit so no disciple is forgotten.</EmptyState></td></tr>}
              {active.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-medium">{f.discipleName}</td>
                  <td className="px-4 py-3">{f.purpose || 'General check-in'}</td>
                  <td className="px-4 py-3">{f.scheduledDate}{f.scheduledTime ? ` · ${f.scheduledTime}` : ''}</td>
                  <td className="px-4 py-3 capitalize">{f.method || '—'}</td>
                  <td className="px-4 py-3"><span className={`tag capitalize ${STATUS_COLORS[f.status]}`}>{f.status}</span></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{f.workerName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button onClick={() => { setEditing(f); setShowForm(true) }} className="btn-secondary !px-2 !py-1" title="Edit scheduled activity"><Pencil size={13} /></button>
                      <button onClick={() => markComplete(f)} className="btn-secondary !px-2 !py-1"><Check size={13} /> Complete</button>
                      <button onClick={() => changeStatus(f, 'postponed')} className="btn-secondary !px-2 !py-1">Postpone</button>
                      <button onClick={() => changeStatus(f, 'missed')} className="btn-secondary !px-2 !py-1">Missed</button>
                      <button onClick={() => changeStatus(f, 'pending')} className="btn-secondary !px-2 !py-1">Pending</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Follow-up history</h2>
        {history.length === 0 ? <p className="text-sm text-slate-500">Completed and missed activities will be kept here.</p> : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500 dark:border-slate-800"><tr><th className="th">Disciple</th><th className="th">Date</th><th className="th">Status</th><th className="th">Outcome / notes</th><th className="th">Worker</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((f) => <tr key={f.id}><td className="px-4 py-3 font-medium">{f.discipleName}</td><td className="px-4 py-3">{f.completedDate || f.scheduledDate}</td><td className="px-4 py-3"><span className={`tag capitalize ${STATUS_COLORS[f.status]}`}>{f.status}</span></td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{f.summary || f.notes || '—'}</td><td className="px-4 py-3">{f.workerName}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

interface FormValues {
  discipleId: string
  workerId: string
  scheduledDate: string
  scheduledTime: string
  purpose: string
  method: NonNullable<FollowUp['method']>
  notes: string
}

function FollowUpForm({ disciples, initial, onClose, onSaved }: {
  disciples: Disciple[]
  initial: FollowUp | null
  onClose: () => void
  onSaved: () => void
}) {
  const { profile } = useAuth()
  const calendar = useGoogleCalendar()
  const [syncToCalendar, setSyncToCalendar] = useState(false)
  const [syncWarning, setSyncWarning] = useState<string | null>(null)
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: initial ? {
      discipleId: initial.discipleId,
      workerId: initial.workerId,
      scheduledDate: initial.scheduledDate,
      scheduledTime: initial.scheduledTime || '',
      purpose: initial.purpose || '',
      method: initial.method || 'call',
      notes: initial.notes || '',
    } : { scheduledDate: today(), method: 'call' },
  })

  const selectedDiscipleId = watch('discipleId')
  const selectedDisciple = disciples.find((d) => d.id === selectedDiscipleId)

  const onSubmit = async (values: FormValues) => {
    if (!profile) return
    const disciple = disciples.find((d) => d.id === values.discipleId)
    if (!disciple) return
    const workerId = values.workerId || (disciple.assignedWorkerIds.includes(profile.uid) ? profile.uid : disciple.assignedWorkerIds[0])
    const workerIdx = disciple.assignedWorkerIds.indexOf(workerId)
    const workerName = disciple.assignedWorkerNames[workerIdx] ?? profile.name
    const input = {
      discipleId: disciple.id,
      discipleName: disciple.name,
      workerId,
      workerName,
      scheduledDate: values.scheduledDate,
      scheduledTime: values.scheduledTime || undefined,
      purpose: values.purpose,
      method: values.method,
      notes: values.notes || undefined,
      status: 'scheduled' as const,
    }

    if (initial) {
      await updateFollowUp(initial.id, input, profile)
      onSaved()
      return
    }

    await createFollowUp(input, profile)
    if (syncToCalendar && calendar.accessToken) {
      try {
        await createCalendarEvent(calendar.accessToken, {
          title: `Follow-up: ${disciple.name} — ${values.purpose}`,
          description: `Follow-up by ${workerName} via ${values.method}. ${values.notes || ''}`,
          date: values.scheduledDate,
        })
      } catch (err) {
        setSyncWarning(err instanceof Error ? `Follow-up saved, but calendar sync failed: ${err.message}` : 'Follow-up saved, but calendar sync failed.')
        return
      }
    }
    onSaved()
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="card modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-medium">{initial ? 'Update Follow-up' : 'Schedule Follow-up'}</h2><button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button></div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><label className="label">Disciple *</label><select className="input" {...register('discipleId', { required: true })}><option value="">Select disciple</option>{disciples.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          {selectedDisciple && selectedDisciple.assignedWorkerIds.length > 1 && <div><label className="label">Responsible worker *</label><select className="input" {...register('workerId', { required: true })}>{selectedDisciple.assignedWorkerIds.map((uid, i) => <option key={uid} value={uid}>{selectedDisciple.assignedWorkerNames[i]}</option>)}</select></div>}
          <div><label className="label">Purpose *</label><input className="input" required placeholder="e.g. Check on their Bible study progress" {...register('purpose', { required: true })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Date *</label><input type="date" className="input" {...register('scheduledDate', { required: true })} /></div>
            <div><label className="label">Time</label><input type="time" className="input" {...register('scheduledTime')} /></div>
            <div><label className="label">Follow-up method</label><select className="input" {...register('method')}><option value="call">Call</option><option value="whatsapp">WhatsApp</option><option value="visit">Visit</option><option value="meeting">Meeting</option><option value="other">Other</option></select></div>
          </div>
          <div><label className="label">Additional notes</label><textarea className="input" rows={2} {...register('notes')} /></div>
          {!initial && (calendar.accessToken && !calendar.isLikelyExpired() ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={syncToCalendar} onChange={(e) => setSyncToCalendar(e.target.checked)} /> Add to my Google Calendar</label> : <p className="text-xs text-slate-500">You can still schedule follow-ups without connecting Google Calendar.</p>)}
          {syncWarning && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">{syncWarning} <button type="button" onClick={onSaved} className="underline">Dismiss</button></p>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : initial ? 'Save changes' : 'Schedule'}</button></div>
        </form>
      </div>
    </div>
  )
}
