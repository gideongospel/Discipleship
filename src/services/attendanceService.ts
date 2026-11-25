import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  runTransaction,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppUser, AttendanceSession, ServiceType } from '../types'
import { logAudit } from './auditService'

const col = collection(db, 'attendanceSessions')
const attendanceRecords = collection(db, 'attendanceRecords')

export interface AttendanceRecord {
  id: string
  sessionId: string
  sessionTitle: string
  personId: string
  personName: string
  personType: 'disciple' | 'worker'
  date: string
  recordedBy: string
  recordedByName: string
  method: 'self_recorded' | 'worker_recorded'
  createdAt?: unknown
}

export async function listAttendanceSessions(): Promise<AttendanceSession[]> {
  const q = query(col, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AttendanceSession, 'id'>) }))
}

export async function listAttendanceRecords(personId: string): Promise<AttendanceRecord[]> {
  const q = query(attendanceRecords, where('personId', '==', personId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<AttendanceRecord, 'id'>) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function createAttendanceSession(
  input: { serviceType: ServiceType; date: string; title?: string; presentDiscipleIds: string[]; presentDiscipleNames?: Record<string, string> },
  actor: AppUser,
) {
  const title = input.title || input.serviceType.replace(/_/g, ' ')
  const titleKey = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').slice(0, 80)
  const sessionId = `${input.serviceType}_${input.date}_${titleKey}`
  const sessionRef = doc(col, sessionId)
  const uniqueDiscipleIds = Array.from(new Set(input.presentDiscipleIds))
  const legacySessions = await listAttendanceSessions()
  const duplicateLegacy = legacySessions.some((session) =>
    session.date === input.date
    && session.serviceType === input.serviceType
    && (session.title || session.serviceType.replace(/_/g, ' ')) === title,
  )
  if (duplicateLegacy) throw new Error('Attendance has already been created for this meeting and date. Open the existing session instead.')

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(sessionRef)
    if (existing.exists()) {
      throw new Error('Attendance has already been created for this meeting and date. Open the existing session instead.')
    }
    transaction.set(sessionRef, {
      ...input,
      presentDiscipleIds: uniqueDiscipleIds,
      createdBy: actor.uid,
      createdAt: serverTimestamp(),
    })
    for (const discipleId of uniqueDiscipleIds) {
      const recordRef = doc(attendanceRecords, `${sessionId}_${discipleId}`)
      transaction.set(recordRef, {
        sessionId,
        sessionTitle: title,
        personId: discipleId,
        personName: input.presentDiscipleNames?.[discipleId] || discipleId,
        personType: 'disciple',
        date: input.date,
        recordedBy: actor.uid,
        recordedByName: actor.name,
        method: 'worker_recorded',
        createdAt: serverTimestamp(),
      })
    }
  })

  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_attendance_session',
    targetType: 'attendanceSession',
    targetId: sessionId,
    details: `${input.serviceType} on ${input.date}`,
  })
  return sessionId
}

export async function recordSelfAttendance(session: AttendanceSession, actor: AppUser) {
  const recordRef = doc(attendanceRecords, `${session.id}_${actor.uid}`)
  const sessionRef = doc(db, 'attendanceSessions', session.id)
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(recordRef)
    if (existing.exists()) throw new Error('Attendance has already been recorded for you at this meeting.')
    transaction.set(recordRef, {
      sessionId: session.id,
      sessionTitle: session.title || session.serviceType.replace(/_/g, ' '),
      personId: actor.uid,
      personName: actor.name,
      personType: 'worker',
      date: session.date,
      recordedBy: actor.uid,
      recordedByName: actor.name,
      method: 'self_recorded',
      createdAt: serverTimestamp(),
    })
    transaction.update(sessionRef, { presentDiscipleIds: arrayUnion(actor.uid) })
  })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'self_record_attendance',
    targetType: 'attendanceSession',
    targetId: session.id,
  })
}

export async function updateAttendanceSession(
  id: string,
  presentDiscipleIds: string[],
  actor: AppUser,
) {
  await updateDoc(doc(db, 'attendanceSessions', id), { presentDiscipleIds })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_attendance_session',
    targetType: 'attendanceSession',
    targetId: id,
  })
}

/**
 * Attendance % for a disciple = sessions they attended / total sessions
 * since their dateFirstContacted. Older sessions remain compatible with the
 * original presentDiscipleIds field; the attendanceRecords collection adds
 * recorder and recording-method detail without migrating existing sessions.
 */
export function calculateAttendanceStats(
  sessions: AttendanceSession[],
  discipleId: string,
  sinceDate?: string,
) {
  const eligible = sinceDate
    ? sessions.filter((s) => s.date >= sinceDate)
    : sessions
  const attended = eligible.filter((s) => s.presentDiscipleIds.includes(discipleId))
  const missed = eligible.length - attended.length
  const rate = eligible.length === 0 ? 0 : Math.round((attended.length / eligible.length) * 100)
  return { totalSessions: eligible.length, attended: attended.length, missed, rate }
}
