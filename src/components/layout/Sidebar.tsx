import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, Megaphone, CalendarClock, ClipboardCheck,
  ShieldCheck, Settings, BarChart3, type LucideIcon,
} from 'lucide-react'
import { NAV_ITEMS } from '../../utils/nav'
import { useAuth } from '../../context/AuthContext'
import DoorsMark from '../brand/DoorsMark'
import Wordmark from '../brand/Wordmark'
import Avatar from '../ui/Avatar'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserPlus, Megaphone, CalendarClock, ClipboardCheck, ShieldCheck, Settings, BarChart3,
}

// The sidebar is always ink-black (in light AND dark mode) — it's the
// brand's anchor. Active items get a gold light-bar, echoing the doors.
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth()
  if (!profile) return null

  const items = NAV_ITEMS.filter((item) => item.roles.includes(profile.role))
  const groups = Array.from(new Set(items.map((i) => i.group)))

  return (
    <nav className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-slate-400">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56"
        style={{ background: 'radial-gradient(80% 100% at 30% 0%, rgba(200,162,74,0.16), transparent 70%)' }}
      />

      <div className="relative flex items-center gap-3 px-5 pb-6 pt-7 text-white">
        <DoorsMark size={38} tone="white" />
        <Wordmark size="sm" />
      </div>

      <div className="relative flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-1.5 px-3 text-[0.6rem] font-bold uppercase tracking-[0.26em] text-slate-600">{group}</p>
            <div className="space-y-0.5">
              {items
                .filter((i) => i.group === group)
                .map((item) => {
                  const Icon = ICONS[item.icon]
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/' || item.to === '/disciples'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.84rem] font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-white/[0.08] text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-gold-400 before:shadow-[0_0_12px_rgba(214,180,94,0.9)]'
                            : 'hover:bg-white/[0.04] hover:text-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={17} className={isActive ? 'text-gold-400' : 'text-slate-500 group-hover:text-slate-300'} />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="relative m-3 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
        <Avatar name={profile.name} size={38} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{profile.name}</p>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold-400">
            {profile.role === 'administrator' ? 'Administrator' : 'Worker'}
          </p>
        </div>
      </div>
    </nav>
  )
}
