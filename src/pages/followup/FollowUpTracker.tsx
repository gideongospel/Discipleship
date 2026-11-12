import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X, Check } from '../../components/ui/icons'
import { useAuth } from '../../context/AuthContext'
import { useGoogleCalendar } from '../../context/GoogleCalendarContext'
import { createCalendarEvent } from '../../services/googleCalendarService'
import { listDisciples } from '../../services/discipleService'
import { createFollowUp, listFollowUps, updateFollowUp } from '../../services/followUpService'
import type { Disciple, FollowUp } from '../../types'
import PageLoader from '../../components/ui/PageLoader'
import EmptyState from '../../components/ui/EmptyState'

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'text-gold-700 dark:text-gold-300',
  completed: 'text-emerald-700 dark:text-emerald-400',
  missed: 'text-rose-700 dark:text-rose-300',
  rescheduled: 'text-slate-600 dark:text-slate-300',
}

export default function FollowUpTracker() {
  const { profile } = useAuth()
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    if (!profile) return
    const [f, d] = await Promise.all([listFollowUps(profile), listDisciples(profile)])
    setFollowUps(f)
    setDisciples(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const markComplete = async (f: FollowUp) => {
    if (!profile) return
    const summary = prompt('Follow-up summary (optional):') ?? ''
    await updateFollowUp(
      f.id,
      {
        status: 'completed',
        completedDate: new Date().toISOString().slice(0, 10),
        summary,
        discipleId: f.discipleId,
      },
      profile,
    )
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Follow-up Tracker</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Schedule Follow-up
        </button>
      </div>

      {showForm && (
        <FollowUpForm
          disciples={disciples}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            load()
          }}
        />
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="th">Disciple</th>
              <th className="th">Scheduled</th>
              <th className="th">Status</th>
              <th className="th">Worker</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {followUps.length === 0 && (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState title="No follow-ups scheduled">Schedule a visit so no disciple is forgotten.</EmptyState>
                </td>
              </tr>
            )}
            {followUps.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium">{f.discipleName}</td>
                <td className="px-4 py-3">{f.scheduledDate}</td>
                <td className="px-4 py-3">
                  <span className={`tag capitalize ${STATUS_COLORS[f.status]}`}>
                    {f.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{f.workerName}</td>
                <td className="px-4 py-3 text-right">
                  {f.status === 'scheduled' && (
                    <button onClick={() => markComplete(f)} className="btn-secondary !px-2 !py-1">
                      <Check size={14} /> Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface FormValues {
  discipleId: string
  workerId: string
  scheduledDate: string
}

function FollowUpForm({
  disciples,
  onClose,
  onSaved,
}: {
  disciples: Disciple[]
  onClose: () => void
  onSaved: () => void
}) {
  const { profile } = useAuth()
  const calendar = useGoogleCalendar()
  const [syncToCalendar, setSyncToCalendar] = useState(false)
  const [syncWarning, setSyncWarning] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>()

  const selectedDiscipleId = watch('discipleId')
  const selectedDisciple = disciples.find((d) => d.id === selectedDiscipleId)

  const onSubmit = async (values: FormValues) => {
    if (!profile) return
    const disciple = disciples.find((d) => d.id === values.discipleId)
    if (!disciple) return
    // A follow-up task needs exactly one responsible worker even though the
    // disciple can be shared by several — default to whoever is picked, or
    // the first assigned worker if the disciple only has one.
    const workerId = values.workerId || disciple.assignedWorkerIds[0]
    const workerIdx = disciple.assignedWorkerIds.indexOf(workerId)
    const workerName = disciple.assignedWorkerNames[workerIdx] ?? disciple.assignedWorkerNames[0]

    // The Firestore write is the source of truth and always happens first.
    // Calendar sync is best-effort and runs after — its failure never
    // rolls back or blocks the follow-up itself.
    await createFollowUp(
      {
        discipleId: disciple.id,
        discipleName: disciple.name,
        workerId,
        workerName,
        scheduledDate: values.scheduledDate,
        status: 'scheduled',
      },
      profile,
    )

    if (syncToCalendar && calendar.accessToken) {
      try {
        await createCalendarEvent(calendar.accessToken, {
          title: `Follow-up: ${disciple.name}`,
          description: `Discipleship Tracker follow-up with ${disciple.name}, assigned to ${workerName}.`,
          date: values.scheduledDate,
        })
      } catch (err) {
        // Deliberately swallowed beyond a visible warning — the follow-up
        // already saved successfully above, so this is not a failure of
        // the core action, just of the optional add-on.
        setSyncWarning(
          err instanceof Error
            ? `Follow-up saved, but calendar sync failed: ${err.message}`
            : 'Follow-up saved, but calendar sync failed.',
        )
        return
      }
    }

    onSaved()
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="card modal-panel w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Schedule Follow-up</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">Disciple *</label>
            <select className="input" {...register('discipleId', { required: true })}>
              <option value="">Select disciple</option>
              {disciples.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          {selectedDisciple && selectedDisciple.assignedWorkerIds.length > 1 && (
            <div>
              <label className="label">Responsible worker *</label>
              <select className="input" {...register('workerId', { required: true })}>
                {selectedDisciple.assignedWorkerIds.map((uid, i) => (
                  <option key={uid} value={uid}>
                    {selectedDisciple.assignedWorkerNames[i]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Scheduled date *</label>
            <input type="date" className="input" {...register('scheduledDate', { required: true })} />
          </div>

          {calendar.accessToken && !calendar.isLikelyExpired() ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={syncToCalendar} onChange={(e) => setSyncToCalendar(e.target.checked)} />
              Add to my Google Calendar
            </label>
          ) : (
            <p className="text-xs text-slate-500">
              Connect Google Calendar in Settings to add this follow-up as a reminder there too.
            </p>
          )}

          {syncWarning && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              {syncWarning}{' '}
              <button type="button" onClick={onSaved} className="underline">
                Dismiss
              </button>
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
