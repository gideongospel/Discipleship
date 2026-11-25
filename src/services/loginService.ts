import { doc, getDoc, runTransaction, serverTimestamp, setDoc, deleteField } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signOut as signOutSecondary,
} from 'firebase/auth'
import { db, getProvisioningAuth } from '../firebase/config'

const EMAIL_DOMAIN = 'discipleship.local' // synthetic — never a real, deliverable address

function randomDigits(length: number): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const max = 10 ** length
  return String(array[0] % max).padStart(length, '0')
}

export function generatePin(): string {
  return randomDigits(6)
}

async function loginIdExists(loginId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'loginIds', loginId))
  return snap.exists()
}

export async function generateUniqueLoginId(): Promise<string> {
  // 4-digit badge-style ID. Small collision chance at scale — retry a few
  // times rather than failing outright.
  for (let i = 0; i < 10; i++) {
    const candidate = randomDigits(4)
    if (!(await loginIdExists(candidate))) return candidate
  }
  throw new Error('Could not generate a unique login ID — try again.')
}

/** Public lookup used by the login screen: Login ID -> email, nothing secret. */
export async function getEmailForLoginId(loginId: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'loginIds', loginId))
  if (!snap.exists()) return null
  return (snap.data() as { email: string }).email
}

/**
 * Creates a brand-new Firebase Auth account + loginIds mapping using the
 * secondary (provisioning) app instance, so the admin's own session in the
 * primary app is untouched. Returns the new user's uid and email.
 */
export async function provisionAccount(loginId: string, pin: string): Promise<{ uid: string; email: string }> {
  const email = `${loginId}@${EMAIL_DOMAIN}`
  const provisioningAuth = getProvisioningAuth()
  const cred = await createUserWithEmailAndPassword(provisioningAuth, email, pin)
  const uid = cred.user.uid
  await signOutSecondary(provisioningAuth)
  return { uid, email }
}

/**
 * Points an existing Login ID at a new Firebase Auth account (used for PIN
 * resets, since client-side Firebase Auth cannot silently change another
 * user's password without a paid backend function). The OLD account is
 * left orphaned in Firebase Auth — harmless, since its synthetic email is
 * never surfaced anywhere and the loginIds mapping no longer points to it,
 * so it's unreachable through the app's login screen.
 */
export async function repointLoginId(loginId: string, newUid: string, newEmail: string) {
  await setDoc(doc(db, 'loginIds', loginId), { email: newEmail, uid: newUid })
}

export async function createLoginMapping(loginId: string, uid: string, email: string) {
  await setDoc(doc(db, 'loginIds', loginId), { email, uid })
}

// ---- First-run bootstrap ----
// A single public doc records whether an administrator has ever been
// created. Before that, the app shows a one-time setup screen instead of
// login. Firestore rules only allow this doc to flip false -> true once,
// and only alongside creation of a user with role == 'administrator'.
export async function isSystemInitialized(): Promise<boolean> {
  const snap = await getDoc(doc(db, 'meta', 'systemInfo'))
  return snap.exists() && (snap.data() as { adminCreated?: boolean }).adminCreated === true
}

export async function markSystemInitialized() {
  await setDoc(doc(db, 'meta', 'systemInfo'), { adminCreated: true, initializedAt: serverTimestamp() })
}

// Unused helper kept for symmetry / potential future use (e.g. a "delete
// mapping" admin action) — not currently wired to any UI.
export async function clearLoginMapping(loginId: string) {
  await setDoc(doc(db, 'loginIds', loginId), { email: deleteField(), uid: deleteField() }, { merge: true })
}

// Re-export for callers that want an atomic-ish check before creating
export { runTransaction }


/**
 * Permanently assigns Main Administrator to the existing account whose
 * Worker ID is 1156. The transaction and Firestore rules both verify the
 * login mapping and administrator profile; the claim cannot be reassigned.
 */
export async function claimMainAdministrator(uid: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const systemRef = doc(db, 'meta', 'systemInfo')
    const loginRef = doc(db, 'loginIds', '1156')
    const userRef = doc(db, 'users', uid)
    const [systemSnap, loginSnap, userSnap] = await Promise.all([
      transaction.get(systemRef),
      transaction.get(loginRef),
      transaction.get(userRef),
    ])

    if (!systemSnap.exists() || systemSnap.data().adminCreated !== true) {
      throw new Error('The system is not initialized.')
    }
    const existingMainAdminUid = systemSnap.data().mainAdminUid
    if (existingMainAdminUid) {
      if (existingMainAdminUid === uid) return
      throw new Error('A permanent Main Administrator has already been assigned.')
    }
    if (!loginSnap.exists() || loginSnap.data().uid !== uid) {
      throw new Error('Worker ID 1156 does not match this signed-in account.')
    }
    if (!userSnap.exists() || userSnap.data().loginId !== '1156'
      || userSnap.data().role !== 'administrator' || userSnap.data().status !== 'active') {
      throw new Error('Worker ID 1156 must belong to an active administrator account.')
    }

    transaction.update(systemRef, {
      mainAdminUid: uid,
      mainAdminAssignedAt: serverTimestamp(),
    })
  })
}
