// In-page loading state: calm skeleton rows instead of a spinner. The page
// shape appears instantly, then content replaces it.
export default function PageLoader({ rows = 6 }: { rows?: number }) {
  const bar = 'rounded bg-[linear-gradient(90deg,transparent,rgba(160,150,120,0.18),transparent)] bg-[length:200%_100%] animate-shimmer bg-slate-200/60 dark:bg-white/[0.06]'
  return (
    <div className="animate-fade-in" aria-busy="true" aria-label="Loading">
      <div className={`${bar} mb-3 h-3 w-24`} />
      <div className={`${bar} mb-10 h-9 w-64`} />
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={`${bar} h-9 w-9 shrink-0 !rounded-full`} />
            <div className="flex-1 space-y-2">
              <div className={`${bar} h-3.5`} style={{ width: `${55 + ((i * 17) % 35)}%` }} />
              <div className={`${bar} h-3`} style={{ width: `${25 + ((i * 11) % 25)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
