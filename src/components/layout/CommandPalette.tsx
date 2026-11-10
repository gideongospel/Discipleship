import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, UserPlus, Megaphone, CalendarClock, ClipboardCheck, BarChart3, ShieldCheck, Settings, CornerDownLeft,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listDisciples } from '../../services/discipleService'
import { SPIRITUAL_STATUS_LABELS, type Disciple } from '../../types'
import Avatar from '../ui/Avatar'

interface Item {
  key: string
  label: string
  hint: string
  to: string
  icon?: LucideIcon
  name?: string
}

const ACTIONS: (Item & { admin?: boolean })[] = [
  { key: 'a-new', label: 'Register a new disciple', hint: 'Action', to: '/disciples/new', icon: UserPlus },
  { key: 'a-out', label: 'Log an outreach', hint: 'Action', to: '/evangelism', icon: Megaphone },
  { key: 'a-fu', label: 'Schedule a follow-up', hint: 'Action', to: '/follow-ups', icon: CalendarClock },
  { key: 'a-att', label: 'Take attendance', hint: 'Action', to: '/attendance', icon: ClipboardCheck },
  { key: 'a-rep', label: 'Open reports', hint: 'Go to', to: '/reports', icon: BarChart3 },
  { key: 'a-adm', label: 'Admin panel', hint: 'Go to', to: '/admin', icon: ShieldCheck, admin: true },
  { key: 'a-set', label: 'Settings', hint: 'Go to', to: '/settings', icon: Settings },
]

// Ctrl/Cmd + K — jump to any disciple or action without touching the sidebar.
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !profile) return
    setQuery('')
    setActive(0)
    setTimeout(() => inputRef.current?.focus(), 30)
    listDisciples(profile).then(setDisciples).catch(() => setDisciples([]))
  }, [open, profile])

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const actions = ACTIONS.filter((a) => !a.admin || profile?.role === 'administrator').filter(
      (a) => !q || a.label.toLowerCase().includes(q),
    )
    const people: Item[] = disciples
      .filter(
        (d) =>
          q &&
          (d.name.toLowerCase().includes(q) ||
            d.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            d.outreachLocation.toLowerCase().includes(q)),
      )
      .slice(0, 7)
      .map((d) => ({
        key: d.id,
        label: d.name,
        hint: `${SPIRITUAL_STATUS_LABELS[d.spiritualStatus]} · ${d.outreachLocation}`,
        to: `/disciples/${d.id}`,
        name: d.name,
      }))
    return [...people, ...actions]
  }, [query, disciples, profile])

  useEffect(() => setActive(0), [query])

  if (!open) return null

  const go = (item?: Item) => {
    if (!item) return
    onClose()
    navigate(item.to)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[active]) }
    else if (e.key === 'Escape') onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/55 px-4 pt-[11vh] backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-xl animate-fade-up overflow-hidden !rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-white/10">
          <Search size={18} className="text-gold-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search disciples, or jump to anything…"
            className="w-full bg-transparent py-4 text-[0.95rem] outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[0.65rem] font-bold text-slate-400 dark:border-white/10">ESC</kbd>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-500">Nothing found.</li>}
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <li key={item.key}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    i === active ? 'bg-gold-500/12 dark:bg-gold-500/15' : ''
                  }`}
                >
                  {item.name ? (
                    <Avatar name={item.name} size={32} />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                      {Icon && <Icon size={15} />}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    <span className="block truncate text-xs text-slate-500">{item.hint}</span>
                  </span>
                  {i === active && <CornerDownLeft size={14} className="text-gold-500" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
