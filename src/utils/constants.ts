import { SPIRITUAL_STATUS_LABELS, RECEPTIVITY_LABELS, SERVICE_TYPE_LABELS } from '../types'

export const SPIRITUAL_STATUS_OPTIONS = Object.entries(SPIRITUAL_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
)

export const RECEPTIVITY_OPTIONS = Object.entries(RECEPTIVITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const SERVICE_TYPE_OPTIONS = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const OUTCOME_OPTIONS = [
  { value: 'salvation', label: 'Salvation' },
  { value: 'prayer_accepted', label: 'Prayer Accepted' },
  { value: 'follow_up_needed', label: 'Follow-up Needed' },
  { value: 'no_further_interest', label: 'No Further Interest' },
  { value: 'unreachable', label: 'Unreachable' },
]

export function statusBadgeColor(status: string) {
  if (status.includes('unsaved')) return 'bg-rose-500/12 text-rose-700 dark:text-rose-300'
  if (status.includes('worker') || status.includes('joined'))
    return 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
  if (status.includes('discipleship')) return 'bg-sky-500/12 text-sky-700 dark:text-sky-300'
  return 'bg-gold-500/15 text-gold-700 dark:text-gold-300'
}
