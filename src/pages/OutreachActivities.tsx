import { useEffect, useState, type FormEvent } from 'react'
import { Plus, X, Megaphone } from '../components/ui/icons'
import { useAuth } from '../context/AuthContext'
import { getAllUsers } from '../services/userService'
import { createOutreachActivity, listOutreachActivities, type OutreachActivity } from '../services/outreachActivityService'
import type { AppUser } from '../types'
import PageLoader from '../components/ui/PageLoader'
import EmptyState from '../components/ui/EmptyState'

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export default function OutreachActivities() {
  const { profile } = useAuth()
  const [records, setRecords] = useState<OutreachActivity[]>([])
  const [workers, setWorkers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    if (!profile) return
    const [activities, users] = await Promise.all([listOutreachActivities(profile), getAllUsers()])
    setRecords(activities)
    setWorkers(users.filter((u) => u.status === 'active' && u.role === 'worker'))
    setLoading(false)
  }

  useEffect(() => { load().catch(() => setLoading(false)) }, [profile])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Outreach &amp; mission</p><h1 className="page-title mt-3">General Evangelism Activities</h1><p className="mt-2 text-sm text-slate-500">Record team evangelism independently of individual disciple conversations and meeting attendance.</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Log Evangelism</button>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="card p-4"><p className="text-xs text-slate-500">Activities logged</p><p className="num mt-2 font-display text-3xl">{records.length}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">People reached</p><p className="num mt-2 font-display text-3xl">{records.reduce((sum, r) => sum + (r.peopleReached || 0), 0)}</p></div>
        <div className="card col-span-2 p-4 sm:col-span-1"><p className="text-xs text-slate-500">New disciples identified</p><p className="num mt-2 font-display text-3xl">{records.reduce((sum, r) => sum + (r.newDisciplesIdentified || 0), 0)}</p></div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Activity history</h2>
        {records.length === 0 ? <EmptyState title="No general evangelism logged">Use Log Evangelism to record an outreach, street meeting, village visit or team activity.</EmptyState> : (
          <div className="space-y-3">
            {records.map((record) => <article key={record.id} className="card space-y-3 p-5">
              <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{record.date} · {record.startTime}{record.endTime ? `–${record.endTime}` : ''}</p><h3 className="mt-1 font-display text-xl">{record.activityName}</h3></div><Megaphone size={20} /></div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{record.venue}</p>
              <div className="grid grid-cols-2 gap-3 text-sm"><p><span className="text-slate-500">Reached:</span> {record.peopleReached ?? 'Not recorded'}</p><p><span className="text-slate-500">New disciples:</span> {record.newDisciplesIdentified ?? 'Not recorded'}</p></div>
              <p className="text-xs text-slate-500">Team: {record.workerNames.join(', ') || record.submittedByName}</p>
              {record.notes && <p className="border-t border-slate-100 pt-3 text-sm dark:border-white/10">{record.notes}</p>}
              <p className="text-xs text-slate-500">Submitted by {record.submittedByName}</p>
            </article>)}
          </div>
        )}
      </section>

      {showForm && <ActivityForm workers={workers} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
    </div>
  )
}

function ActivityForm({ workers, onClose, onSaved }: { workers: AppUser[]; onClose: () => void; onSaved: () => void }) {
  const { profile } = useAuth()
  const [activityName, setActivityName] = useState('')
  const [date, setDate] = useState(today())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [venue, setVenue] = useState('')
  const [workerIds, setWorkerIds] = useState<string[]>(profile ? [profile.uid] : [])
  const [peopleReached, setPeopleReached] = useState('')
  const [newDisciplesIdentified, setNewDisciplesIdentified] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleWorker = (uid: string) => setWorkerIds((current) => current.includes(uid) ? current.filter((id) => id !== uid) : [...current, uid])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile || !activityName.trim() || !date || !startTime) return
    setSaving(true)
    try {
      const ids = Array.from(new Set([...workerIds, profile.uid]))
      const names = ids.map((id) => workers.find((worker) => worker.uid === id)?.name ?? (id === profile.uid ? profile.name : id))
      await createOutreachActivity({
        activityName: activityName.trim(), date, startTime, endTime: endTime || undefined, venue,
        workerIds: ids, workerNames: names,
        peopleReached: peopleReached === '' ? undefined : Number(peopleReached),
        newDisciplesIdentified: newDisciplesIdentified === '' ? undefined : Number(newDisciplesIdentified),
        notes: notes || undefined,
      }, profile)
      onSaved()
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <form onSubmit={submit} className="card modal-panel max-h-[90vh] w-full max-w-xl space-y-3 overflow-y-auto p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">Log General Evangelism</h2><button type="button" onClick={onClose}><X size={18} /></button></div>
        <div><label className="label">Activity or event name *</label><input className="input" required value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="e.g. Itoko community outreach" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Date *</label><input type="date" required className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="label">Location / venue</label><input className="input" value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
          <div><label className="label">Start time *</label><input type="time" required className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
          <div><label className="label">End time</label><input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
          <div><label className="label">People reached</label><input type="number" min="0" step="1" className="input" value={peopleReached} onChange={(e) => setPeopleReached(e.target.value)} /></div>
          <div><label className="label">New disciples identified</label><input type="number" min="0" step="1" className="input" value={newDisciplesIdentified} onChange={(e) => setNewDisciplesIdentified(e.target.value)} /></div>
        </div>
        <div><label className="label">Workers / team involved</label><div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-white/10">
          {workers.map((worker) => <label key={worker.uid} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={workerIds.includes(worker.uid)} onChange={() => toggleWorker(worker.uid)} />{worker.name}</label>)}
          {profile && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={workerIds.includes(profile.uid)} onChange={() => toggleWorker(profile.uid)} />{profile.name} (you)</label>}
        </div></div>
        <div><label className="label">Activity notes / outcomes</label><textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save activity'}</button></div>
      </form>
    </div>
  )
}
