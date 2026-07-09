import { useState } from 'react'
import { Menu, Search, Bell, Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { profile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search disciples, records..."
          className="input pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" title="Notifications">
          <Bell size={18} />
        </button>
        <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setProfileOpen((o) => !o)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {profile?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="text-sm font-medium">{profile?.name}</p>
                <p className="truncate text-xs text-slate-500">Worker ID: {profile?.loginId}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
