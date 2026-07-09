import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Megaphone,
  CalendarClock,
  ClipboardCheck,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { NAV_ITEMS } from '../../utils/nav'
import { useAuth } from '../../context/AuthContext'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserPlus,
  Megaphone,
  CalendarClock,
  ClipboardCheck,
  ShieldCheck,
  Settings,
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth()
  if (!profile) return null

  const items = NAV_ITEMS.filter((item) => item.roles.includes(profile.role))

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 px-2 pt-2">
        <p className="text-lg font-semibold tracking-tight">Discipleship Tracker</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{profile.role === 'administrator' ? 'Administrator' : 'Worker'}</p>
      </div>
      {items.map((item) => {
        const Icon = ICONS[item.icon]
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
