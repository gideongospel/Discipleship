import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listDisciples } from '../services/discipleService'
import { listFollowUps } from '../services/followUpService'
import { listAttendanceSessions, calculateAttendanceStats } from '../services/attendanceService'
import type { Disciple, FollowUp } from '../types'

export function useDashboardStats() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [attendanceRate, setAttendanceRate] = useState(0)

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const [d, f, sessions] = await Promise.all([
        listDisciples(profile!),
        listFollowUps(profile!),
        listAttendanceSessions(),
      ])
      if (cancelled) return
      setDisciples(d)
      setFollowUps(f)

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

  const activeFollowUps = followUps.filter((f) => f.status === 'scheduled').length

  const today = new Date().toISOString().slice(0, 10)
  const upcomingFollowUps = followUps
    .filter((f) => f.status === 'scheduled' && f.scheduledDate >= today)
    .slice(0, 5)

  const recentDisciples = [...disciples]
    .sort((a, b) => (a.createdAt?.toMillis?.() < b.createdAt?.toMillis?.() ? 1 : -1))
    .slice(0, 5)

  return {
    loading,
    totalDisciples: disciples.length,
    newConverts,
    activeFollowUps,
    attendanceRate,
    upcomingFollowUps,
    recentDisciples,
  }
}
