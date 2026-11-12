import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWorkers } from '../../hooks/useWorkers'
import { createDisciple, getDisciple, updateDisciple, type DiscipleInput } from '../../services/discipleService'
import { SPIRITUAL_STATUS_OPTIONS } from '../../utils/constants'
import PageLoader from '../../components/ui/PageLoader'

type FormValues = Omit<DiscipleInput, 'assignedWorkerIds' | 'assignedWorkerNames'>

export default function DiscipleForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { profile } = useAuth()
  const { workers, loading: workersLoading } = useWorkers()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(isEdit)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Shared assignment: any subset of active workers can be attached to a
  // disciple. Defaults to the current user for new registrations.
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(profile ? [profile.uid] : [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      gender: 'male',
      spiritualStatus: 'initially_saved',
    },
  })

  useEffect(() => {
    if (!isEdit || !id) return
    getDisciple(id).then((d) => {
      if (d) {
        reset(d as unknown as FormValues)
        setSelectedWorkerIds(d.assignedWorkerIds ?? [])
      }
      setLoading(false)
    })
  }, [id, isEdit, reset])

  if (loading || workersLoading) return <PageLoader />

  const toggleWorker = (uid: string) => {
    setSelectedWorkerIds((prev) => (prev.includes(uid) ? prev.filter((w) => w !== uid) : [...prev, uid]))
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    if (!profile) return
    if (selectedWorkerIds.length === 0) {
      setSubmitError('Assign at least one worker to this disciple.')
      return
    }
    const assignedWorkerNames = selectedWorkerIds.map(
      (uid) => workers.find((w) => w.uid === uid)?.name ?? uid,
    )

    const payload = { ...values, assignedWorkerIds: selectedWorkerIds, assignedWorkerNames }

    try {
      if (isEdit && id) {
        await updateDisciple(id, payload, profile)
      } else {
        await createDisciple(payload, profile)
      }
      navigate('/disciples')
    } catch (err) {
      console.error(err)
      setSubmitError('Failed to save disciple. Please check your connection and try again.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="page-title">{isEdit ? 'Edit Disciple' : 'New Disciple Registration'}</h1>

      {submitError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name *</label>
            <input className="input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Gender *</label>
            <select className="input" {...register('gender', { required: true })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label">Age</label>
            <input type="number" className="input" {...register('age', { valueAsNumber: true, min: 0 })} />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input className="input" {...register('phone', { required: 'Phone is required' })} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email')} />
          </div>
          <div>
            <label className="label">Occupation</label>
            <input className="input" {...register('occupation')} />
          </div>
        </div>

        <div>
          <label className="label">Address *</label>
          <input className="input" {...register('address', { required: 'Address is required' })} />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Date first contacted *</label>
            <input
              type="date"
              className="input"
              {...register('dateFirstContacted', { required: 'Date is required' })}
            />
            {errors.dateFirstContacted && (
              <p className="mt-1 text-xs text-red-600">{errors.dateFirstContacted.message}</p>
            )}
          </div>
          <div>
            <label className="label">Outreach / church location *</label>
            <input className="input" {...register('outreachLocation', { required: 'Location is required' })} />
            {errors.outreachLocation && (
              <p className="mt-1 text-xs text-red-600">{errors.outreachLocation.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label">Spiritual status *</label>
          <select className="input" {...register('spiritualStatus', { required: true })}>
            {SPIRITUAL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Assigned worker(s) *</label>
          <p className="mb-2 text-xs text-slate-500">
            A disciple can be shared by more than one worker. Select everyone who should have access.
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-300 p-2 dark:border-slate-700">
            {workers.map((w) => (
              <label key={w.uid} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={selectedWorkerIds.includes(w.uid)}
                  onChange={() => toggleWorker(w.uid)}
                />
                {w.name} {w.uid === profile?.uid && '(you)'}
              </label>
            ))}
          </div>
          {selectedWorkerIds.length === 0 && (
            <p className="mt-1 text-xs text-red-600">Select at least one worker.</p>
          )}
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} {...register('notes')} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Register disciple'}
          </button>
        </div>
      </form>
    </div>
  )
}
