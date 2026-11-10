export function greeting(date = new Date()) {
  const h = date.getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function longDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** ISO date -> days from today (negative = overdue). */
export function daysFromToday(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return Math.round((new Date(y, m - 1, d).getTime() - midnight(new Date())) / 86400000)
}

export function relativeDay(iso: string) {
  const n = daysFromToday(iso)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  if (n < 0) return `${Math.abs(n)} days overdue`
  if (n < 7) return `In ${n} days`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
