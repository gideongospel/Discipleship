import type { UserRole } from '../types'

export interface NavItem {
  to: string
  label: string
  icon: string
  roles: UserRole[]
  group: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['administrator', 'worker'], group: 'Overview' },
  { to: '/events', label: 'Announcements & Events', icon: 'CalendarClock', roles: ['administrator', 'worker'], group: 'Overview' },
  { to: '/disciples', label: 'Disciples', icon: 'Users', roles: ['administrator', 'worker'], group: 'People' },
  { to: '/disciples/new', label: 'New Registration', icon: 'UserPlus', roles: ['administrator', 'worker'], group: 'People' },
  { to: '/evangelism', label: 'Disciple Outreach', icon: 'Megaphone', roles: ['administrator', 'worker'], group: 'Ministry' },
  { to: '/outreach-activities', label: 'General Evangelism', icon: 'Megaphone', roles: ['administrator', 'worker'], group: 'Ministry' },
  { to: '/resources', label: 'Spiritual Resources', icon: 'Megaphone', roles: ['administrator', 'worker'], group: 'Ministry' },
  { to: '/meeting-library', label: 'Meeting Excerpts & Prayer', icon: 'BookOpen', roles: ['administrator', 'worker'], group: 'Ministry' },
  { to: '/follow-ups', label: 'Follow-ups', icon: 'CalendarClock', roles: ['administrator', 'worker'], group: 'Ministry' },
  { to: '/attendance', label: 'Attendance', icon: 'ClipboardCheck', roles: ['administrator', 'worker'], group: 'Ministry' },
  { to: '/reports', label: 'Reports', icon: 'BarChart3', roles: ['administrator', 'worker'], group: 'Insight' },
  { to: '/admin', label: 'Admin Panel', icon: 'ShieldCheck', roles: ['administrator'], group: 'Manage' },
  { to: '/settings', label: 'Settings', icon: 'Settings', roles: ['administrator', 'worker'], group: 'Manage' },
]
