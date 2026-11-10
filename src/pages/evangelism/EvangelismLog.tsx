import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listDisciples } from '../../services/discipleService'
import { createEvangelismRecord, listEvangelismRecords } from '../../services/evangelismService'
import type { Disciple, EvangelismRecord } from '../../types'
import { RECEPTIVITY_LABELS } from '../../types'
import { RECEPTIVITY_OPTIONS, OUTCOME_OPTIONS } from '../../utils/constants'
import { FullScreenLoader } from '../../components/layout/ProtectedRoute'

interface FormValues {
  discipleId: string
  date: string
  time: string
  location: string
  method: string
  discussionSummary: string
  prayerOffered: boolean
  prayerAccepted: boolean
  receptivity: string
  notes: string
  nextFollowUpDate: string
  outcome: string
}

export default function EvangelismLog() {
  const { profile } = useAuth()
  const [records, setRecords] = useState<EvangelismRecord[]>([])
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    if (!profile) return
    const [r, d] = await Promise.all([listEvangelismRecords(profile), listDisciples(profile)])
    setRecords(r)
    setDisciples(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  if (loading) return <FullScreenLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Evangelism Log</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Log Outreach
        </button>
      </div>

      {showForm && (
        <EvangelismForm
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
              <th className="th">Date</th>
              <th className="th">Disciple</th>
              <th className="th">Location</th>
              <th className="th">Method</th>
              <th className="th">Receptivity</th>
              <th className="th">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No evangelism records yet.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3 font-medium">{r.discipleName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.location}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.method}</td>
                <td className="px-4 py-3">{RECEPTIVITY_LABELS[r.receptivity]}</td>
                <td className="px-4 py-3 capitalize">{r.outcome.replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EvangelismForm({
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
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { date: new Date().toISOString().slice(0, 10), receptivity: 'neutral', outcome: 'follow_up_needed' },
  })

  const onSubmit = async (values: FormValues) => {
    if (!profile) return
    const disciple = disciples.find((d) => d.id === values.discipleId)
    if (!disciple) return

    await createEvangelismRecord(
      {
        discipleId: disciple.id,
        discipleName: disciple.name,
        date: values.date,
        time: values.time,
        evangelistId: profile.uid,
        evangelistName: profile.name,
        location: values.location,
        method: values.method,
        discussionSummary: values.discussionSummary,
        prayerOffered: Boolean(values.prayerOffered),
        prayerAccepted: Boolean(values.prayerAccepted),
        receptivity: values.receptivity as EvangelismRecord['receptivity'],
        notes: values.notes,
        assignedWorkerIds: disciple.assignedWorkerIds,
        nextFollowUpDate: values.nextFollowUpDate || undefined,
        outcome: values.outcome as EvangelismRecord['outcome'],
      },
      profile,
    )
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Log Outreach</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" {...register('date', { required: true })} />
            </div>
            <div>
              <label className="label">Time *</label>
              <input type="time" className="input" {...register('time', { required: true })} />
            </div>
          </div>
          <div>
            <label className="label">Location *</label>
            <input className="input" {...register('location', { required: true })} />
          </div>
          <div>
            <label className="label">Method *</label>
            <input className="input" placeholder="e.g. Door-to-door, Street evangelism" {...register('method', { required: true })} />
          </div>
          <div>
            <label className="label">Discussion summary *</label>
            <textarea className="input" rows={3} {...register('discussionSummary', { required: true })} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('prayerOffered')} /> Prayer offered
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('prayerAccepted')} /> Prayer accepted
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Receptivity</label>
              <select className="input" {...register('receptivity')}>
                {RECEPTIVITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Outcome</label>
              <select className="input" {...register('outcome')}>
                {OUTCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Next follow-up date</label>
            <input type="date" className="input" {...register('nextFollowUpDate')} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} {...register('notes')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
