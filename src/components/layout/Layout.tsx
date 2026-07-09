import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-950">
            <div className="flex justify-end p-2">
              <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileNavOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Floating action button — quick disciple registration from anywhere */}
      <button
        onClick={() => navigate('/disciples/new')}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-700 lg:bottom-8 lg:right-8"
        title="New Disciple"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
