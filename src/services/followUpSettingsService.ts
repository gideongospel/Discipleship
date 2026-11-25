import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppUser } from '../types'
import { logAudit } from './auditService'

export interface FollowUpSettings {
  neglectAfterDays: number
  missedMeetingThreshold: number
  newConvertFollowUpDays: number
}

export const DEFAULT_FOLLOW_UP_SETTINGS: FollowUpSettings = {
  neglectAfterDays: 30,
  missedMeetingThreshold: 3,
  newConvertFollowUpDays: 7,
}

const settingsRef = doc(db, 'appSettings', 'followUp')

export async function getFollowUpSettings(): Promise<FollowUpSettings> {
  const snap = await getDoc(settingsRef)
  if (!snap.exists()) return DEFAULT_FOLLOW_UP_SETTINGS
  const data = snap.data()
  return {
    neglectAfterDays: Number(data.neglectAfterDays) || DEFAULT_FOLLOW_UP_SETTINGS.neglectAfterDays,
    missedMeetingThreshold: Number(data.missedMeetingThreshold) || DEFAULT_FOLLOW_UP_SETTINGS.missedMeetingThreshold,
    newConvertFollowUpDays: Number(data.newConvertFollowUpDays) || DEFAULT_FOLLOW_UP_SETTINGS.newConvertFollowUpDays,
  }
}

export async function saveFollowUpSettings(input: FollowUpSettings, actor: AppUser) {
  await setDoc(settingsRef, { ...input, updatedBy: actor.uid, updatedAt: serverTimestamp() }, { merge: true })
  await logAudit({
    actorId: actor.uid,
    actorName: actor.name,
    action: 'update_follow_up_settings',
    targetType: 'appSettings',
    targetId: 'followUp',
  })
}
