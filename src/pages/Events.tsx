import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CalendarClock, Plus, X, ArrowRight, Download, Megaphone } from '../components/ui/icons'
import { useAuth } from '../context/AuthContext'
import {
  createChurchEvent,
  listChurchEvents,
  updateChurchEvent,
  type ChurchEvent,
  type ChurchEventInput,
  type EventCategory,
} from '../services/churchEventService'
import { downloadIcs, googleCalendarUrl } from '../utils/calendarExport'
import PageLoader from '../components/ui/PageLoader'
import EmptyState from '../components/ui/EmptyState'

const today = () => new Date().toISOString().slice(0, 10)

export default function Events() {
  const { profile } = useAuth()
  const [items, setItems] = useState<ChurchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ChurchEvent | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [includeUnpublished, setIncludeUnpublished] = useState(false)
  const isAdmin = profile?.role === 'administrator'

  const load = async () => {
    if (!profile) return
    const data = await listChurchEvents(isAdmin && includeUnpublished)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load().catch(() => setLoading(false)) }, [profile, isAdmin, includeUnpublished])

  const upcoming = useMemo(() => items.filter((event) => event.date >= today() && event.status !== 'archived'), [items])
  const save = async (input: ChurchEventInput) => {
    if (!profile) return
    if (editing) await updateChurchEvent(editing.id, input, profile)
    else await createChurchEvent(input, profile)
    setEditing(null)
    setShowForm(false)
    await load()
  }

  const changeStatus = async (event: ChurchEvent, status: ChurchEvent['status']) => {
    if (!profile) return
    await updateChurchEvent(event.id, { status }, profile)
    await load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Church life</p>
          <h1 className="page-title mt-3">Announcements &amp; Events</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">Stay informed about regular gatherings and special programmes.</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Add event</button>}
      </header>

      {isAdmin && (
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={includeUnpublished} onChange={(e) => setIncludeUnpublished(e.target.checked)} />
          Include drafts and archived announcements
        </label>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2"><CalendarClock size={18} /><h2 className="font-display text-xl">Upcoming gatherings</h2></div>
        {upcoming.length === 0 ? <EmptyState title="No upcoming events">Published meetings and programmes will appear here.</EmptyState> : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((event) => <EventCard key={event.id} event={event} isAdmin={isAdmin} onEdit={() => { setEditing(event); setShowForm(true) }} onStatus={changeStatus} />)}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><Megaphone size={18} /><h2 className="font-display text-xl">Past announcements</h2></div>
        {items.filter((event) => event.date < today() && event.status !== 'archived').length === 0 ? (
          <p className="text-sm text-slate-500">Past events will remain available here.</p>
        ) : (
          <div className="space-y-2">
            {items.filter((event) => event.date < today() && event.status !== 'archived').map((event) => (
              <div key={event.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div><p className="font-semibold">{event.title}</p><p className="text-xs text-slate-500">{event.date} · {event.venue}</p></div>
                <div className="flex gap-2"><button className="btn-secondary" onClick={() => window.open(googleCalendarUrl(event), '_blank', 'noopener,noreferrer')}>Calendar</button><button className="btn-secondary" onClick={() => downloadIcs(event)}>ICS</button></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && <EventForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={save} />}
    </div>
  )
}

function EventCard({ event, isAdmin, onEdit, onStatus }: {
  event: ChurchEvent
  isAdmin: boolean
  onEdit: () => void
  onStatus: (event: ChurchEvent, status: ChurchEvent['status']) => void
}) {
  return (
    <article className="card space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{event.category === 'regular_meeting' ? 'Regular meeting' : 'Special programme'}</p>
          <h3 className="mt-2 font-display text-xl">{event.title}</h3>
        </div>
        {event.status !== 'published' && <span className="tag capitalize">{event.status}</span>}
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{event.description || 'Join us for this church gathering.'}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-slate-500">Date &amp; time</p><p className="font-medium">{event.date} · {event.startTime}{event.endTime ? `–${event.endTime}` : ''}</p></div>
        <div><p className="text-xs text-slate-500">Venue</p><p className="font-medium">{event.venue || 'To be announced'}</p></div>
      </div>
      {event.recurrence !== 'none' && <p className="text-xs text-slate-500">Repeats {event.recurrence}{event.recurrenceUntil ? ` until ${event.recurrenceUntil}` : ''}</p>}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
        <button className="btn-secondary" onClick={() => window.open(googleCalendarUrl(event), '_blank', 'noopener,noreferrer')}><ArrowRight size={14} /> Google Calendar</button>
        <button className="btn-secondary" onClick={() => downloadIcs(event)}><Download size={14} /> Download .ics</button>
        {isAdmin && <button className="btn-secondary" onClick={onEdit}>Edit</button>}
        {isAdmin && event.status === 'draft' && <button className="btn-primary" onClick={() => onStatus(event, 'published')}>Publish</button>}
        {isAdmin && event.status === 'published' && <button className="btn-secondary" onClick={() => onStatus(event, 'archived')}>Archive</button>}
        {isAdmin && event.status === 'archived' && <button className="btn-secondary" onClick={() => onStatus(event, 'published')}>Republish</button>}
      </div>
      {event.status === 'published' && <p className="text-xs text-slate-500">If this event changes or is cancelled, update or remove any copy you previously saved to your personal calendar.</p>}
    </article>
  )
}

function EventForm({ initial, onClose, onSave }: {
  initial: ChurchEvent | null
  onClose: () => void
  onSave: (input: ChurchEventInput) => Promise<void>
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date ?? today())
  const [startTime, setStartTime] = useState(initial?.startTime ?? '10:00')
  const [endTime, setEndTime] = useState(initial?.endTime ?? '')
  const [venue, setVenue] = useState(initial?.venue ?? '')
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'regular_meeting')
  const [recurrence, setRecurrence] = useState<ChurchEventInput['recurrence']>(initial?.recurrence ?? 'none')
  const [recurrenceUntil, setRecurrenceUntil] = useState(initial?.recurrenceUntil ?? '')
  const [status, setStatus] = useState<ChurchEventInput['status']>(initial?.status ?? 'draft')
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date || !startTime) return
    setSaving(true)
    try {
      await onSave({ title: title.trim(), description, date, startTime, endTime: endTime || undefined, venue, category, recurrence, recurrenceUntil: recurrenceUntil || undefined, status })
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <form onSubmit={submit} className="card modal-panel max-h-[90vh] w-full max-w-xl space-y-3 overflow-y-auto p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">{initial ? 'Edit event' : 'Create announcement'}</h2><button type="button" onClick={onClose}><X size={18} /></button></div>
        <div><label className="label">Event title *</label><input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wednesday Bible Study" /></div>
        <div><label className="label">Description</label><textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Category</label><select className="input" value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}><option value="regular_meeting">Regular meeting</option><option value="special_programme">Special programme</option></select></div>
          <div><label className="label">Announcement status</label><select className="input" value={status} onChange={(e) => setStatus(e.target.value as ChurchEventInput['status'])}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
          <div><label className="label">Date *</label><input className="input" type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="label">Venue</label><input className="input" value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
          <div><label className="label">Start time *</label><input className="input" type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
          <div><label className="label">End time</label><input className="input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
          <div><label className="label">Recurrence</label><select className="input" value={recurrence} onChange={(e) => setRecurrence(e.target.value as ChurchEventInput['recurrence'])}><option value="none">One-time</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
          <div><label className="label">Repeat until</label><input className="input" type="date" min={date} value={recurrenceUntil} onChange={(e) => setRecurrenceUntil(e.target.value)} disabled={recurrence === 'none'} /></div>
        </div>
        <p className="text-xs text-slate-500">Calendar saving is user-initiated. Changes here do not automatically alter events already saved in personal calendars.</p>
        <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Create event'}</button></div>
      </form>
    </div>
  )
}
