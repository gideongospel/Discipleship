import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BookOpen, Check, Copy, Plus, Share2, X } from '../components/ui/icons'
import { useAuth } from '../context/AuthContext'
import {
  createChurchResource,
  listChurchResources,
  markPrayerPointPrayed,
  updateChurchResource,
  type ChurchResource,
  type ChurchResourceInput,
  type ChurchResourceType,
} from '../services/churchResourceService'
import PageLoader from '../components/ui/PageLoader'
import EmptyState from '../components/ui/EmptyState'

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export default function MeetingLibrary() {
  const { profile } = useAuth()
  const [items, setItems] = useState<ChurchResource[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'all' | ChurchResourceType>('all')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [editing, setEditing] = useState<ChurchResource | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState('')

  const isAdmin = profile?.role === 'administrator'
  const load = async () => {
    if (!profile) return
    const data = await listChurchResources(profile, isAdmin && includeArchived)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load().catch(() => setLoading(false)) }, [profile, isAdmin, includeArchived])

  const visible = useMemo(() => items.filter((item) => type === 'all' || item.type === type), [items, type])

  const save = async (input: ChurchResourceInput) => {
    if (!profile) return
    if (editing) await updateChurchResource(editing.id, input, profile)
    else await createChurchResource(input, profile)
    setEditing(null)
    setShowForm(false)
    await load()
  }

  const changeStatus = async (item: ChurchResource, status: ChurchResource['status']) => {
    if (!profile) return
    await updateChurchResource(item.id, { status }, profile)
    await load()
  }

  const share = async (item: ChurchResource) => {
    const text = resourceText(item)
    try {
      if (navigator.share) await navigator.share({ title: item.title, text })
      else {
        await navigator.clipboard.writeText(text)
        setCopied(item.id)
        window.setTimeout(() => setCopied(''), 1600)
      }
    } catch {
      // A dismissed share sheet is not an application error.
    }
  }

  const markPrayed = async (item: ChurchResource) => {
    if (!profile || item.prayedByIds?.includes(profile.uid)) return
    await markPrayerPointPrayed(item.id, profile)
    await load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Church life &amp; spiritual formation</p>
          <h1 className="page-title mt-3">Meeting Excerpts &amp; Prayer Points</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Revisit teaching highlights and keep the church's prayer focus before you throughout the week.</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={16} /> Add resource</button>}
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
        {([{ value: 'all', label: 'All resources' }, { value: 'meeting_excerpt', label: 'Meeting excerpts' }, { value: 'prayer_point', label: 'Prayer points' }] as const).map((option) => (
          <button key={option.value} onClick={() => setType(option.value)} className={`px-3 py-2 text-sm font-semibold ${type === option.value ? 'border-b-2 border-gold-500 text-slate-950 dark:text-white' : 'text-slate-500'}`}>{option.label}</button>
        ))}
        {isAdmin && <label className="ml-auto flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} /> Include drafts and archived</label>}
      </div>

      {visible.length === 0 ? <EmptyState title="No resources published yet">Meeting highlights and church prayer focuses will appear here when published.</EmptyState> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((item) => {
            const prayed = Boolean(profile && item.prayedByIds?.includes(profile.uid))
            return (
              <article key={item.id} className="card space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="eyebrow">{item.type === 'meeting_excerpt' ? meetingLabel(item.meetingType) : item.category || 'Church prayer focus'} · {item.date}</p><h2 className="mt-2 font-display text-xl">{item.title}</h2></div>
                  {item.status !== 'published' && <span className="tag capitalize">{item.status}</span>}
                </div>
                {item.type === 'meeting_excerpt' ? (
                  <div className="space-y-3 text-sm">
                    <p className="text-xs text-slate-500">{item.minister ? `Minister / teacher: ${item.minister} · ` : ''}{item.mainPassage || 'Scripture passage not specified'}</p>
                    {item.excerpt && <p className="leading-relaxed text-slate-700 dark:text-slate-300">{item.excerpt}</p>}
                    {item.keyScriptures?.length ? <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Key scriptures</p><p>{item.keyScriptures.join(' · ')}</p></div> : null}
                    {item.teachingPoints?.length ? <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Teaching highlights</p><ul className="list-disc space-y-1 pl-5">{item.teachingPoints.map((point, index) => <li key={index}>{point}</li>)}</ul></div> : null}
                    {item.application && <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Practical application</p><p>{item.application}</p></div>}
                    {item.notes && <p className="text-slate-500">{item.notes}</p>}
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {item.description && <p className="leading-relaxed text-slate-700 dark:text-slate-300">{item.description}</p>}
                    {item.references?.length ? <p className="text-xs font-semibold text-gold-700 dark:text-gold-400">Scriptures: {item.references.join(' · ')}</p> : null}
                    {item.expiryDate && <p className="text-xs text-slate-500">Review date: {item.expiryDate}</p>}
                    <p className="text-xs text-slate-500">{item.prayedByIds?.length || 0} people have marked that they prayed about this focus. This is a personal reminder, not a record of an answered prayer.</p>
                    <button className="btn-secondary !py-2 !text-xs" disabled={prayed} onClick={() => markPrayed(item)}>{prayed ? <><Check size={14} /> Marked as prayed</> : 'I have prayed about this'}</button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                  <button className="btn-secondary !py-2 !text-xs" onClick={() => share(item)}>{copied === item.id ? <Check size={14} /> : <Share2 size={14} />}{copied === item.id ? 'Copied' : 'Share / copy'}</button>
                  {isAdmin && <button className="btn-secondary !py-2 !text-xs" onClick={() => { setEditing(item); setShowForm(true) }}>Edit</button>}
                  {isAdmin && item.status === 'draft' && <button className="btn-primary !py-2 !text-xs" onClick={() => changeStatus(item, 'published')}>Publish</button>}
                  {isAdmin && item.status === 'published' && <button className="btn-secondary !py-2 !text-xs" onClick={() => changeStatus(item, 'archived')}>Archive</button>}
                  {isAdmin && item.status === 'archived' && <button className="btn-secondary !py-2 !text-xs" onClick={() => changeStatus(item, 'published')}>Republish</button>}
                </div>
              </article>
            )
          })}
        </div>
      )}
      {showForm && <ResourceForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={save} />}
    </div>
  )
}

function meetingLabel(value?: string) {
  if (value === 'sunday_service') return 'Sunday Service'
  if (value === 'bible_study') return 'Wednesday Bible Study'
  return 'Special Programme'
}

function resourceText(item: ChurchResource) {
  if (item.type === 'prayer_point') return `${item.title}\n${item.description || ''}\nScriptures: ${item.references?.join(', ') || '—'}`
  return [item.title, `${meetingLabel(item.meetingType)} · ${item.date}`, item.mainPassage, item.excerpt, ...(item.keyScriptures || []), ...(item.teachingPoints || []), item.application].filter(Boolean).join('\n\n')
}

function ResourceForm({ initial, onClose, onSave }: { initial: ChurchResource | null; onClose: () => void; onSave: (input: ChurchResourceInput) => Promise<void> }) {
  const [type, setType] = useState<ChurchResourceType>(initial?.type || 'meeting_excerpt')
  const [title, setTitle] = useState(initial?.title || '')
  const [date, setDate] = useState(initial?.date || today())
  const [status, setStatus] = useState<ChurchResource['status']>(initial?.status || 'draft')
  const [meetingType, setMeetingType] = useState<NonNullable<ChurchResource['meetingType']>>(initial?.meetingType || 'sunday_service')
  const [minister, setMinister] = useState(initial?.minister || '')
  const [mainPassage, setMainPassage] = useState(initial?.mainPassage || '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '')
  const [keyScriptures, setKeyScriptures] = useState(initial?.keyScriptures?.join('\n') || '')
  const [teachingPoints, setTeachingPoints] = useState(initial?.teachingPoints?.join('\n') || '')
  const [application, setApplication] = useState(initial?.application || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [category, setCategory] = useState(initial?.category || 'Church-wide prayer focuses')
  const [description, setDescription] = useState(initial?.description || '')
  const [references, setReferences] = useState(initial?.references?.join(', ') || '')
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate || '')
  const [eventId, setEventId] = useState(initial?.eventId || '')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !date) return
    setSaving(true)
    try {
      const base = { type, title: title.trim(), date, status, eventId: eventId || undefined }
      const input: ChurchResourceInput = type === 'meeting_excerpt' ? {
        ...base, meetingType, minister: minister || undefined, mainPassage: mainPassage || undefined,
        excerpt: excerpt || undefined, keyScriptures: keyScriptures.split('\n').map((value) => value.trim()).filter(Boolean),
        teachingPoints: teachingPoints.split('\n').map((value) => value.trim()).filter(Boolean),
        application: application || undefined, notes: notes || undefined,
      } : {
        ...base, category, description: description || undefined,
        references: references.split(',').map((value) => value.trim()).filter(Boolean),
        expiryDate: expiryDate || undefined,
      }
      await onSave(input)
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <form onSubmit={submit} className="card modal-panel max-h-[92vh] w-full max-w-2xl space-y-3 overflow-y-auto p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">{initial ? 'Edit resource' : 'Create resource'}</h2><button type="button" onClick={onClose}><X size={18} /></button></div>
        {!initial && <div><label className="label">Resource type</label><select className="input" value={type} onChange={(event) => setType(event.target.value as ChurchResourceType)}><option value="meeting_excerpt">Meeting excerpt / teaching highlight</option><option value="prayer_point">Church prayer point</option></select></div>}
        <div><label className="label">Title *</label><input className="input" required value={title} onChange={(event) => setTitle(event.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Date published / meeting date *</label><input className="input" type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></div>
          <div><label className="label">Publication status</label><select className="input" value={status} onChange={(event) => setStatus(event.target.value as ChurchResource['status'])}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
        </div>
        {type === 'meeting_excerpt' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Meeting type</label><select className="input" value={meetingType} onChange={(event) => setMeetingType(event.target.value as NonNullable<ChurchResource['meetingType']>)}><option value="sunday_service">Sunday Service</option><option value="bible_study">Wednesday Bible Study</option><option value="special_programme">Special Programme</option></select></div>
              <div><label className="label">Minister / teacher</label><input className="input" value={minister} onChange={(event) => setMinister(event.target.value)} /></div>
            </div>
            <div><label className="label">Main Bible passage</label><input className="input" value={mainPassage} onChange={(event) => setMainPassage(event.target.value)} placeholder="e.g. Romans 8:1–17" /></div>
            <div><label className="label">Short excerpt / summary</label><textarea className="input min-h-24" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} /></div>
            <div><label className="label">Key scriptures (one per line)</label><textarea className="input min-h-16" value={keyScriptures} onChange={(event) => setKeyScriptures(event.target.value)} /></div>
            <div><label className="label">Teaching points (one per line)</label><textarea className="input min-h-20" value={teachingPoints} onChange={(event) => setTeachingPoints(event.target.value)} /></div>
            <div><label className="label">Practical application / reflection</label><textarea className="input min-h-16" value={application} onChange={(event) => setApplication(event.target.value)} /></div>
            <div><label className="label">Additional notes</label><textarea className="input min-h-16" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
          </>
        ) : (
          <>
            <div><label className="label">Prayer category</label><select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>{['Church-wide prayer focuses','Members and families','Spiritual growth and maturity','Evangelism and outreach','Church workers and leadership','Upcoming programmes and meetings','Community and national concerns','Personal prayer requests'].map((value) => <option key={value}>{value}</option>)}</select></div>
            <div><label className="label">Prayer focus / explanation</label><textarea className="input min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
            <div><label className="label">Bible references (comma separated)</label><input className="input" value={references} onChange={(event) => setReferences(event.target.value)} placeholder="Ephesians 3:16, Colossians 1:9" /></div>
            <div><label className="label">Optional expiry / review date</label><input className="input" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></div>
          </>
        )}
        <div><label className="label">Link to church event (optional event ID)</label><input className="input" value={eventId} onChange={(event) => setEventId(event.target.value)} placeholder="Paste event ID if applicable" /></div>
        <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save resource'}</button></div>
      </form>
    </div>
  )
}
