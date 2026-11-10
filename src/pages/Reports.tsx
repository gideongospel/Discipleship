import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAnalyticsData } from '../hooks/useAnalyticsData'
import { FullScreenLoader } from '../components/layout/ProtectedRoute'
import StatCard from '../components/ui/StatCard'
import { Users, Megaphone, CalendarClock } from 'lucide-react'

const COLORS = ['#c8a24a', '#4f9d78', '#5b8fc7', '#8a6fc4', '#d0586a', '#d9803f', '#3aa6a6', '#8a857b']

const TIP = {
  contentStyle: { background: '#131211', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 12, color: '#fff' },
  itemStyle: { color: '#fff' },
  labelStyle: { color: '#d6b45e', fontWeight: 700 },
  cursor: { fill: 'rgba(200,162,74,0.10)' },
}
const TICK = { fill: '#9f9a8c', fontSize: 11 }

export default function Reports() {
  const stats = useAnalyticsData()

  if (stats.loading) return <FullScreenLoader />

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Insight</p>
        <h1 className="page-title">Reports & Analytics</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Disciples" value={stats.totalDisciples} icon={Users} />
        <StatCard label="Evangelism Records" value={stats.totalEvangelismRecords} icon={Megaphone} />
        <StatCard label="Follow-up Completion" value={`${stats.followUpCompletionRate}%`} icon={CalendarClock} accent="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Spiritual Status Distribution">
          {stats.spiritualStatusData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={stats.spiritualStatusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={3} stroke="none">
                  {stats.spiritualStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Evangelism Receptivity">
          {stats.receptivityData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.receptivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={TICK} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} />
                <Bar dataKey="value" fill="#c8a24a" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Evangelism Outcomes">
          {stats.outcomeData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.outcomeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis type="number" allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={TICK} width={120} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} />
                <Bar dataKey="value" fill="#d6b45e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Follow-up Status">
          {stats.followUpStatusData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={stats.followUpStatusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={3} stroke="none">
                  {stats.followUpStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Average Attendance by Service Type">
          {stats.attendanceByType.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.attendanceByType}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={TICK} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} />
                <Bar dataKey="value" fill="#b08a35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Attendance Trend (last 12 sessions)">
          {stats.attendanceTrend.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ ...TICK, fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} />
                <Line type="monotone" dataKey="value" stroke="#c8a24a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h2 className="mb-4 font-display text-base font-extrabold">{title}</h2>
      {children}
    </div>
  )
}

function EmptyState() {
  return <p className="flex h-[280px] items-center justify-center text-sm text-slate-500">Not enough data yet.</p>
}
