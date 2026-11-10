import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, LogOut, Plus, CalendarClock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { listFollowUps } from '../../services/followUpService'
import type { FollowUp } from '../../types'
import { daysFromToday, relativeDay } from '../../utils/format'
import DoorsMark from '../brand/DoorsMark'
import Avatar from '../ui/Avatar'

export default function TopBar({ onSearch }: { onSearch: () => void }) {
  const { profile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menu, setMenu] = useState<'profile' | 'bell' | null>(null)
  const [followUps, setFollowUps] = useState<FollowUp[]>([])

  useEffect(() => {
    if (profile) listFollowUps(profile).then(setFollowUps).catch(() => setFollowUps([]))
  }, [profile])

  // Needs-attention = scheduled follow-ups that are overdue or due within 3 days.
  const due = followUps
    .filter((f) => f.status === 'scheduled' && daysFromToday(f.scheduledDate) <= 3)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-950/75 lg:px-10">
      <div className="lg:hidden"><DoorsMark size={30} tone="auto" /></div>

      <button
        onClick={onSearch}
        className="group ml-1 flex h-10 max-w-md flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 text-left text-sm text-slate-400 transition hover:border-gold-400/60 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <Search size={16} />
        <span className="flex-1 truncate">Search disciples or jump to…</span>
        <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[0.65rem] font-bold sm:block dark:border-white/10">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button onClick={() => navigate('/disciples/new')} className="btn-primary mr-2 hidden !py-2 lg:inline-flex">
          <Plus size={16} /> New Disciple
        </button>

        <div className="relative">
          <button className={iconBtn} onClick={() => setMenu(menu === 'bell' ? null : 'bell')} title="Notifications">
            <Bell size={18} />
            {due.length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.6rem] font-extrabold text-slate-950">
                {due.length}
              </span>
            )}
          </button>
          {menu === 'bell' && (
            <>
              <button className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(null)} aria-label="Close" />
              <div className="card absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] animate-fade-up overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
                  <p className="font-display text-sm font-extrabold">Needs attention</p>
                  <span className="chip bg-gold-500/15 text-gold-700 dark:text-gold-300">{due.length}</span>
                </div>
                {due.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-500">You're all caught up.</p>
                ) : (
                  <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-white/[0.06]">
                    {due.slice(0, 8).map((f) => {
                      const overdue = daysFromToday(f.scheduledDate) < 0
                      return (
                        <li key={f.id}>
                          <button
                            onClick={() => { setMenu(null); navigate('/follow-ups') }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                          >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${overdue ? 'bg-rose-500/15 text-rose-500' : 'bg-gold-500/15 text-gold-600 dark:text-gold-400'}`}>
                              <CalendarClock size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">Follow up with {f.discipleName}</span>
                              <span className={`block text-xs font-semibold ${overdue ? 'text-rose-500' : 'text-slate-500'}`}>{relativeDay(f.scheduledDate)}</span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <button className={iconBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative ml-1">
          <button onClick={() => setMenu(menu === 'profile' ? null : 'profile')} className="rounded-full ring-2 ring-transparent transition hover:ring-gold-400/60">
            <Avatar name={profile?.name ?? '?'} size={36} />
          </button>
          {menu === 'profile' && (
            <>
              <button className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(null)} aria-label="Close" />
              <div className="card absolute right-0 z-40 mt-2 w-60 animate-fade-up overflow-hidden">
                <div className="border-b border-slate-200 px-4 py-3.5 dark:border-white/10">
                  <p className="text-sm font-bold">{profile?.name}</p>
                  <p className="text-xs text-slate-500">Worker ID · <span className="font-mono">{profile?.loginId}</span></p>
                </div>
                <button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-500/10">
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
