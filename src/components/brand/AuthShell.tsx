import type { ReactNode } from 'react'
import DoorsMark from './DoorsMark'
import Wordmark from './Wordmark'

// Shared entrance layout for Login and first-run Setup.
// Left: the brand "stage" — the doors slide open over a gold light beam.
// Right: the form. On phones the stage collapses to a compact header.
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid-cols-[1.08fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 50% 44%, rgba(200,162,74,0.30), transparent 70%), radial-gradient(90% 60% at 50% 110%, rgba(200,162,74,0.10), transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
        <div className="absolute left-1/2 top-0 h-full w-56 -translate-x-1/2 animate-beam bg-gradient-to-b from-transparent via-gold-400/25 to-transparent blur-3xl" />

        <div className="relative eyebrow !text-gold-400">Discipleship Tracker</div>

        <div className="relative flex flex-col items-center text-center">
          <DoorsMark size={250} tone="white" animate />
          <Wordmark size="lg" className="mt-9 text-white" />
        </div>

        <p className="relative max-w-sm font-display text-lg font-semibold leading-snug text-white/80">
          Every disciple known.
          <br />
          <span className="text-gold-400">Every follow-up kept.</span>
        </p>
      </aside>

      <main className="relative flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-9 flex flex-col items-center text-center lg:hidden">
            <DoorsMark size={84} tone="auto" animate />
            <Wordmark size="md" className="mt-5 text-slate-950 dark:text-white" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
