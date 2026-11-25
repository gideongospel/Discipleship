import {
  addDoc,
  arrayUnion,
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
import type { AppUser } from '../types'
import { logAudit } from './auditService'

export type ChurchResourceType = 'meeting_excerpt' | 'prayer_point'
export type ChurchResourceStatus = 'draft' | 'published' | 'archived'

export interface ChurchResource {
  id: string
  type: ChurchResourceType
  title: string
  date: string
  status: ChurchResourceStatus
  category?: string
  description?: string
  references?: string[]
  expiryDate?: string
  meetingType?: 'sunday_service' | 'bible_study' | 'special_programme'
  minister?: string
  mainPassage?: string
  excerpt?: string
  keyScriptures?: string[]
  teachingPoints?: string[]
  application?: string
  notes?: string
  eventId?: string
  prayedByIds?: string[]
  createdBy: string
  createdByName: string
  createdAt?: unknown
  updatedAt?: unknown
}

export type ChurchResourceInput = Omit<ChurchResource, 'id' | 'createdBy' | 'createdByName' | 'createdAt' | 'updatedAt' | 'prayedByIds'>

const col = collection(db, 'churchResources')

export async function listChurchResources(actor: AppUser, includeUnpublished = false): Promise<ChurchResource[]> {
  const q = actor.role === 'administrator' && includeUnpublished
    ? query(col, orderBy('date', 'desc'))
    : query(col, where('status', '==', 'published'), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChurchResource, 'id'>) }))
}

export async function createChurchResource(input: ChurchResourceInput, actor: AppUser) {
  const ref = await addDoc(col, {
    ...input,
    prayedByIds: [],
    createdBy: actor.uid,
    createdByName: actor.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_church_resource',
    targetType: 'churchResource',
    targetId: ref.id,
    details: input.title,
  })
  return ref.id
}

export async function updateChurchResource(id: string, input: Partial<ChurchResourceInput>, actor: AppUser) {
  await updateDoc(doc(db, 'churchResources', id), { ...input, updatedAt: serverTimestamp() })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_church_resource',
    targetType: 'churchResource',
    targetId: id,
    details: input.title,
  })
}

export async function markPrayerPointPrayed(id: string, actor: AppUser) {
  await updateDoc(doc(db, 'churchResources', id), { prayedByIds: arrayUnion(actor.uid) })
}
