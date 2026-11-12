import type { ReactNode } from 'react'
import { useAnalyticsData } from '../hooks/useAnalyticsData'
import Figure from '../components/ui/Figure'
import BarList from '../components/ui/BarList'
import TrendLine from '../components/ui/TrendLine'
import PageLoader from '../components/ui/PageLoader'

const rule = 'border-slate-200 dark:border-white/[0.09]'

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section>
      <div className={`mb-6 border-b pb-3 ${rule}`}>
        <h2 className="font-display text-xl font-medium">{title}</h2>
        {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      </div>
      {children}
    </section>
  )
}

const Empty = () => <p className="py-8 text-sm text-slate-500">Not enough data yet.</p>

export default function Reports() {
  const stats = useAnalyticsData()
  if (stats.loading) return <PageLoader rows={4} />

  return (
    <div className="stagger space-y-14">
      <header>
        <p className="eyebrow">Insight</p>
        <h1 className="page-title mt-5">Reports &amp; analytics</h1>
      </header>

      <section className={`grid grid-cols-1 border-y sm:grid-cols-3 ${rule}`}>
        {[
          <Figure key="a" label="Disciples" value={stats.totalDisciples} />,
          <Figure key="b" label="Outreach records" value={stats.totalEvangelismRecords} />,
          <Figure key="c" label="Follow-up completion" value={stats.followUpCompletionRate} suffix="%" progress={stats.followUpCompletionRate} />,
        ].map((cell, i) => (
          <div key={i} className={`px-6 py-8 max-sm:pl-0 max-sm:[&:nth-child(n+2)]:border-t sm:border-l sm:first:border-l-0 sm:first:pl-0 ${rule}`}>
            {cell}
          </div>
        ))}
      </section>

      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
        <Panel title="Spiritual status" note="Where each disciple stands today">
          {stats.spiritualStatusData.length ? <BarList items={stats.spiritualStatusData} /> : <Empty />}
        </Panel>
        <Panel title="Receptivity" note="How people responded during outreach">
          {stats.receptivityData.length ? <BarList items={stats.receptivityData} /> : <Empty />}
        </Panel>
        <Panel title="Outreach outcomes">
          {stats.outcomeData.length ? <BarList items={stats.outcomeData} /> : <Empty />}
        </Panel>
        <Panel title="Follow-up status">
          {stats.followUpStatusData.length ? <BarList items={stats.followUpStatusData} /> : <Empty />}
        </Panel>
        <Panel title="Average attendance by gathering" note="People present per session">
          {stats.attendanceByType.length ? <BarList items={stats.attendanceByType} /> : <Empty />}
        </Panel>
        <Panel title="Attendance trend" note="The last 12 sessions">
          {stats.attendanceTrend.length ? <TrendLine data={stats.attendanceTrend} /> : <Empty />}
        </Panel>
      </div>
    </div>
  )
}
