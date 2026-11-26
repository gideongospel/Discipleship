import { Component, type ReactNode } from 'react'
import { AlertTriangle } from './ui/icons'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  componentStack: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: '' }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info.componentStack)
    this.setState({ componentStack: info.componentStack || '' })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
          <div className="card w-full max-w-lg p-6">
            <AlertTriangle className="mx-auto mb-5 text-rose-600" size={30} strokeWidth={1.4} />
            <h1 className="mb-2 text-center font-display text-2xl">Something went wrong</h1>
            <p className="mb-4 text-center text-sm text-slate-500">
              The app encountered an unexpected screen error. Your saved data is not affected.
            </p>
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left dark:border-rose-900/50 dark:bg-rose-950/30">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Error details</p>
              <p className="break-words font-mono text-xs text-rose-800 dark:text-rose-200">{this.state.error.message || 'No error message was provided.'}</p>
            </div>
            {this.state.componentStack && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">Technical details</summary>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-100 p-3 text-[10px] text-slate-600 dark:bg-slate-900 dark:text-slate-300">{this.state.componentStack}</pre>
              </details>
            )}
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
