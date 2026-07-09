import type { Timestamp } from 'firebase/firestore'

// ---------- Users & Auth ----------

export type UserRole = 'administrator' | 'worker'
export type AccountStatus = 'active' | 'suspended'

export interface AppUser {
  uid: string
  name: string
  // Short, non-secret ID a worker types alongside their PIN to log in.
  // Not secret — think "badge number", not password.
  loginId: string
  role: UserRole
  status: AccountStatus
  createdAt: Timestamp
  createdBy?: string
  lastLoginAt?: Timestamp
}

// ---------- Disciples ----------

export type Gender = 'male' | 'female'

export type SpiritualStatus =
  | 'initially_saved'
  | 'saved_through_us'
  | 'filled_with_holy_spirit_through_us'
  | 'saved_and_filled_through_us'
  | 'still_unsaved'
  | 'under_discipleship'
  | 'joined_the_church'
  | 'became_a_worker'

export const SPIRITUAL_STATUS_LABELS: Record<SpiritualStatus, string> = {
  initially_saved: 'Initially Saved',
  saved_through_us: 'Saved Through Us',
  filled_with_holy_spirit_through_us: 'Filled with the Holy Spirit Through Us',
  saved_and_filled_through_us: 'Saved and Filled Through Us',
  still_unsaved: 'Still Unsaved',
  under_discipleship: 'Under Discipleship',
  joined_the_church: 'Joined the Church',
  became_a_worker: 'Became a Worker',
}

export interface Disciple {
  id: string
  name: string
  gender: Gender
  age?: number
  address: string
  phone: string
  email?: string
  occupation?: string
  dateFirstContacted: string // ISO date
  outreachLocation: string
  spiritualStatus: SpiritualStatus
  // Multiple workers can be assigned to the same disciple (shared care).
  // Always keep assignedWorkerIds and assignedWorkerNames in the same order.
  assignedWorkerIds: string[]
  assignedWorkerNames: string[]
  notes?: string
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  // Visible conflict indicator, NOT conflict resolution. Firestore offline
  // cache is last-write-wins — if two workers edit this record while both
  // offline, one edit silently disappears on sync. This field only tells
  // you who made the *last* change that survived; it does not merge or
  // warn about the lost one. Real conflict resolution (version checks /
  // per-field merge) is not implemented.
  lastEditedBy?: string
  lastEditedAt?: Timestamp
  // Denormalized for fast dashboard counts without extra reads
  lastFollowUpDate?: string
  nextFollowUpDate?: string
}

// ---------- Evangelism ----------

export type ReceptivityLevel =
  | 'very_receptive'
  | 'receptive'
  | 'neutral'
  | 'resistant'
  | 'hostile'

export const RECEPTIVITY_LABELS: Record<ReceptivityLevel, string> = {
  very_receptive: 'Very Receptive',
  receptive: 'Receptive',
  neutral: 'Neutral',
  resistant: 'Resistant',
  hostile: 'Hostile',
}

export type EvangelismOutcome =
  | 'salvation'
  | 'prayer_accepted'
  | 'follow_up_needed'
  | 'no_further_interest'
  | 'unreachable'

export interface EvangelismRecord {
  id: string
  discipleId: string
  discipleName: string
  date: string // ISO date
  time: string // HH:mm
  evangelistId: string
  evangelistName: string
  location: string
  method: string
  discussionSummary: string
  prayerOffered: boolean
  prayerAccepted: boolean
  receptivity: ReceptivityLevel
  notes?: string
  // Snapshot of the disciple's assignedWorkerIds at the time this record was
  // created — used for security-rule visibility. NOTE: this does NOT update
  // retroactively if the disciple is later reassigned; a worker removed from
  // a disciple keeps visibility on evangelism records logged while they were
  // still assigned. Acceptable for an audit trail, worth knowing if you
  // expect it to behave like a live permission.
  assignedWorkerIds: string[]
  nextFollowUpDate?: string
  outcome: EvangelismOutcome
  createdAt: Timestamp
}

// ---------- Follow-up ----------

export type FollowUpStatus = 'scheduled' | 'completed' | 'missed' | 'rescheduled'

export interface FollowUp {
  id: string
  discipleId: string
  discipleName: string
  workerId: string
  workerName: string
  scheduledDate: string
  completedDate?: string
  status: FollowUpStatus
  summary?: string
  nextStepDate?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ---------- Attendance ----------

export type ServiceType =
  | 'sunday_service'
  | 'bible_study'
  | 'prayer_meeting'
  | 'special_programme'
  | 'evangelism_training'

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  sunday_service: 'Sunday Service',
  bible_study: 'Bible Study',
  prayer_meeting: 'Prayer Meeting',
  special_programme: 'Special Programme',
  evangelism_training: 'Evangelism Training',
}

export interface AttendanceSession {
  id: string
  serviceType: ServiceType
  date: string
  title?: string
  createdBy: string
  createdAt: Timestamp
  presentDiscipleIds: string[]
}

// ---------- Audit ----------

export interface AuditLogEntry {
  id: string
  actorId: string
  actorName: string
  action: string
  targetType: string
  targetId: string
  details?: string
  timestamp: Timestamp
}
