import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { isSystemInitialized } from '../../services/loginService'

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-slate-500">Enter the Worker ID and PIN your administrator gave you.</p>

        {location.state?.blocked && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            Your account has been {location.state.blocked}. Contact an administrator.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Worker ID</label>
            <input
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              className="input text-center text-lg tracking-widest"
              placeholder="0000"
              {...register('loginId', { required: 'Worker ID is required' })}
            />
            {errors.loginId && <p className="mt-1 text-xs text-red-600">{errors.loginId.message}</p>}
          </div>
          <div>
            <label className="label">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              className="input text-center text-lg tracking-widest"
              placeholder="••••••"
              {...register('pin', { required: 'PIN is required' })}
            />
            {errors.pin && <p className="mt-1 text-xs text-red-600">{errors.pin.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Forgot your Worker ID or PIN? Ask an administrator to look it up or reset it for you.
        </p>
      </div>
    </div>
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
