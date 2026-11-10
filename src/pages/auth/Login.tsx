import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { isSystemInitialized } from '../../services/loginService'
import AuthShell from '../../components/brand/AuthShell'

interface FormValues {
  loginId: string
  pin: string
}

export default function Login() {
  const { loginWithPin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { blocked?: string } }
  const [error, setError] = useState<string | null>(null)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  useEffect(() => {
    isSystemInitialized().then((initialized) => {
      if (!initialized) {
        navigate('/setup', { replace: true })
      } else {
        setCheckingSetup(false)
      }
    })
  }, [navigate])

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await loginWithPin(values.loginId, values.pin)
      navigate('/')
    } catch (err: any) {
      setError(mapAuthError(err?.code))
    }
  }

  if (checkingSetup) return null

  return (
    <AuthShell>
      <p className="eyebrow mb-2">Sign in</p>
      <h1 className="page-title mb-2">Welcome back.</h1>
      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        Enter the Worker ID and PIN your administrator gave you.
      </p>

      {location.state?.blocked && (
        <p className="mb-5 rounded-xl border border-gold-500/30 bg-gold-500/10 px-3.5 py-2.5 text-sm text-gold-700 dark:text-gold-300">
          Your account has been {location.state.blocked}. Contact an administrator.
        </p>
      )}
      {error && (
        <p className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Worker ID</label>
          <input
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            className="input py-3.5 text-center font-display text-xl font-bold tracking-[0.5em]"
            placeholder="0000"
            {...register('loginId', { required: 'Worker ID is required' })}
          />
          {errors.loginId && <p className="mt-1.5 text-xs text-rose-600">{errors.loginId.message}</p>}
        </div>
        <div>
          <label className="label">PIN</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            className="input py-3.5 text-center font-display text-xl font-bold tracking-[0.5em]"
            placeholder="••••••"
            {...register('pin', { required: 'PIN is required' })}
          />
          {errors.pin && <p className="mt-1.5 text-xs text-rose-600">{errors.pin.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
          {isSubmitting ? 'Signing in…' : 'Enter'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-500">
        Forgot your Worker ID or PIN? Ask an administrator to look it up or reset it.
      </p>
    </AuthShell>
  )
}

function mapAuthError(code?: string) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect Worker ID or PIN.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    default:
      return 'Unable to sign in. Please try again.'
  }
}
