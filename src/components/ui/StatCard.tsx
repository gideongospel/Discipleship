import type { LucideIcon } from 'lucide-react'

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'brand',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: 'brand' | 'green' | 'amber' | 'red'
}) {
  const accentClasses: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  )
}
