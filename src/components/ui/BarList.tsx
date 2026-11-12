// Horizontal ledger bars: label, count, and a thin gold bar that draws in.
// Used in place of pie charts — easier to read, quieter, and lighter to load.
export default function BarList({ items }: { items: { name: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={item.name}>
          <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
            <span className="num font-display text-lg text-slate-950 dark:text-white">{item.value}</span>
          </div>
          <div className="h-[3px] w-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full origin-left animate-draw bg-gold-500"
              style={{ width: `${(item.value / max) * 100}%`, animationDelay: `${0.15 + i * 0.07}s` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
