import type { LucideIcon } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp'

const ACCENTS: Record<string, string> = {
  brand: 'bg-gold-500/15 text-gold-600 dark:text-gold-400',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  red: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}

// Big-number stat tile. Numeric values count up on load; pass `progress`
// (0-100) to draw a gold ring instead of an icon chip.
export default function StatCard({
  label,
  value,
  suffix = '',
  icon: Icon,
  accent = 'brand',
  hint,
  progress,
}: {
  label: string
  value: number | string
  suffix?: string
  icon: LucideIcon
  accent?: 'brand' | 'green' | 'amber' | 'red'
  hint?: string
  progress?: number
}) {
  const numeric = typeof value === 'number'
  const counted = useCountUp(numeric ? value : 0)
  const shown = numeric ? counted : value
  const r = 19
  const c = 2 * Math.PI * r

  return (
    <div className="card card-hover group relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.66rem] font-bold uppercase leading-snug tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
        {progress !== undefined ? (
          <svg width="46" height="46" viewBox="0 0 46 46" className="-mr-1 -mt-1 shrink-0 -rotate-90">
            <circle cx="23" cy="23" r={r} fill="none" strokeWidth="4" className="stroke-slate-200 dark:stroke-white/10" />
            <circle
              cx="23" cy="23" r={r} fill="none" strokeWidth="4" strokeLinecap="round"
              className="stroke-gold-500 transition-all duration-1000"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - Math.min(100, Math.max(0, progress)) / 100)}
            />
          </svg>
        ) : (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent]}`}>
            <Icon size={17} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[2.35rem] font-extrabold leading-none tracking-tight text-slate-950 dark:text-white">
        {shown}
        {suffix && <span className="ml-0.5 text-xl font-bold text-gold-500">{suffix}</span>}
      </p>
      {hint && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}
