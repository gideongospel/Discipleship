import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listDisciples } from '../services/discipleService'
import { listEvangelismRecords } from '../services/evangelismService'
import { listFollowUps } from '../services/followUpService'
import { listAttendanceSessions } from '../services/attendanceService'
import type { Disciple, EvangelismRecord, FollowUp, AttendanceSession } from '../types'
import { SPIRITUAL_STATUS_LABELS, RECEPTIVITY_LABELS, SERVICE_TYPE_LABELS } from '../types'

export function useAnalyticsData() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [evangelism, setEvangelism] = useState<EvangelismRecord[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    Promise.all([
      listDisciples(profile),
      listEvangelismRecords(profile),
      listFollowUps(profile),
      listAttendanceSessions(),
    ]).then(([d, e, f, s]) => {
      if (cancelled) return
      setDisciples(d)
      setEvangelism(e)
      setFollowUps(f)
      setSessions(s)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [profile])

  // Spiritual status distribution
  const spiritualStatusData = Object.entries(SPIRITUAL_STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: disciples.filter((d) => d.spiritualStatus === key).length,
  })).filter((d) => d.value > 0)

  // Evangelism receptivity distribution
  const receptivityData = Object.entries(RECEPTIVITY_LABELS).map(([key, label]) => ({
    name: label,
    value: evangelism.filter((e) => e.receptivity === key).length,
  })).filter((d) => d.value > 0)

  // Evangelism outcome distribution
  const outcomeLabels: Record<string, string> = {
    salvation: 'Salvation',
    prayer_accepted: 'Prayer Accepted',
    follow_up_needed: 'Follow-up Needed',
    no_further_interest: 'No Further Interest',
    unreachable: 'Unreachable',
  }
  const outcomeData = Object.entries(outcomeLabels).map(([key, label]) => ({
    name: label,
    value: evangelism.filter((e) => e.outcome === key).length,
  })).filter((d) => d.value > 0)

  // Follow-up status breakdown
  const followUpStatusData = ['scheduled', 'completed', 'missed', 'rescheduled'].map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: followUps.filter((f) => f.status === status).length,
  })).filter((d) => d.value > 0)

  // Attendance by service type (average present count per session)
  const attendanceByType = Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => {
    const typeSessions = sessions.filter((s) => s.serviceType === key)
    const avgPresent = typeSessions.length
      ? Math.round(typeSessions.reduce((sum, s) => sum + s.presentDiscipleIds.length, 0) / typeSessions.length)
      : 0
    return { name: label, value: avgPresent, sessionCount: typeSessions.length }
  }).filter((d) => d.sessionCount > 0)

  // Attendance trend — sessions in chronological order, present count each
  const attendanceTrend = [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12) // last 12 sessions, else the chart gets unreadable
    .map((s) => ({ name: s.date, value: s.presentDiscipleIds.length }))

  const followUpCompletionRate = followUps.length
    ? Math.round((followUps.filter((f) => f.status === 'completed').length / followUps.length) * 100)
    : 0

  return {
    loading,
    spiritualStatusData,
    receptivityData,
    outcomeData,
    followUpStatusData,
    attendanceByType,
    attendanceTrend,
    followUpCompletionRate,
    totalDisciples: disciples.length,
    totalEvangelismRecords: evangelism.length,
  }
}
