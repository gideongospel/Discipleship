import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppUser, Disciple } from '../types'
import { logAudit } from './auditService'

const discipleCol = collection(db, 'disciples')

export type DiscipleInput = Omit<
  Disciple,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy' | 'lastEditedAt'
>

// Workers see disciples they're assigned to (array-contains — a disciple
// can have multiple workers); administrators see all.
// This is enforced here AND in firestore.rules — never rely on the client
// check alone, since rules are the actual security boundary.
export async function listDisciples(user: AppUser): Promise<Disciple[]> {
  const q =
    user.role === 'administrator'
      ? query(discipleCol, orderBy('createdAt', 'desc'))
      : query(
          discipleCol,
          where('assignedWorkerIds', 'array-contains', user.uid),
          orderBy('createdAt', 'desc'),
        )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Disciple, 'id'>) }))
}

export async function getDisciple(id: string): Promise<Disciple | null> {
  const snap = await getDoc(doc(db, 'disciples', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<Disciple, 'id'>) }
}

export async function createDisciple(input: DiscipleInput, actor: AppUser) {
  const ref = await addDoc(discipleCol, {
    ...input,
    createdBy: actor.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastEditedBy: actor.name,
    lastEditedAt: serverTimestamp(),
  })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_disciple',
    targetType: 'disciple',
    targetId: ref.id,
    details: input.name,
  })
  return ref.id
}

export async function updateDisciple(
  id: string,
  input: Partial<DiscipleInput>,
  actor: AppUser,
) {
  await updateDoc(doc(db, 'disciples', id), {
    ...input,
    updatedAt: serverTimestamp(),
    // Visible-after-the-fact conflict indicator only — see note on the
    // Disciple type. Does not prevent or merge concurrent offline edits.
    lastEditedBy: actor.name,
    lastEditedAt: serverTimestamp(),
  })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_disciple',
    targetType: 'disciple',
    targetId: id,
  })
}

export async function deleteDisciple(id: string, actor: AppUser) {
  await deleteDoc(doc(db, 'disciples', id))
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'delete_disciple',
    targetType: 'disciple',
    targetId: id,
  })
}
