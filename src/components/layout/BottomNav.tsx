import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Plus, CalendarClock, Menu } from '../ui/icons'

// Phone tab bar. The centre button is the quick "register a disciple" action —
// flush with the bar (a square-cornered key), not a floating circle.
export default function BottomNav({ onMore }: { onMore: () => void }) {
  const navigate = useNavigate()
  const tab = ({ isActive }: { isActive: boolean }) =>
    `relative flex flex-1 flex-col items-center gap-1 pb-2 pt-3 font-brand text-[0.55rem] font-bold uppercase tracking-[0.16em] transition-colors ${
      isActive
        ? 'text-gold-700 before:absolute before:left-1/2 before:top-0 before:h-[2px] before:w-7 before:-translate-x-1/2 before:bg-gold-500 dark:text-gold-400'
        : 'text-slate-400'
    }`

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-slate-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-slate-950/95 lg:hidden">
      <div className="mx-auto flex max-w-md items-center px-2">
        <NavLink to="/" end className={tab}><LayoutDashboard size={20} strokeWidth={1.5} />Home</NavLink>
        <NavLink to="/disciples" end className={tab}><Users size={20} strokeWidth={1.5} />People</NavLink>
        <div className="flex flex-1 justify-center">
          <button
            onClick={() => navigate('/disciples/new')}
            aria-label="Register a new disciple"
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white transition-transform active:scale-90 dark:bg-gold-500 dark:text-slate-950"
          >
            <Plus size={22} strokeWidth={1.8} />
          </button>
        </div>
        <NavLink to="/follow-ups" className={tab}><CalendarClock size={20} strokeWidth={1.5} />Visits</NavLink>
        <button onClick={onMore} className={tab({ isActive: false })}><Menu size={20} strokeWidth={1.5} />More</button>
      </div>
    </nav>
  )
}
