import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Catches render-time crashes anywhere below it in the tree (including
// bugs in new features like Calendar sync or Reports) and shows a
// recoverable fallback instead of a blank white screen. This does NOT
// catch errors inside async code (e.g. a failed fetch) — those are
// handled locally where they happen, per the try/catch pattern used in
// googleCalendarService.ts and GoogleCalendarContext.tsx. This is only
// the last-resort net for something neither of those caught.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
          <div className="card max-w-sm p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h1 className="mb-2 text-lg font-semibold">Something went wrong</h1>
            <p className="mb-4 text-sm text-slate-500">
              The app hit an unexpected error. Your data is saved — this only affects the current screen. Reloading
              usually fixes it.
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary w-full">
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
