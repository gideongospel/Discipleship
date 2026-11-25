import { useMemo, useState, type ReactNode } from 'react'
import { useAnalyticsData } from '../hooks/useAnalyticsData'
import Figure from '../components/ui/Figure'
import BarList from '../components/ui/BarList'
import TrendLine from '../components/ui/TrendLine'
import PageLoader from '../components/ui/PageLoader'

const rule = 'border-slate-200 dark:border-white/[0.09]'
const currentDate = new Date()
const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
const currentYear = String(currentDate.getFullYear())

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

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

const Empty = () => <p className="py-8 text-sm text-slate-500">Not enough recorded data for this period.</p>

export default function Reports() {
  const stats = useAnalyticsData()
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [worker, setWorker] = useState('all')
  const reportOptions = useMemo(() => {
    const people = new Map<string, { id: string; name: string; kind: 'worker' | 'member' }>()
    stats.followUps.forEach((item) => people.set('worker:' + item.workerId, { id: 'worker:' + item.workerId, name: item.workerName, kind: 'worker' }))
    stats.evangelism.forEach((item) => people.set('worker:' + item.evangelistId, { id: 'worker:' + item.evangelistId, name: item.evangelistName, kind: 'worker' }))
    stats.generalOutreach.forEach((item) => item.workerIds.forEach((id, index) => people.set('worker:' + id, { id: 'worker:' + id, name: item.workerNames[index] || id, kind: 'worker' })))
    stats.disciples.forEach((item) => people.set('member:' + item.id, { id: 'member:' + item.id, name: item.name, kind: 'member' }))
    return Array.from(people.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [stats.followUps, stats.evangelism, stats.generalOutreach, stats.disciples])

  if (stats.loading) return <PageLoader rows={4} />

  const monthStart = month ? `${month}-01` : ''
  const monthEnd = month ? `${month}-31` : ''
  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`
  const inRange = (date?: string, start = monthStart, end = monthEnd) => Boolean(date && date >= start && date <= end)
  const scopeKind = worker === 'all' ? 'all' : worker.startsWith('member:') ? 'member' : 'worker'
  const scopeId = worker === 'all' ? '' : worker.slice(worker.indexOf(':') + 1)
  const selectedMember = scopeKind === 'member' ? stats.disciples.find((item) => item.id === scopeId) : undefined
  const selectedFollowUps = stats.followUps.filter((item) => inRange(item.completedDate || item.scheduledDate)
    && (scopeKind === 'all' || (scopeKind === 'worker' ? item.workerId === scopeId : item.discipleId === scopeId)))
  const selectedEvangelism = stats.evangelism.filter((item) => inRange(item.date)
    && (scopeKind === 'all' || (scopeKind === 'worker' ? item.evangelistId === scopeId : item.discipleId === scopeId)))
  const selectedOutreach = stats.generalOutreach.filter((item) => inRange(item.date)
    && (scopeKind === 'all' || (scopeKind === 'worker' && item.workerIds.includes(scopeId))))
  const selectedSessions = stats.sessions.filter((item) => inRange(item.date))
  const eligibleMemberSessions = selectedMember
    ? selectedSessions.filter((session) => selectedMember.dateFirstContacted <= session.date)
    : selectedSessions
  const eligiblePairs = scopeKind === 'member'
    ? eligibleMemberSessions.length
    : scopeKind === 'worker'
      ? selectedSessions.length
      : selectedSessions.reduce((total, session) => total + stats.disciples.filter((disciple) => disciple.dateFirstContacted <= session.date).length, 0)
  const recordedAttendance = scopeKind === 'member'
    ? eligibleMemberSessions.filter((session) => session.presentDiscipleIds.includes(scopeId)).length
    : scopeKind === 'worker'
      ? stats.attendanceRecords.filter((record) => inRange(record.date) && record.personId === scopeId).length
      : selectedSessions.reduce((total, session) => total + session.presentDiscipleIds.length, 0)
  const attendanceRate = eligiblePairs ? Math.round(recordedAttendance / eligiblePairs * 100) : 0
  const followedDiscipleIds = new Set(selectedFollowUps.filter((item) => item.status === 'completed').map((item) => item.discipleId))
  const completedCount = selectedFollowUps.filter((item) => item.status === 'completed').length
  const scheduledCount = selectedFollowUps.length
  const evangelismParticipants = new Set([
    ...selectedEvangelism.map((item) => item.evangelistId),
    ...selectedOutreach.flatMap((item) => item.workerIds),
  ])
  const newDisciplesReached = selectedOutreach.reduce((sum, item) => sum + (item.newDisciplesIdentified || 0), 0)
    + selectedEvangelism.filter((item) => item.outcome === 'salvation').length
  const referenceDate = month ? new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0) : new Date(Number(year), 11, 31)
  const attentionCutoff = new Date(referenceDate)
  attentionCutoff.setDate(attentionCutoff.getDate() - stats.followUpSettings.neglectAfterDays)
  const attentionDate = `${attentionCutoff.getFullYear()}-${String(attentionCutoff.getMonth() + 1).padStart(2, '0')}-${String(attentionCutoff.getDate()).padStart(2, '0')}`
  const neglected = stats.disciples.filter((disciple) => {
    const last = disciple.lastFollowUpDate || disciple.dateFirstContacted
    const inScope = scopeKind === 'all' || (scopeKind === 'member' ? disciple.id === scopeId : disciple.assignedWorkerIds.includes(scopeId))
    return last <= attentionDate && inScope
  })
  const annualSessions = stats.sessions.filter((item) => inRange(item.date, yearStart, yearEnd))
  const annualFollowUps = stats.followUps.filter((item) => inRange(item.completedDate || item.scheduledDate, yearStart, yearEnd) && (scopeKind === 'all' || (scopeKind === 'worker' ? item.workerId === scopeId : item.discipleId === scopeId)))
  const annualOutreach = stats.generalOutreach.filter((item) => inRange(item.date, yearStart, yearEnd) && (scopeKind === 'all' || (scopeKind === 'worker' && item.workerIds.includes(scopeId))))
  const annualEvangelism = stats.evangelism.filter((item) => inRange(item.date, yearStart, yearEnd) && (scopeKind === 'all' || (scopeKind === 'worker' ? item.evangelistId === scopeId : item.discipleId === scopeId)))
  const annualAttendance = scopeKind === 'member'
    ? annualSessions.filter((session) => selectedMember && selectedMember.dateFirstContacted <= session.date && session.presentDiscipleIds.includes(scopeId)).length
    : scopeKind === 'worker'
      ? stats.attendanceRecords.filter((record) => inRange(record.date, yearStart, yearEnd) && record.personId === scopeId).length
      : annualSessions.reduce((sum, session) => sum + session.presentDiscipleIds.length, 0)
  const annualMeetingsHeld = annualSessions.length

  const exportReport = () => {
    const rows = [
      ['Discipleship Tracker report', month || year],
      ['Scope', worker === 'all' ? 'Church/group' : reportOptions.find((item) => item.id === worker)?.name || worker],
      ['Meetings held', String(selectedSessions.length)],
      ['Recorded attendance entries', String(recordedAttendance)],
      ['Attendance rate', `${attendanceRate}%`],
      ['Evangelism activity records', String(selectedOutreach.length + selectedEvangelism.length)],
      ['Unique evangelism participants', String(evangelismParticipants.size)],
      ['Disciples followed up', String(followedDiscipleIds.size)],
      ['Follow-ups scheduled/recorded', String(scheduledCount)],
      ['Follow-ups completed', String(completedCount)],
      ['New disciples reached (recorded)', String(newDisciplesReached)],
      ['Disciples needing attention', String(neglected.length)],
      [],
      ['Date', 'Activity', 'Worker / submitter', 'Details'],
      ...selectedSessions.map((item) => [item.date, item.title || item.serviceType, item.createdBy, `${item.presentDiscipleIds.length} present`]),
      ...selectedOutreach.map((item) => [item.date, item.activityName, item.submittedByName, `${item.peopleReached || 0} reached; ${item.newDisciplesIdentified || 0} new disciples`]),
      ...selectedEvangelism.map((item) => [item.date, 'Disciple outreach', item.evangelistName, `${item.discipleName}; ${item.outcome}`]),
      ...selectedFollowUps.map((item) => [item.completedDate || item.scheduledDate, `Follow-up: ${item.status}`, item.workerName, `${item.discipleName}; ${item.purpose || ''}; ${item.summary || ''}`]),
    ]
    downloadCsv(rows, `discipleship-report-${month || year}.csv`)
  }

  return (
    <div className="stagger space-y-14">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Insight</p><h1 className="page-title mt-5">Reports &amp; analytics</h1><p className="mt-2 text-sm text-slate-500">Period-based summaries from recorded activity. No spiritual maturity or divine approval score is inferred.</p></div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button className="btn-secondary" onClick={exportReport}>Export CSV</button>
          <button className="btn-primary" onClick={() => window.print()}>Print report</button>
        </div>
      </header>

      <section className="card grid gap-3 p-4 sm:grid-cols-3 print:hidden">
        <label className="text-xs font-semibold text-slate-500">Reporting month<input className="input mt-1" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
        <label className="text-xs font-semibold text-slate-500">Annual overview year<input className="input mt-1" type="number" min="2000" max="2200" value={year} onChange={(event) => setYear(event.target.value)} /></label>
        <label className="text-xs font-semibold text-slate-500">Report for<select className="input mt-1" value={worker} onChange={(event) => setWorker(event.target.value)}><option value="all">Church-wide / group</option><optgroup label="Workers">{reportOptions.filter((item) => item.kind === 'worker').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup><optgroup label="Disciples / members">{reportOptions.filter((item) => item.kind === 'member').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup></select></label>
      </section>

      <Panel title={`Monthly activity summary · ${month || 'Choose a month'}`} note={scopeKind === 'member' ? 'Individual member attendance is measured from their first-contact date.' : scopeKind === 'worker' ? 'Worker attendance is based on recorded self-attendance records.' : 'Church attendance percentage uses registered disciples who had already been contacted by each meeting date.'}>
        <div className={`grid grid-cols-2 border-y sm:grid-cols-3 lg:grid-cols-4 ${rule}`}>
          <Figure label="Meetings held" value={selectedSessions.length} />
          <Figure label="Recorded attendance" value={recordedAttendance} />
          <Figure label="Attendance rate" value={attendanceRate} suffix="%" progress={attendanceRate} />
          <Figure label="Evangelism activities" value={selectedOutreach.length + selectedEvangelism.length} />
          <Figure label="Evangelism participants" value={evangelismParticipants.size} />
          <Figure label="Disciples followed up" value={followedDiscipleIds.size} />
          <Figure label="Follow-ups completed" value={completedCount} />
          <Figure label="New disciples reached" value={newDisciplesReached} />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div><h3 className="mb-2 text-sm font-semibold">Follow-up activity</h3><p className="text-sm text-slate-600 dark:text-slate-300">{completedCount} completed out of {scheduledCount} recorded follow-ups. {scheduledCount - completedCount} remain pending, postponed or missed.</p></div>
          <div><h3 className="mb-2 text-sm font-semibold">Areas requiring attention</h3><p className="text-sm text-slate-600 dark:text-slate-300">{neglected.length} disciples have no recorded follow-up for at least {stats.followUpSettings.neglectAfterDays} days at the reporting period end. Review individual histories before deciding what support is needed.</p></div>
        </div>
      </Panel>

      <Panel title={`Annual overview · ${year}`} note="Year-to-date totals update automatically from saved records.">
        <div className={`grid grid-cols-2 border-y sm:grid-cols-4 ${rule}`}>
          <Figure label="Meetings held" value={annualMeetingsHeld} />
          <Figure label="Recorded attendance" value={annualAttendance} />
          <Figure label="Follow-ups" value={annualFollowUps.length} />
          <Figure label="General outreach activities" value={annualOutreach.length} />
          <Figure label="People reached" value={annualOutreach.reduce((sum, item) => sum + (item.peopleReached || 0), 0)} />
          <Figure label="New disciples identified" value={annualOutreach.reduce((sum, item) => sum + (item.newDisciplesIdentified || 0), 0) + annualEvangelism.filter((item) => item.outcome === 'salvation').length} />
          <Figure label="Disciple outreach records" value={annualEvangelism.length} />
          <Figure label="Follow-ups completed" value={annualFollowUps.filter((item) => item.status === 'completed').length} />
        </div>
      </Panel>

      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
        <Panel title="Spiritual status" note="Recorded profile categories; not a spiritual maturity score">{stats.spiritualStatusData.length ? <BarList items={stats.spiritualStatusData} /> : <Empty />}</Panel>
        <Panel title="Receptivity" note="Recorded responses during disciple outreach">{stats.receptivityData.length ? <BarList items={stats.receptivityData} /> : <Empty />}</Panel>
        <Panel title="Outreach outcomes">{stats.outcomeData.length ? <BarList items={stats.outcomeData} /> : <Empty />}</Panel>
        <Panel title="Follow-up status">{stats.followUpStatusData.length ? <BarList items={stats.followUpStatusData} /> : <Empty />}</Panel>
        <Panel title="Average attendance by gathering" note="People present per session">{stats.attendanceByType.length ? <BarList items={stats.attendanceByType} /> : <Empty />}</Panel>
        <Panel title="Attendance trend" note="The last 12 sessions">{stats.attendanceTrend.length ? <TrendLine data={stats.attendanceTrend} /> : <Empty />}</Panel>
      </div>
    </div>
  )
}
