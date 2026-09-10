import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4
      bg-[var(--color-bg)] text-center px-4">
      <div className="text-6xl font-bold text-[var(--color-border)]">404</div>
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Page not found</h1>
      <p className="text-[var(--color-text-muted)] text-sm">
        This page doesn't exist in EduConnect yet.
      </p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mt-2 px-5 py-2 rounded-md text-sm font-medium text-white
          bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
      >
        Go to dashboard
      </button>
    </div>
  )
}