import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <p className="text-4xl font-bold text-slate-300 dark:text-slate-700">404</p>
      <p className="text-slate-500">Page not found</p>
      <Link to="/" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  )
}
