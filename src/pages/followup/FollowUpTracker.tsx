import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listDisciples } from '../../services/discipleService'
import { createFollowUp, listFollowUps, updateFollowUp } from '../../services/followUpService'
import type { Disciple, FollowUp } from '../../types'
import { FullScreenLoader } from '../../components/layout/ProtectedRoute'

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400',
  completed: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  missed: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  rescheduled: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
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

  if (loading) return <FullScreenLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Follow-up Tracker</h1>
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
              <th className="px-4 py-3">Disciple</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Worker</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {followUps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No follow-ups scheduled.
                </td>
              </tr>
            )}
            {followUps.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium">{f.discipleName}</td>
                <td className="px-4 py-3">{f.scheduledDate}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[f.status]}`}>
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
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Schedule Follow-up</h2>
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
