import { useCountUp } from '../../hooks/useCountUp'

// A single headline figure: small-cap label, large serif numeral, optional
// hairline progress. Deliberately no icon, no card — it sits on the page.
export default function Figure({
  label,
  value,
  suffix = '',
  hint,
  progress,
}: {
  label: string
  value: number | string
  suffix?: string
  hint?: string
  progress?: number
}) {
  const numeric = typeof value === 'number'
  const counted = useCountUp(numeric ? value : 0)
  const shown = numeric ? counted : value
  return (
    <div>
      <p className="font-brand text-[0.6rem] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="num mt-3 font-display text-[3.4rem] font-light leading-none tracking-tight text-slate-950 dark:text-white">
        {shown}
        {suffix && <span className="ml-1 text-[1.6rem] text-gold-600 dark:text-gold-400">{suffix}</span>}
      </p>
      {progress !== undefined && (
        <div className="relative mt-4 h-px w-full max-w-[9rem] bg-slate-300 dark:bg-white/20">
          <div
            className="absolute -top-px left-0 h-[3px] origin-left animate-draw bg-gold-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {hint && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}
