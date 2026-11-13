import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { createUserProfile, getUserProfile, touchLastLogin } from '../services/userService'
import {
  createLoginMapping,
  generateUniqueLoginId,
  getEmailForLoginId,
  markSystemInitialized,
} from '../services/loginService'
import { logAudit } from '../services/auditService'
import type { AppUser } from '../types'

// 'missing' = signed in to Firebase but no profile document exists (e.g. an
// interrupted first-time setup). The UI must offer a way out, never a spinner.
type ProfileState = 'none' | 'loading' | 'ready' | 'missing' | 'error'

interface AuthContextValue {
  firebaseUser: User | null
  profile: AppUser | null
  profileState: ProfileState
  loading: boolean
  loginWithPin: (loginId: string, pin: string) => Promise<void>
  setupFirstAdmin: (name: string, pin: string) => Promise<{ loginId: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Auto-logout after this much idle time (ms). Church-office shared
// computers are the main reason this exists.
const IDLE_TIMEOUT_MS = 20 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileState, setProfileState] = useState<ProfileState>('none')
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        setProfileState('loading')
        try {
          const p = await getUserProfile(user.uid)
          setProfile(p)
          setProfileState(p ? 'ready' : 'missing')
        } catch (err) {
          console.error('Could not load profile', err)
          setProfile(null)
          setProfileState('error')
        }
      } else {
        setProfile(null)
        setProfileState('none')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Idle-timeout auto-logout
  useEffect(() => {
    if (!firebaseUser) return

    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        signOut(auth)
      }, IDLE_TIMEOUT_MS)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [firebaseUser])

  const loginWithPin = async (loginId: string, pin: string) => {
    const email = await getEmailForLoginId(loginId.trim())
    if (!email) {
      // Deliberately vague — don't reveal whether the Login ID exists.
      throw { code: 'auth/invalid-credential' }
    }
    const cred = await signInWithEmailAndPassword(auth, email, pin)
    const p = await getUserProfile(cred.user.uid)
    setProfile(p)
    setProfileState(p ? 'ready' : 'missing')
    // Recording the last-login time is housekeeping. It must never block a valid
    // sign-in (a worker may not be permitted to write to their own profile).
    try {
      await touchLastLogin(cred.user.uid)
    } catch (err) {
      console.warn('Could not record last login time', err)
    }
    await logAudit({
      actorId: cred.user.uid,
      actorName: p?.name ?? loginId,
      action: 'login',
      targetType: 'user',
      targetId: cred.user.uid,
    })
  }

  // One-time bootstrap: the very first administrator, before any accounts
  // exist. After this runs once, firestore.rules block it from running
  // again (meta/systemInfo.adminCreated flips to true).
  const setupFirstAdmin = async (name: string, pin: string) => {
    const loginId = await generateUniqueLoginId()
    const email = `${loginId}@discipleship.local`
    const cred = await createUserWithEmailAndPassword(auth, email, pin)
    await createLoginMapping(loginId, cred.user.uid, email)
    const p = await createUserProfile(cred.user.uid, name, loginId, 'administrator')
    await markSystemInitialized()
    setProfile(p as AppUser)
    setProfileState('ready')
    await logAudit({
      actorId: cred.user.uid,
      actorName: name,
      action: 'setup_first_admin',
      targetType: 'user',
      targetId: cred.user.uid,
    })
    return { loginId }
  }

  const logout = async () => {
    if (firebaseUser) {
      await logAudit({
        actorId: firebaseUser.uid,
        actorName: profile?.name ?? 'unknown',
        action: 'logout',
        targetType: 'user',
        targetId: firebaseUser.uid,
      })
    }
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, profileState, loading, loginWithPin, setupFirstAdmin, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
