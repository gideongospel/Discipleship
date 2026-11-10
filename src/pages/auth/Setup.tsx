import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isSystemInitialized } from '../../services/loginService'
import AuthShell from '../../components/brand/AuthShell'

interface FormValues {
  name: string
  pin: string
  confirmPin: string
}

export default function Setup() {
  const { setupFirstAdmin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ loginId: string; pin: string } | null>(null)
  const [checking, setChecking] = useState(true)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  useEffect(() => {
    isSystemInitialized().then((initialized) => {
      if (initialized) {
        navigate('/login', { replace: true })
      } else {
        setChecking(false)
      }
    })
  }, [navigate])

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const { loginId } = await setupFirstAdmin(values.name, values.pin)
      setResult({ loginId, pin: values.pin })
    } catch (err: any) {
      setError(err?.code === 'auth/weak-password' ? 'PIN must be at least 6 digits.' : 'Setup failed. Please try again.')
    }
  }

  if (checking) return null

  if (result) {
    return (
      <AuthShell>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15">
          <ShieldCheck className="text-emerald-500" size={24} />
        </div>
        <h1 className="page-title mb-2">Administrator created.</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Write these down now — the PIN will not be shown again.
        </p>
        <div className="mb-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="label !mb-0">Worker ID</span>
            <span className="font-display text-xl font-extrabold tracking-[0.2em]">{result.loginId}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="label !mb-0">PIN</span>
            <span className="font-display text-xl font-extrabold tracking-[0.2em]">{result.pin}</span>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary w-full py-3.5">
          Continue to dashboard
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <p className="eyebrow mb-2">First-time setup</p>
      <h1 className="page-title mb-2">Open the doors.</h1>
      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        No administrator exists yet. Create the first account — you'll add workers and generate their
        Worker IDs and PINs from the Admin Panel.
      </p>

      {error && (
        <p className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Your name</label>
          <input className="input py-3" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Choose a PIN (6 digits)</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            className="input py-3.5 text-center font-display text-xl font-bold tracking-[0.5em]"
            {...register('pin', {
              required: 'PIN is required',
              minLength: { value: 6, message: 'PIN must be 6 digits' },
              pattern: { value: /^\d{6}$/, message: 'PIN must be 6 digits' },
            })}
          />
          {errors.pin && <p className="mt-1.5 text-xs text-rose-600">{errors.pin.message}</p>}
        </div>
        <div>
          <label className="label">Confirm PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            className="input py-3.5 text-center font-display text-xl font-bold tracking-[0.5em]"
            {...register('confirmPin', { validate: (v) => v === watch('pin') || 'PINs do not match' })}
          />
          {errors.confirmPin && <p className="mt-1.5 text-xs text-rose-600">{errors.confirmPin.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
          {isSubmitting ? 'Creating…' : 'Create administrator account'}
        </button>
      </form>
    </AuthShell>
  )
}
