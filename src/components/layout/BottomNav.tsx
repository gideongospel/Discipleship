import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Plus, CalendarClock, Menu } from 'lucide-react'

// App-style tab bar for phones. The raised gold button is the quick
// "register a disciple" action (the floating action button of the spec).
export default function BottomNav({ onMore }: { onMore: () => void }) {
  const navigate = useNavigate()
  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] transition-colors ${
      isActive ? 'text-gold-600 dark:text-gold-400' : 'text-slate-400'
    }`

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/90 lg:hidden">
      <div className="mx-auto flex max-w-md items-end px-2">
        <NavLink to="/" end className={tab}><LayoutDashboard size={20} />Home</NavLink>
        <NavLink to="/disciples" end className={tab}><Users size={20} />People</NavLink>
        <div className="flex flex-1 justify-center">
          <button
            onClick={() => navigate('/disciples/new')}
            aria-label="Register a new disciple"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-slate-950 shadow-[0_10px_28px_-6px_rgba(200,162,74,0.75)] ring-4 ring-slate-50 transition active:scale-95 dark:ring-slate-950"
          >
            <Plus size={26} strokeWidth={2.6} />
          </button>
        </div>
        <NavLink to="/follow-ups" className={tab}><CalendarClock size={20} />Visits</NavLink>
        <button onClick={onMore} className={tab({ isActive: false })}><Menu size={20} />More</button>
      </div>
    </nav>
  )
}
