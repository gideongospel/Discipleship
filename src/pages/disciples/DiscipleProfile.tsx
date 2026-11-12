import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from '../../components/ui/icons'
import { useAuth } from '../../context/AuthContext'
import { deleteDisciple, getDisciple } from '../../services/discipleService'
import { listEvangelismRecords } from '../../services/evangelismService'
import { listAttendanceSessions, calculateAttendanceStats } from '../../services/attendanceService'
import type { AttendanceSession, Disciple, EvangelismRecord } from '../../types'
import { SPIRITUAL_STATUS_LABELS, RECEPTIVITY_LABELS } from '../../types'
import { statusBadgeColor } from '../../utils/constants'
import PageLoader from '../../components/ui/PageLoader'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'

export default function DiscipleProfile() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [disciple, setDisciple] = useState<Disciple | null>(null)
  const [records, setRecords] = useState<EvangelismRecord[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !profile) return
    Promise.all([getDisciple(id), listEvangelismRecords(profile, id), listAttendanceSessions()]).then(
      ([d, r, s]) => {
        setDisciple(d)
        setRecords(r)
        setSessions(s)
        setLoading(false)
      },
    )
  }, [id, profile])

  if (loading) return <PageLoader />
  if (!disciple) return <p className="text-slate-500">Disciple not found.</p>

  const attendance = calculateAttendanceStats(sessions, disciple.id, disciple.dateFirstContacted)

  const handleDelete = async () => {
    if (!profile || !confirm(`Delete ${disciple.name}? This cannot be undone.`)) return
    await deleteDisciple(disciple.id, profile)
    navigate('/disciples')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={disciple.name} size={64} />
          <div>
            <p className="eyebrow">Disciple profile</p>
            <h1 className="page-title">{disciple.name}</h1>
            <p className="text-sm text-slate-500">{disciple.outreachLocation}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/disciples/${disciple.id}/edit`} className="btn-secondary">
            <Pencil size={16} /> Edit
          </Link>
          {profile?.role === 'administrator' && (
            <button onClick={handleDelete} aria-label="Delete disciple" className="btn-secondary !px-3 !text-rose-700 hover:!border-rose-700 dark:!text-rose-300">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid border-y border-slate-200 dark:border-white/[0.09] sm:grid-cols-3">
        <InfoCard label="Spiritual Status">
          <span className={`tag ${statusBadgeColor(disciple.spiritualStatus)}`}>
            {SPIRITUAL_STATUS_LABELS[disciple.spiritualStatus]}
          </span>
        </InfoCard>
        <InfoCard label="Attendance Rate">
          <p className="num font-display text-[2.6rem] font-light leading-none">{attendance.rate}<span className="ml-0.5 text-lg text-gold-600 dark:text-gold-400">%</span></p>
          <p className="text-xs text-slate-500">
            {attendance.attended}/{attendance.totalSessions} sessions
          </p>
        </InfoCard>
        <InfoCard label="Assigned Workers">
          <p className="font-display text-xl leading-snug">{disciple.assignedWorkerNames?.join(', ') || '—'}</p>
        </InfoCard>
      </div>

      {disciple.lastEditedBy && (
        <p className="text-xs text-slate-500">
          Last edited by {disciple.lastEditedBy}
          {disciple.lastEditedAt?.toDate ? ` on ${disciple.lastEditedAt.toDate().toLocaleString()}` : ''}.
          {' '}If this doesn't match what you expect, check with other assigned workers before
          trusting this record — offline edits can silently overwrite each other.
        </p>
      )}

      <div className="card p-5">
        <h2 className="mb-3 font-display text-xl font-medium">Contact Details</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Phone" value={disciple.phone} />
          <Field label="Email" value={disciple.email || '—'} />
          <Field label="Gender" value={disciple.gender === 'male' ? 'Male' : 'Female'} />
          <Field label="Age" value={disciple.age?.toString() ?? '—'} />
          <Field label="Occupation" value={disciple.occupation || '—'} />
          <Field label="Address" value={disciple.address} />
          <Field label="Date First Contacted" value={disciple.dateFirstContacted} />
        </dl>
        {disciple.notes && (
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="mb-1 text-xs font-medium text-slate-500">Notes</p>
            <p className="text-sm">{disciple.notes}</p>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-display text-xl font-medium">Evangelism & Follow-up History</h2>
        {records.length === 0 ? (
          <EmptyState title="No outreach recorded">Visits and conversations with this person will appear here.</EmptyState>
        ) : (
          <ol className="space-y-4 border-l border-slate-200 pl-4 dark:border-slate-800">
            {records.map((r) => (
              <li key={r.id} className="relative">
                <span className="absolute -left-[20px] top-1.5 h-2 w-2 rotate-45 bg-gold-500" />
                <p className="text-xs text-slate-500">
                  {r.date} · {r.time} · {r.location}
                </p>
                <p className="text-sm font-medium">{r.method}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{r.discussionSummary}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Receptivity: {RECEPTIVITY_LABELS[r.receptivity]} · Prayer{' '}
                  {r.prayerAccepted ? 'accepted' : r.prayerOffered ? 'offered, not accepted' : 'not offered'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-slate-200 px-6 py-6 max-sm:pl-0 max-sm:[&:nth-child(n+2)]:border-t sm:border-l sm:first:border-l-0 sm:first:pl-0 dark:border-white/[0.09]">
      <p className="mb-3 font-brand text-[0.6rem] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
