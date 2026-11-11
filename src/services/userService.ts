import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AccountStatus, AppUser, UserRole } from '../types'

const usersCol = collection(db, 'users')

export async function createUserProfile(
  uid: string,
  name: string,
  loginId: string,
  role: UserRole,
  createdBy?: string,
) {
  const profile: Omit<AppUser, 'uid'> = {
    name,
    loginId,
    role,
    status: 'active', // admin-provisioned accounts are active immediately — no approval step
    createdAt: serverTimestamp() as any,
    ...(createdBy ? { createdBy } : {}),
  }
  await setDoc(doc(db, 'users', uid), profile)
  return { ...profile, uid }
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { uid: snap.id, ...(snap.data() as Omit<AppUser, 'uid'>) }
}

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(usersCol)
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AppUser, 'uid'>) }))
}

export async function setUserStatus(uid: string, status: AccountStatus) {
  await updateDoc(doc(db, 'users', uid), { status })
}

export async function setUserRole(uid: string, role: UserRole) {
  await updateDoc(doc(db, 'users', uid), { role })
}

export async function touchLastLogin(uid: string) {
  await updateDoc(doc(db, 'users', uid), { lastLoginAt: serverTimestamp() })
}

/** Deletes the old profile doc after a PIN-reset repoints a Login ID to a new uid. */
export async function deleteUserProfileDoc(uid: string) {
  await deleteDoc(doc(db, 'users', uid))
}
