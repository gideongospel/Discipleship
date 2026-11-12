import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, Megaphone, CalendarClock, ClipboardCheck,
  ShieldCheck, Settings, BarChart3, LogOut, type IconType,
} from '../ui/icons'
import { NAV_ITEMS } from '../../utils/nav'
import { useAuth } from '../../context/AuthContext'
import DoorsMark from '../brand/DoorsMark'
import Wordmark from '../brand/Wordmark'
import Avatar from '../ui/Avatar'

const ICONS: Record<string, IconType> = {
  LayoutDashboard, Users, UserPlus, Megaphone, CalendarClock, ClipboardCheck, ShieldCheck, Settings, BarChart3,
}

// Always ink-black, in light and dark mode alike — the brand's anchor.
// The active page is marked by a single gold rule, like a bookmark ribbon.
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, logout } = useAuth()
  if (!profile) return null

  const items = NAV_ITEMS.filter((item) => item.roles.includes(profile.role))
  const groups = Array.from(new Set(items.map((i) => i.group)))

  return (
    <nav className="flex h-full flex-col bg-slate-950 text-slate-400">
      <div className="flex items-center gap-3.5 px-6 pb-7 pt-8 text-white">
        <DoorsMark size={34} tone="white" />
        <Wordmark size="sm" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-3 pb-2 pt-6 font-brand text-[0.56rem] font-bold uppercase tracking-[0.3em] text-slate-600">{group}</p>
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
                      `group relative flex items-center gap-3.5 px-3 py-2.5 text-[0.85rem] font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-white before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[2px] before:-translate-y-1/2 before:bg-gold-400'
                          : 'hover:text-slate-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          className={`transition-transform duration-300 group-hover:translate-x-0.5 ${isActive ? 'text-gold-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                )
              })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-white/[0.07] px-6 py-5">
        <Avatar name={profile.name} size={34} onDark />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.82rem] font-semibold text-white">{profile.name}</p>
          <p className="font-brand text-[0.56rem] font-bold uppercase tracking-[0.24em] text-gold-400">
            {profile.role === 'administrator' ? 'Administrator' : 'Worker'}
          </p>
        </div>
        <button onClick={logout} title="Sign out" aria-label="Sign out" className="p-1 text-slate-500 transition-colors duration-200 hover:text-white">
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  )
}
