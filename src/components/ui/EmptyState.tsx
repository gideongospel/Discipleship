import type { ReactNode } from 'react'

// A door left slightly ajar — the one illustration in the system.
export default function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex animate-fade-in flex-col items-center px-6 py-14 text-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-slate-300 dark:text-slate-600" aria-hidden="true">
        <path d="M14 56 V10 L40 6 V56 Z" />
        <path d="M40 6 L52 12 V54 L40 56" />
        <path d="M10 56 H54" />
        <circle cx="34" cy="32" r="1.4" fill="currentColor" stroke="none" />
        <path d="M46 24 V36 M42 29 H50" className="text-gold-500" stroke="currentColor" />
      </svg>
      <p className="mt-5 font-display text-xl text-slate-900 dark:text-white">{title}</p>
      {children && <p className="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
