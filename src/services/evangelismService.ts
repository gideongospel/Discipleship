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
import type { AppUser, EvangelismRecord } from '../types'
import { logAudit } from './auditService'

const col = collection(db, 'evangelismRecords')

export type EvangelismInput = Omit<EvangelismRecord, 'id' | 'createdAt'>

export async function listEvangelismRecords(user: AppUser, discipleId?: string) {
  const clauses = []
  if (discipleId) clauses.push(where('discipleId', '==', discipleId))
  if (user.role !== 'administrator') clauses.push(where('assignedWorkerIds', 'array-contains', user.uid))

  const q = query(col, ...clauses, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EvangelismRecord, 'id'>) }))
}

export async function createEvangelismRecord(input: EvangelismInput, actor: AppUser) {
  const ref = await addDoc(col, { ...input, createdAt: serverTimestamp() })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_evangelism_record',
    targetType: 'evangelismRecord',
    targetId: ref.id,
    details: input.discipleName,
  })
  return ref.id
}

export async function updateEvangelismRecord(
  id: string,
  input: Partial<EvangelismInput>,
  actor: AppUser,
) {
  await updateDoc(doc(db, 'evangelismRecords', id), input)
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_evangelism_record',
    targetType: 'evangelismRecord',
    targetId: id,
  })
}
