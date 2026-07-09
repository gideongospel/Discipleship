import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppUser, AttendanceSession, ServiceType } from '../types'
import { logAudit } from './auditService'

const col = collection(db, 'attendanceSessions')

export async function listAttendanceSessions(): Promise<AttendanceSession[]> {
  const q = query(col, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AttendanceSession, 'id'>) }))
}

export async function createAttendanceSession(
  input: { serviceType: ServiceType; date: string; title?: string; presentDiscipleIds: string[] },
  actor: AppUser,
) {
  const ref = await addDoc(col, {
    ...input,
    createdBy: actor.uid,
    createdAt: serverTimestamp(),
  })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'create_attendance_session',
    targetType: 'attendanceSession',
    targetId: ref.id,
    details: `${input.serviceType} on ${input.date}`,
  })
  return ref.id
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
 * held since their dateFirstContacted (sessions before they were even
 * contacted don't count against them).
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
