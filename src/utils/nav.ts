import type { UserRole } from '../types'

export interface NavItem {
  to: string
  label: string
  icon: string // lucide-react icon name, resolved in Sidebar
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['administrator', 'worker'] },
  { to: '/disciples', label: 'Disciple Directory', icon: 'Users', roles: ['administrator', 'worker'] },
  { to: '/disciples/new', label: 'New Registration', icon: 'UserPlus', roles: ['administrator', 'worker'] },
  { to: '/evangelism', label: 'Evangelism Log', icon: 'Megaphone', roles: ['administrator', 'worker'] },
  { to: '/follow-ups', label: 'Follow-up Tracker', icon: 'CalendarClock', roles: ['administrator', 'worker'] },
  { to: '/attendance', label: 'Attendance', icon: 'ClipboardCheck', roles: ['administrator', 'worker'] },
  { to: '/admin', label: 'Admin Panel', icon: 'ShieldCheck', roles: ['administrator'] },
  { to: '/settings', label: 'Settings', icon: 'Settings', roles: ['administrator', 'worker'] },
]
