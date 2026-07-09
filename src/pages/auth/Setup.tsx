import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isSystemInitialized } from '../../services/loginService'

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="card w-full max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
            <ShieldCheck className="text-green-600" size={24} />
          </div>
          <h1 className="mb-2 text-lg font-semibold">Administrator account created</h1>
          <p className="mb-4 text-sm text-slate-500">
            Write these down now — the PIN won't be shown again.
          </p>
          <div className="mb-4 space-y-2 rounded-lg bg-slate-50 p-4 text-left dark:bg-slate-800">
            <p className="text-sm">
              <span className="text-slate-500">Worker ID:</span>{' '}
              <span className="font-mono text-lg font-semibold">{result.loginId}</span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">PIN:</span>{' '}
              <span className="font-mono text-lg font-semibold">{result.pin}</span>
            </p>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Continue to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-semibold">Set up Discipleship Tracker</h1>
        <p className="mb-6 text-sm text-slate-500">
          No administrator exists yet. Create the first account — you'll be able to add
          workers and generate their Worker IDs and PINs from the Admin Panel afterward.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Your name</label>
            <input className="input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Choose a PIN (6 digits)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              className="input text-center text-lg tracking-widest"
              {...register('pin', {
                required: 'PIN is required',
                minLength: { value: 6, message: 'PIN must be 6 digits' },
                pattern: { value: /^\d{6}$/, message: 'PIN must be 6 digits' },
              })}
            />
            {errors.pin && <p className="mt-1 text-xs text-red-600">{errors.pin.message}</p>}
          </div>
          <div>
            <label className="label">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              className="input text-center text-lg tracking-widest"
              {...register('confirmPin', {
                validate: (v) => v === watch('pin') || 'PINs do not match',
              })}
            />
            {errors.confirmPin && <p className="mt-1 text-xs text-red-600">{errors.confirmPin.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating...' : 'Create administrator account'}
          </button>
        </form>
      </div>
    </div>
  )
}
