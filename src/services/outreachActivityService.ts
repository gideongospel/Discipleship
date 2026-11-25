import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppUser } from '../types'
import { logAudit } from './auditService'

export interface OutreachActivity {
  id: string
  activityName: string
  date: string
  startTime: string
  endTime?: string
  venue: string
  workerIds: string[]
  workerNames: string[]
  peopleReached?: number
  newDisciplesIdentified?: number
  notes?: string
  submittedById: string
  submittedByName: string
  createdAt?: unknown
}

export type OutreachActivityInput = Omit<OutreachActivity, 'id' | 'submittedById' | 'submittedByName' | 'createdAt'>

const records = collection(db, 'outreachActivities')

export async function listOutreachActivities(actor: AppUser): Promise<OutreachActivity[]> {
  const q = actor.role === 'administrator'
    ? query(records, orderBy('date', 'desc'))
    : query(records, where('workerIds', 'array-contains', actor.uid), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OutreachActivity, 'id'>) }))
}

export async function createOutreachActivity(input: OutreachActivityInput, actor: AppUser) {
  const workerIds = Array.from(new Set([...input.workerIds, actor.uid]))
  const ref = await addDoc(records, {
    ...input,
    workerIds,
    submittedById: actor.uid,
    submittedByName: actor.name,
    createdAt: serverTimestamp(),
  })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_outreach_activity',
    targetType: 'outreachActivity',
    targetId: ref.id,
    details: input.activityName,
  })
  return ref.id
}

export async function updateOutreachActivity(id: string, input: Partial<OutreachActivityInput>, actor: AppUser) {
  await updateDoc(doc(db, 'outreachActivities', id), input)
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_outreach_activity',
    targetType: 'outreachActivity',
    targetId: id,
  })
}
