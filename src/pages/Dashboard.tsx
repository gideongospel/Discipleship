import { Link } from 'react-router-dom'
import { Users, Sparkles, CalendarClock, TrendingUp, UserPlus, Megaphone, ArrowRight } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Avatar from '../components/ui/Avatar'
import DoorsMark from '../components/brand/DoorsMark'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useAuth } from '../context/AuthContext'
import { greeting, longDate, daysFromToday, relativeDay } from '../utils/format'
import { SPIRITUAL_STATUS_LABELS, type SpiritualStatus } from '../types'
import { statusBadgeColor } from '../utils/constants'

// The journey a disciple walks, in order, with short labels for the strip.
const JOURNEY: { key: SpiritualStatus; label: string; color: string }[] = [
  { key: 'still_unsaved', label: 'Not yet saved', color: '#6b6760' },
  { key: 'initially_saved', label: 'Initially saved', color: '#8d8878' },
  { key: 'saved_through_us', label: 'Saved through us', color: '#b8a98a' },
  { key: 'filled_with_holy_spirit_through_us', label: 'Spirit-filled', color: '#e3c77a' },
  { key: 'saved_and_filled_through_us', label: 'Saved & filled', color: '#d6b45e' },
  { key: 'under_discipleship', label: 'In discipleship', color: '#c8a24a' },
  { key: 'joined_the_church', label: 'Joined the church', color: '#b08a35' },
  { key: 'became_a_worker', label: 'Became a worker', color: '#8f6f27' },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const stats = useDashboardStats()

  const overdue = stats.followUps.filter((f) => f.status === 'scheduled' && daysFromToday(f.scheduledDate) < 0).length
  const stageCount = (k: SpiritualStatus) => stats.disciples.filter((d) => d.spiritualStatus === k).length
  const total = stats.totalDisciples || 1

  const headline =
    overdue > 0
      ? `${overdue} follow-up${overdue > 1 ? 's are' : ' is'} overdue — those disciples are waiting on you.`
      : stats.activeFollowUps > 0
        ? `${stats.activeFollowUps} follow-up${stats.activeFollowUps > 1 ? 's are' : ' is'} scheduled ahead. None are overdue.`
        : 'No follow-ups scheduled yet. Start by registering someone you met.'

  return (
    <div className="stagger space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.06] lg:p-10">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 120% at 88% 0%, rgba(200,162,74,0.32), transparent 62%)' }} />
        <div className="pointer-events-none absolute -bottom-10 -right-6 opacity-[0.07] lg:right-10 lg:opacity-[0.13]">
          <DoorsMark size={300} tone="white" />
        </div>
        <div className="relative max-w-xl">
          <p className="eyebrow !text-gold-400">{longDate()}</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight lg:text-[2.6rem]">
            {greeting()}, {profile?.name?.split(' ')[0]}.
          </h1>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-slate-300">{headline}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/disciples/new" className="btn bg-gold-500 text-slate-950 hover:bg-gold-400">
              <UserPlus size={16} /> New Disciple
            </Link>
            <Link to="/evangelism" className="btn border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12]">
              <Megaphone size={16} /> Log Outreach
            </Link>
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Disciples" value={stats.totalDisciples} icon={Users} hint="Across all outreaches" />
        <StatCard label="New Converts" value={stats.newConverts} icon={Sparkles} accent="green" hint="Saved, not yet discipled" />
        <StatCard label="Active Follow-ups" value={stats.activeFollowUps} icon={CalendarClock} accent="amber" hint={overdue ? `${overdue} overdue` : 'All on schedule'} />
        <StatCard label="Attendance Rate" value={stats.attendanceRate} suffix="%" icon={TrendingUp} progress={stats.attendanceRate} hint="Average per disciple" />
      </section>

      {/* Discipleship journey */}
      <section className="card p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Discipleship journey</p>
            <h2 className="mt-1 font-display text-lg font-extrabold">Where everyone stands</h2>
          </div>
          <Link to="/reports" className="hidden items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-600 hover:text-gold-500 sm:flex dark:text-gold-400">
            Full report <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mb-6 flex h-3 w-full gap-1 overflow-hidden rounded-full">
          {JOURNEY.map((s) => {
            const n = stageCount(s.key)
            return n > 0 ? (
              <div key={s.key} className="h-full rounded-full transition-all duration-700" style={{ flex: n, background: s.color }} title={`${s.label}: ${n}`} />
            ) : null
          })}
          {stats.totalDisciples === 0 && <div className="h-full w-full rounded-full bg-slate-200 dark:bg-white/10" />}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
          {JOURNEY.map((s, i) => {
            const n = stageCount(s.key)
            return (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="font-display text-2xl font-extrabold leading-none">{n}</p>
                <p className="mt-1.5 text-xs font-semibold leading-tight text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="mt-0.5 text-[0.68rem] text-slate-400">{Math.round((n / total) * 100)}%</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Lists */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold">Upcoming follow-ups</h2>
            <Link to="/follow-ups" className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600 hover:text-gold-500 dark:text-gold-400">View all</Link>
          </div>
          {stats.upcomingFollowUps.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No upcoming follow-ups scheduled.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {stats.upcomingFollowUps.map((f) => {
                const soon = daysFromToday(f.scheduledDate) <= 1
                return (
                  <li key={f.id} className="flex items-center gap-3 py-3">
                    <Avatar name={f.discipleName} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{f.discipleName}</p>
                      <p className="truncate text-xs text-slate-500">with {f.workerName}</p>
                    </div>
                    <span className={`chip ${soon ? 'bg-gold-500/15 text-gold-700 dark:text-gold-300' : 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300'}`}>
                      {relativeDay(f.scheduledDate)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold">Recently registered</h2>
            <Link to="/disciples" className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600 hover:text-gold-500 dark:text-gold-400">Directory</Link>
          </div>
          {stats.recentDisciples.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No disciples registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {stats.recentDisciples.map((d) => (
                <li key={d.id}>
                  <Link to={`/disciples/${d.id}`} className="flex items-center gap-3 py-3 transition-colors hover:text-gold-600 dark:hover:text-gold-300">
                    <Avatar name={d.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.name}</p>
                      <p className="truncate text-xs text-slate-500">{d.outreachLocation}</p>
                    </div>
                    <span className={`chip hidden sm:inline-flex ${statusBadgeColor(d.spiritualStatus)}`}>
                      {SPIRITUAL_STATUS_LABELS[d.spiritualStatus]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
