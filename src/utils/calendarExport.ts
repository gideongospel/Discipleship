import type { ChurchEvent } from '../services/churchEventService'

const CALENDAR_TZ = 'Africa/Lagos'

function dateTime(date: string, time: string) {
  return `${date}T${time || '00:00'}:00+01:00`
}

function googleDate(date: string, time: string) {
  return dateTime(date, time).replace(/[-:]/g, '')
}

function utcStamp(date: string, time: string) {
  return new Date(dateTime(date, time)).toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}Z$/, 'Z')
}

function endTime(event: ChurchEvent) {
  if (event.endTime) return event.endTime
  const [hours, minutes] = (event.startTime || '00:00').split(':').map(Number)
  const total = hours * 60 + minutes + 60
  return `${String(Math.floor((total % 1440) / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function recurrenceRule(event: ChurchEvent) {
  if (event.recurrence === 'none') return ''
  const until = event.recurrenceUntil ? `;UNTIL=${utcStamp(event.recurrenceUntil, '22:59:59')}` : ''
  return `RRULE:FREQ=${event.recurrence.toUpperCase()}${until}`
}

export function googleCalendarUrl(event: ChurchEvent) {
  const start = googleDate(event.date, event.startTime)
  const end = googleDate(event.date, endTime(event))
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || '',
    location: event.venue || '',
    ctz: CALENDAR_TZ,
  })
  const rule = recurrenceRule(event)
  if (rule) params.set('recur', rule)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcs(event: ChurchEvent) {
  const uid = `${event.id}@discipleship-tracker`
  const start = utcStamp(event.date, event.startTime || '00:00')
  const end = utcStamp(event.date, endTime(event))
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Discipleship Tracker//Church Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\\.\d{3}/, '')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description || '')}`,
    `LOCATION:${escapeIcs(event.venue || '')}`,
    recurrenceRule(event),
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'church-event'}.ics`
  anchor.click()
  URL.revokeObjectURL(url)
}
