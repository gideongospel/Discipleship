import { Link } from 'react-router-dom'
import { Users, Sparkles, CalendarClock, TrendingUp, UserPlus, Megaphone, ClipboardCheck } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()
  const stats = useDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500">Here's what's happening across your discipleship ministry.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Disciples" value={stats.loading ? '—' : stats.totalDisciples} icon={Users} />
        <StatCard label="New Converts" value={stats.loading ? '—' : stats.newConverts} icon={Sparkles} accent="green" />
        <StatCard label="Active Follow-ups" value={stats.loading ? '—' : stats.activeFollowUps} icon={CalendarClock} accent="amber" />
        <StatCard label="Attendance Rate" value={stats.loading ? '—' : `${stats.attendanceRate}%`} icon={TrendingUp} />
        <StatCard label="Upcoming Follow-ups" value={stats.loading ? '—' : stats.upcomingFollowUps.length} icon={ClipboardCheck} accent="amber" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-500">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction to="/disciples/new" icon={UserPlus} label="New Disciple" />
          <QuickAction to="/evangelism" icon={Megaphone} label="Log Outreach" />
          <QuickAction to="/follow-ups" icon={CalendarClock} label="Follow-ups" />
          <QuickAction to="/attendance" icon={ClipboardCheck} label="Take Attendance" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-semibold">Upcoming Follow-ups</h2>
          {stats.upcomingFollowUps.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming follow-ups scheduled.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.upcomingFollowUps.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{f.discipleName}</span>
                  <span className="text-slate-500">{f.scheduledDate}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-semibold">Recently Registered</h2>
          {stats.recentDisciples.length === 0 ? (
            <p className="text-sm text-slate-500">No disciples registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentDisciples.map((d) => (
                <li key={d.id} className="py-2 text-sm">
                  <Link to={`/disciples/${d.id}`} className="font-medium hover:text-brand-600">
                    {d.name}
                  </Link>
                  <span className="ml-2 text-slate-500">{d.outreachLocation}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof UserPlus; label: string }) {
  return (
    <Link to={to} className="card flex flex-col items-center gap-2 p-4 text-center hover:border-brand-300">
      <Icon className="text-brand-600" size={22} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
