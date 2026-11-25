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
import { logAudit } from './auditService'
import type { AppUser } from '../types'

export type EventCategory = 'regular_meeting' | 'special_programme'
export type EventStatus = 'draft' | 'published' | 'archived'
export type RecurrenceFrequency = 'none' | 'weekly' | 'monthly'

export interface ChurchEvent {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime?: string
  venue: string
  category: EventCategory
  status: EventStatus
  recurrence: RecurrenceFrequency
  recurrenceUntil?: string
  createdBy: string
  createdByName: string
  createdAt?: unknown
  updatedAt?: unknown
}

export type ChurchEventInput = Omit<ChurchEvent, 'id' | 'createdBy' | 'createdByName' | 'createdAt' | 'updatedAt'>

const events = collection(db, 'churchEvents')

export async function listChurchEvents(includeUnpublished = false): Promise<ChurchEvent[]> {
  const q = includeUnpublished
    ? query(events, orderBy('date', 'asc'))
    : query(events, where('status', '==', 'published'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChurchEvent, 'id'>) }))
}

export async function createChurchEvent(input: ChurchEventInput, actor: AppUser) {
  const ref = await addDoc(events, {
    ...input,
    createdBy: actor.uid,
    createdByName: actor.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_church_event',
    targetType: 'churchEvent',
    targetId: ref.id,
    details: input.title,
  })
  return ref.id
}

export async function updateChurchEvent(id: string, input: Partial<ChurchEventInput>, actor: AppUser) {
  await updateDoc(doc(db, 'churchEvents', id), { ...input, updatedAt: serverTimestamp() })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_church_event',
    targetType: 'churchEvent',
    targetId: id,
    details: input.title,
  })
}
