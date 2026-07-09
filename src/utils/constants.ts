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
  if (status.includes('unsaved')) return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
  if (status.includes('worker') || status.includes('joined'))
    return 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
  return 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400'
}
