import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppUser, FollowUp } from '../types'
import { logAudit } from './auditService'
import { updateDisciple } from './discipleService'

const col = collection(db, 'followUps')

export type FollowUpInput = Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>

export async function listFollowUps(user: AppUser): Promise<FollowUp[]> {
  const q =
    user.role === 'administrator'
      ? query(col, orderBy('scheduledDate', 'asc'))
      : query(col, where('workerId', '==', user.uid), orderBy('scheduledDate', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FollowUp, 'id'>) }))
}

export async function createFollowUp(input: FollowUpInput, actor: AppUser) {
  const ref = await addDoc(col, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // Keep the disciple record's nextFollowUpDate in sync for fast dashboard
  // reads (denormalized on purpose — avoids a join-style query per card).
  if (input.status === 'scheduled') {
    await updateDisciple(input.discipleId, { nextFollowUpDate: input.scheduledDate }, actor)
  }
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_follow_up',
    targetType: 'followUp',
    targetId: ref.id,
    details: input.discipleName,
  })
  return ref.id
}

export async function updateFollowUp(id: string, input: Partial<FollowUpInput>, actor: AppUser) {
  await updateDoc(doc(db, 'followUps', id), { ...input, updatedAt: serverTimestamp() })
  if (input.status === 'completed' && input.discipleId && input.completedDate) {
    await updateDisciple(
      input.discipleId,
      { lastFollowUpDate: input.completedDate, nextFollowUpDate: input.nextStepDate },
      actor,
    )
  }
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_follow_up',
    targetType: 'followUp',
    targetId: id,
  })
}
