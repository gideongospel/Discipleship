import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export async function logAudit(entry: {
  actorId: string
  actorName: string
  action: string
  targetType: string
  targetId: string
  details?: string
}) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      ...entry,
      timestamp: serverTimestamp(),
    })
  } catch (err) {
    // Audit logging must never block the primary action (e.g. saving a
    // disciple record) — log and swallow.
    console.error('Failed to write audit log', err)
  }
}
