import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { X } from '../ui/icons'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import CommandPalette from './CommandPalette'
import DoorsMark from '../brand/DoorsMark'

export default function Layout() {
  const [drawer, setDrawer] = useState(false)
  const [palette, setPalette] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-[17rem] shrink-0 lg:block">
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 animate-door-left shadow-2xl">
            <button className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 hover:bg-white/10" onClick={() => setDrawer(false)}>
              <X size={18} />
            </button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar onSearch={() => setPalette(true)} />

        {/* Brand watermark: oversized, cropped off the corner, barely there. */}
        <div className="pointer-events-none fixed -bottom-48 -right-36 z-0 hidden opacity-[0.022] lg:block dark:opacity-[0.03]" aria-hidden="true">
          <DoorsMark size={520} tone="auto" />
        </div>

        <main className="relative z-[1] flex-1 overflow-y-auto px-4 pb-32 pt-6 lg:px-10 lg:pb-10 lg:pt-9">
          <div key={location.pathname} className="mx-auto w-full max-w-6xl animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav onMore={() => setDrawer(true)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  )
}
