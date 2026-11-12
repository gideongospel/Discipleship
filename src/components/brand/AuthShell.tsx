import type { ReactNode } from 'react'
import DoorsMark from './DoorsMark'
import Wordmark from './Wordmark'

// Shared entrance layout for Login and first-run Setup.
// Left: a still, ink-black stage. The doors slide open once and a thin shaft
// of light settles between them — then everything rests. No looping effects.
// Right: the form. On phones the stage collapses to a compact header.
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <p className="eyebrow !text-gold-400">Discipleship Tracker</p>

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute left-1/2 top-[9%] h-[78%] w-7 -translate-x-1/2 animate-light bg-gradient-to-b from-gold-300/0 via-gold-300/70 to-gold-300/0 blur-[9px]" />
            <DoorsMark size={236} tone="white" animate className="relative" />
          </div>
          <Wordmark size="lg" className="mt-11 text-white" />
        </div>

        <p className="max-w-sm font-display text-[1.35rem] font-light italic leading-snug text-white/75">
          Every disciple known.
          <br />
          Every follow-up kept.
        </p>
      </aside>

      <main className="relative flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-10 flex flex-col items-center text-center lg:hidden">
            <DoorsMark size={80} tone="auto" animate />
            <Wordmark size="md" className="mt-5 text-slate-950 dark:text-white" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
