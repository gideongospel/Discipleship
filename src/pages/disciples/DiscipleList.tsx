import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listDisciples } from '../../services/discipleService'
import type { Disciple } from '../../types'
import { SPIRITUAL_STATUS_LABELS } from '../../types'
import { SPIRITUAL_STATUS_OPTIONS, statusBadgeColor } from '../../utils/constants'
import { exportToCsv } from '../../utils/csv'
import { FullScreenLoader } from '../../components/layout/ProtectedRoute'

export default function DiscipleList() {
  const { profile } = useAuth()
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!profile) return
    listDisciples(profile).then((d) => {
      setDisciples(d)
      setLoading(false)
    })
  }, [profile])

  const filtered = useMemo(() => {
    return disciples.filter((d) => {
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.phone.includes(search) ||
        d.outreachLocation.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || d.spiritualStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [disciples, search, statusFilter])

  const handleExport = () => {
    exportToCsv(
      'disciples.csv',
      filtered.map((d) => ({
        Name: d.name,
        Gender: d.gender,
        Phone: d.phone,
        Address: d.address,
        'Outreach Location': d.outreachLocation,
        'Spiritual Status': SPIRITUAL_STATUS_LABELS[d.spiritualStatus],
        'Assigned Workers': d.assignedWorkerNames?.join('; '),
        'Date First Contacted': d.dateFirstContacted,
      })),
    )
  }

  if (loading) return <FullScreenLoader />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Disciple Directory</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/disciples/new" className="btn-primary">
            New Disciple
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, phone, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-64" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All spiritual statuses</option>
          {SPIRITUAL_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Worker</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No disciples found.
                </td>
              </tr>
            )}
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link to={`/disciples/${d.id}`} className="font-medium hover:text-brand-600">
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.phone}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.outreachLocation}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeColor(d.spiritualStatus)}`}>
                    {SPIRITUAL_STATUS_LABELS[d.spiritualStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.assignedWorkerNames?.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
