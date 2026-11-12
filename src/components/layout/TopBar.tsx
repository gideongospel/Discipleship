import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, LogOut, Plus, CalendarClock } from '../ui/icons'
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

  // Needs attention = scheduled follow-ups that are overdue or due within 3 days.
  const due = followUps
    .filter((f) => f.status === 'scheduled' && daysFromToday(f.scheduledDate) <= 3)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center text-slate-500 transition-colors duration-200 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-slate-50/85 px-4 backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-950/80 lg:px-10">
      <div className="lg:hidden"><DoorsMark size={30} tone="auto" /></div>

      <button
        onClick={onSearch}
        className="group flex h-10 min-w-0 max-w-md flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 text-left text-sm text-slate-400 transition-colors duration-200 hover:border-slate-400 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25"
      >
        <Search size={16} strokeWidth={1.6} />
        <span className="flex-1 truncate">Search disciples or jump to…</span>
        <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 font-brand text-[0.58rem] font-bold tracking-wider sm:block dark:border-white/10">CTRL K</kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center">
        <button onClick={() => navigate('/disciples/new')} className="btn-primary mr-3 hidden !py-2 lg:inline-flex">
          <Plus size={15} strokeWidth={1.8} /> New disciple
        </button>

        <div className="relative">
          <button className={iconBtn} onClick={() => setMenu(menu === 'bell' ? null : 'bell')} title="Notifications">
            <Bell size={19} strokeWidth={1.5} />
            {due.length > 0 && (
              <span className="absolute right-1 top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-[3px] bg-gold-500 px-1 font-brand text-[0.55rem] font-bold text-slate-950">
                {due.length}
              </span>
            )}
          </button>
          {menu === 'bell' && (
            <>
              <button className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(null)} aria-label="Close" />
              <div className="card absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] animate-rise overflow-hidden">
                <div className="flex items-baseline justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <p className="font-display text-lg">Needs attention</p>
                  <span className="num font-display text-lg text-gold-600 dark:text-gold-400">{due.length}</span>
                </div>
                {due.length === 0 ? (
                  <p className="px-5 py-9 text-center text-sm text-slate-500">You're all caught up.</p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {due.slice(0, 8).map((f) => {
                      const overdue = daysFromToday(f.scheduledDate) < 0
                      return (
                        <li key={f.id}>
                          <button
                            onClick={() => { setMenu(null); navigate('/follow-ups') }}
                            className="flex w-full items-center gap-3.5 border-b border-slate-100 px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-slate-50 dark:border-white/[0.05] dark:hover:bg-white/[0.03]"
                          >
                            <CalendarClock size={18} strokeWidth={1.5} className={overdue ? 'text-rose-600 dark:text-rose-400' : 'text-gold-600 dark:text-gold-400'} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">{f.discipleName}</span>
                              <span className={`block text-xs ${overdue ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>{relativeDay(f.scheduledDate)}</span>
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
          {theme === 'light' ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
        </button>

        <div className="relative ml-2">
          <button onClick={() => setMenu(menu === 'profile' ? null : 'profile')} className="block rounded-full transition-opacity hover:opacity-80" aria-label="Account menu">
            <Avatar name={profile?.name ?? '?'} size={34} />
          </button>
          {menu === 'profile' && (
            <>
              <button className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(null)} aria-label="Close" />
              <div className="card absolute right-0 z-40 mt-2 w-60 animate-rise overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <p className="font-display text-lg leading-tight">{profile?.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Worker ID · <span className="num font-semibold">{profile?.loginId}</span></p>
                </div>
                <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-3.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-500/10 dark:text-rose-400">
                  <LogOut size={16} strokeWidth={1.6} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
