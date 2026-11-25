import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listDisciples } from '../services/discipleService'
import { listFollowUps } from '../services/followUpService'
import { listAttendanceSessions, calculateAttendanceStats, type AttendanceSession } from '../services/attendanceService'
import { getFollowUpSettings, DEFAULT_FOLLOW_UP_SETTINGS, type FollowUpSettings } from '../services/followUpSettingsService'
import type { Disciple, FollowUp } from '../types'
import { listChurchEvents, type ChurchEvent } from '../services/churchEventService'
import { listChurchResources, type ChurchResource } from '../services/churchResourceService'

export function useDashboardStats() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [resources, setResources] = useState<ChurchResource[]>([])
  const [attendanceRate, setAttendanceRate] = useState(0)
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSettings>(DEFAULT_FOLLOW_UP_SETTINGS)

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const [d, f, sessions, churchEvents, churchResources, thresholds] = await Promise.all([
        listDisciples(profile!),
        listFollowUps(profile!),
        listAttendanceSessions(),
        listChurchEvents(false),
        listChurchResources(profile!, false),
        getFollowUpSettings(),
      ])
      if (cancelled) return
      setDisciples(d)
      setFollowUps(f)
      setEvents(churchEvents)
      setResources(churchResources)
      setAttendanceSessions(sessions)
      setFollowUpSettings(thresholds)

      // Overall attendance rate = average of each disciple's individual rate
      if (d.length > 0 && sessions.length > 0) {
        const total = d.reduce(
          (sum, disciple) =>
            sum + calculateAttendanceStats(sessions, disciple.id, disciple.dateFirstContacted).rate,
          0,
        )
        setAttendanceRate(Math.round(total / d.length))
      } else {
        setAttendanceRate(0)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [profile])

  const newConverts = disciples.filter((d) =>
    ['initially_saved', 'saved_through_us', 'saved_and_filled_through_us'].includes(d.spiritualStatus),
  ).length

  const activeFollowUps = followUps.filter((f) => ['scheduled', 'postponed', 'pending', 'rescheduled'].includes(f.status)).length

  const now = new Date()
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const attentionDate = new Date(now)
  attentionDate.setDate(attentionDate.getDate() - followUpSettings.neglectAfterDays)
  const attentionCutoff = new Date(attentionDate.getTime() - attentionDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const upcomingFollowUps = followUps
    .filter((f) => ['scheduled', 'postponed', 'pending', 'rescheduled'].includes(f.status) && f.scheduledDate >= today)
    .slice(0, 5)
  const upcomingEvents = events.filter((event) => event.date >= today).slice(0, 4)
  const followUpsDueToday = followUps.filter((item) => ['scheduled', 'postponed', 'pending', 'rescheduled'].includes(item.status) && item.scheduledDate === today)
  const overdueFollowUps = followUps.filter((item) => ['scheduled', 'postponed', 'pending', 'rescheduled'].includes(item.status) && item.scheduledDate < today)
  const neglectedDisciples = disciples.filter((disciple) => (disciple.lastFollowUpDate || disciple.dateFirstContacted) <= attentionCutoff).slice(0, 6)
  const missedMeetingDisciples = disciples.filter((disciple) => calculateAttendanceStats(attendanceSessions, disciple.id, disciple.dateFirstContacted).missed >= followUpSettings.missedMeetingThreshold).slice(0, 6)
  const newConvertCutoffDate = new Date(now)
  newConvertCutoffDate.setDate(newConvertCutoffDate.getDate() - followUpSettings.newConvertFollowUpDays)
  const newConvertCutoff = new Date(newConvertCutoffDate.getTime() - newConvertCutoffDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const newConvertsNeedingFollowUp = disciples.filter((disciple) => ['initially_saved', 'saved_through_us', 'saved_and_filled_through_us'].includes(disciple.spiritualStatus) && (disciple.lastFollowUpDate || disciple.dateFirstContacted) <= newConvertCutoff).slice(0, 6)
  const latestExcerpts = resources.filter((item) => item.type === 'meeting_excerpt').slice(0, 3)
  const currentPrayerPoints = resources.filter((item) => item.type === 'prayer_point' && (!item.expiryDate || item.expiryDate >= today)).slice(0, 4)

  const recentDisciples = [...disciples]
    .sort((a, b) => (a.createdAt?.toMillis?.() < b.createdAt?.toMillis?.() ? 1 : -1))
    .slice(0, 5)

  return {
    loading,
    disciples,
    followUps,
    totalDisciples: disciples.length,
    newConverts,
    activeFollowUps,
    attendanceRate,
    upcomingFollowUps,
    upcomingEvents,
    followUpsDueToday,
    overdueFollowUps,
    neglectedDisciples,
    missedMeetingDisciples,
    newConvertsNeedingFollowUp,
    followUpSettings,
    latestExcerpts,
    currentPrayerPoints,
    recentDisciples,
  }
}
