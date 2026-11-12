import { Link } from 'react-router-dom'
import { ArrowRight } from '../components/ui/icons'
import Figure from '../components/ui/Figure'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import PageLoader from '../components/ui/PageLoader'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useAuth } from '../context/AuthContext'
import { greeting, longDate, daysFromToday, relativeDay } from '../utils/format'
import { SPIRITUAL_STATUS_LABELS, type SpiritualStatus } from '../types'
import { statusBadgeColor } from '../utils/constants'

// The path a disciple walks, in order.
const JOURNEY: { key: SpiritualStatus; label: string }[] = [
  { key: 'still_unsaved', label: 'Not yet saved' },
  { key: 'initially_saved', label: 'Initially saved' },
  { key: 'saved_through_us', label: 'Saved through us' },
  { key: 'filled_with_holy_spirit_through_us', label: 'Spirit-filled' },
  { key: 'saved_and_filled_through_us', label: 'Saved & filled' },
  { key: 'under_discipleship', label: 'In discipleship' },
  { key: 'joined_the_church', label: 'Joined the church' },
  { key: 'became_a_worker', label: 'Became a worker' },
]

const rule = 'border-slate-200 dark:border-white/[0.09]'

function Marker({ filled, delay, className = '' }: { filled: boolean; delay: number; className?: string }) {
  return (
    <span
      className={`block h-[10px] w-[10px] rotate-45 animate-marker border ${
        filled ? 'border-gold-500 bg-gold-500' : 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-950'
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const stats = useDashboardStats()

  if (stats.loading) return <PageLoader rows={5} />

  const overdue = stats.followUps.filter((f) => f.status === 'scheduled' && daysFromToday(f.scheduledDate) < 0).length
  const stageCount = (k: SpiritualStatus) => stats.disciples.filter((d) => d.spiritualStatus === k).length
  const total = stats.totalDisciples || 1
  const first = profile?.name?.split(' ')[0]

  const headline =
    overdue > 0
      ? `${overdue} follow-up${overdue > 1 ? 's are' : ' is'} overdue — those disciples are waiting on you.`
      : stats.activeFollowUps > 0
        ? `${stats.activeFollowUps} follow-up${stats.activeFollowUps > 1 ? 's are' : ' is'} scheduled ahead. None are overdue.`
        : 'No follow-ups scheduled yet. Start by registering someone you met.'

  return (
    <div className="stagger space-y-14">
      {/* Greeting */}
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{longDate()}</p>
          <h1 className="page-title mt-5 !text-[2.6rem] lg:!text-[3.3rem]">
            {greeting()}, <em className="font-normal italic text-gold-700 dark:text-gold-400">{first}</em>.
          </h1>
          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-slate-600 dark:text-slate-400">{headline}</p>
        </div>
        <div className="flex items-center gap-7 text-sm font-semibold">
          <Link to="/evangelism" className="link-u inline-flex items-center gap-2 pb-1">Log outreach <ArrowRight size={14} strokeWidth={1.6} /></Link>
          <Link to="/attendance" className="link-u inline-flex items-center gap-2 pb-1">Take attendance <ArrowRight size={14} strokeWidth={1.6} /></Link>
        </div>
      </header>

      {/* Ledger of figures */}
      <section className={`grid grid-cols-2 border-y lg:grid-cols-4 ${rule}`}>
        {[
          <Figure key="a" label="Disciples" value={stats.totalDisciples} hint="Across every outreach" />,
          <Figure key="b" label="New converts" value={stats.newConverts} hint="Saved, not yet discipled" />,
          <Figure key="c" label="Active follow-ups" value={stats.activeFollowUps} hint={overdue ? `${overdue} overdue` : 'All on schedule'} />,
          <Figure key="d" label="Attendance" value={stats.attendanceRate} suffix="%" progress={stats.attendanceRate} hint="Average per disciple" />,
        ].map((cell, i) => (
          <div
            key={i}
            className={`px-6 py-8 max-lg:odd:pl-0 max-lg:[&:nth-child(n+3)]:border-t max-lg:even:border-l lg:border-l lg:first:border-l-0 lg:first:pl-0 ${rule}`}
          >
            {cell}
          </div>
        ))}
      </section>

      {/* The path */}
      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The path</p>
            <h2 className="mt-3 font-display text-[1.7rem] font-medium leading-tight tracking-tight">Where everyone stands today</h2>
          </div>
          <Link to="/reports" className="link-u hidden items-center gap-2 pb-1 text-sm font-semibold sm:inline-flex">
            Full report <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        </div>

        {/* Wide: a single rail with eight stations */}
        <div className="relative hidden lg:block">
          <div className="absolute left-[5px] right-0 top-[5px] h-px origin-left animate-draw bg-slate-300 dark:bg-white/20" />
          <ol className="relative grid grid-cols-8 gap-5">
            {JOURNEY.map((s, i) => {
              const n = stageCount(s.key)
              return (
                <li key={s.key}>
                  <Marker filled={n > 0} delay={0.35 + i * 0.09} />
                  <p className="num mt-6 font-display text-[2.6rem] font-light leading-none">{n}</p>
                  <p className="mt-3 text-[0.8rem] font-semibold leading-snug">{s.label}</p>
                  <p className="num mt-0.5 text-xs text-slate-500">{Math.round((n / total) * 100)}%</p>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Narrow: the same path, running down the page */}
        <ol className={`relative ml-[5px] space-y-6 border-l pl-7 lg:hidden ${rule}`}>
          {JOURNEY.map((s, i) => {
            const n = stageCount(s.key)
            return (
              <li key={s.key} className="relative flex items-baseline justify-between gap-4">
                <Marker filled={n > 0} delay={0.2 + i * 0.07} className="absolute -left-[33px] top-[6px]" />
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="num font-display text-2xl font-light">{n}</span>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Two ledgers */}
      <section className="grid gap-14 lg:grid-cols-2">
        <div>
          <div className={`flex items-baseline justify-between border-b pb-3 ${rule}`}>
            <h2 className="font-display text-xl font-medium">Upcoming visits</h2>
            <Link to="/follow-ups" className="link-u text-xs font-semibold uppercase tracking-[0.14em]">View all</Link>
          </div>
          {stats.upcomingFollowUps.length === 0 ? (
            <EmptyState title="Nothing scheduled">Schedule a follow-up and it will appear here.</EmptyState>
          ) : (
            stats.upcomingFollowUps.map((f) => (
              <Link key={f.id} to="/follow-ups" className={`group flex items-center gap-4 border-b py-4 transition-colors duration-200 hover:bg-slate-100/60 dark:hover:bg-white/[0.025] ${rule}`}>
                <Avatar name={f.discipleName} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{f.discipleName}</p>
                  <p className="truncate text-xs text-slate-500">with {f.workerName}</p>
                </div>
                <span className={`tag ${daysFromToday(f.scheduledDate) <= 1 ? 'text-gold-700 dark:text-gold-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {relativeDay(f.scheduledDate)}
                </span>
                <ArrowRight size={14} strokeWidth={1.6} className="-translate-x-1 text-slate-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))
          )}
        </div>

        <div>
          <div className={`flex items-baseline justify-between border-b pb-3 ${rule}`}>
            <h2 className="font-display text-xl font-medium">Recently registered</h2>
            <Link to="/disciples" className="link-u text-xs font-semibold uppercase tracking-[0.14em]">Directory</Link>
          </div>
          {stats.recentDisciples.length === 0 ? (
            <EmptyState title="No disciples yet">Register the first person you've met.</EmptyState>
          ) : (
            stats.recentDisciples.map((d) => (
              <Link key={d.id} to={`/disciples/${d.id}`} className={`group flex items-center gap-4 border-b py-4 transition-colors duration-200 hover:bg-slate-100/60 dark:hover:bg-white/[0.025] ${rule}`}>
                <Avatar name={d.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  <p className="truncate text-xs text-slate-500">{d.outreachLocation}</p>
                </div>
                <span className={`tag hidden sm:inline-flex ${statusBadgeColor(d.spiritualStatus)}`}>{SPIRITUAL_STATUS_LABELS[d.spiritualStatus]}</span>
                <ArrowRight size={14} strokeWidth={1.6} className="-translate-x-1 text-slate-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
