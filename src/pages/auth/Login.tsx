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
  const [showPin, setShowPin] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(window.localStorage.getItem('discipleship.rememberedWorkerId'))
  })
  const rememberedWorkerId = window.localStorage.getItem('discipleship.rememberedWorkerId') ?? ''
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { loginId: rememberedWorkerId } })

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
      await loginWithPin(values.loginId, values.pin, rememberMe)
      if (rememberMe) {
        window.localStorage.setItem('discipleship.rememberedWorkerId', values.loginId.trim())
      } else {
        window.localStorage.removeItem('discipleship.rememberedWorkerId')
      }
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
        <p className="mb-5 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3.5 py-2.5 text-sm text-gold-700 dark:text-gold-300">
          Your account has been {location.state.blocked}. Contact an administrator.
        </p>
      )}
      {error && (
        <p className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-300">
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
            className="input py-3.5 text-center font-display text-2xl font-medium tracking-[0.45em]"
            placeholder="0000"
            {...register('loginId', { required: 'Worker ID is required' })}
          />
          {errors.loginId && <p className="mt-1.5 text-xs text-rose-600">{errors.loginId.message}</p>}
        </div>
        <div>
          <label className="label">PIN</label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={6}
              className="input py-3.5 pr-16 text-center font-display text-2xl font-medium tracking-[0.45em]"
              placeholder="••••••"
              {...register('pin', { required: 'PIN is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPin((visible) => !visible)}
              className="absolute inset-y-0 right-3 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.pin && <p className="mt-1.5 text-xs text-rose-600">{errors.pin.message}</p>}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Remember me
        </label>
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
    case 'auth/network-request-failed':
      return 'No internet connection. Check your data and try again.'
    case 'permission-denied':
      return 'Your account could not be loaded. Please contact an administrator.'
    default:
      return `Unable to sign in${code ? ` (${code})` : ''}. Please try again.`
  }
}
