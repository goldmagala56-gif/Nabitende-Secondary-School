import { Menu, Search, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api'

const roleConfig = {
  admin:      { color: '#ea580c' },
  teacher:    { color: '#1a6b4a' },
  parent:     { color: '#0891b2' },
  student:    { color: '#7c3aed' },
  government: { color: '#1d4ed8' },
}

export default function Topbar({ role, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  // ✅ FIX 1: greeting and hour defined inside component
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // ✅ FIX 2: color derived from roleConfig inside component
  const color = roleConfig[role]?.color || '#1a6b4a'

  // ✅ FIX 3: handleLogout defined inside component
  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await api.get('/messages/unread-count')
        setUnread(res.data.count || 0)
      } catch (err) {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  // Add to your existing imports at top of Topbar.jsx
  // (useEffect, useState, api already imported)

  // Add this state inside the component alongside existing state:
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    async function fetchNotifCount() {
      try {
        const res = await api.get('/notifications/unread-count')
        setNotifCount(res.data.count || 0)
      } catch (err) {}
    }
    fetchNotifCount()
    const interval = setInterval(fetchNotifCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-14 flex items-center gap-3 px-5
      bg-[var(--color-surface)] border-b border-[var(--color-border)] flex-shrink-0 relative">

      <button
        onClick={onMenuClick}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]
          p-1.5 rounded-md hover:bg-[var(--color-bg)] transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[var(--color-text)] truncate">
          {greeting}, {user?.name || 'User'} 👋
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)] truncate">
          {user?.school || ''} · Term 2, 2026
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5
          rounded-md border border-[var(--color-border)]
          text-[13px] text-[var(--color-text-muted)]
          hover:bg-[var(--color-bg)] transition-colors">
          <Search size={14} />
          <span>Search…</span>
        </button>

        <button
          onClick={() => navigate(`/${role}/notifications`)}
          className="relative p-2 rounded-md text-[var(--color-text-muted)]
            hover:bg-[var(--color-bg)] transition-colors">
          <Bell size={18} />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full
              bg-red-500 border-2 border-white flex items-center justify-center
              text-[9px] font-bold text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5
              rounded-md hover:bg-[var(--color-bg)] transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center
                text-white text-[11px] font-semibold"
              style={{ background: color }}
            >
              {user?.initials || '?'}
            </div>
            <ChevronDown size={13} className="text-[var(--color-text-muted)]" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48
              bg-[var(--color-surface)] border border-[var(--color-border)]
              rounded-lg shadow-md z-50 py-1">
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <p className="text-[13px] font-medium text-[var(--color-text)]">
                  {user?.name}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2
                  text-[13px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}