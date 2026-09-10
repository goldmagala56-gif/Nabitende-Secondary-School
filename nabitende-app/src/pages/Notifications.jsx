import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, MessageSquare,
         Megaphone, Info, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import PageShell from '../components/PageShell'
import SectionCard from '../components/SectionCard'

const TYPE_CONFIG = {
  message:   { icon: MessageSquare, bg: 'bg-green-100',  text: 'text-green-700',  label: 'Message'   },
  broadcast: { icon: Megaphone,     bg: 'bg-orange-100', text: 'text-orange-700', label: 'Broadcast' },
  general:   { icon: Info,          bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'General'   },
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Notifications({ role }) {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [clearing,      setClearing]      = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchNotifications() }, [])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (err) {}
  }

  async function handleMarkAllRead() {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {}
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {}
  }

  async function handleClearAll() {
    setClearing(true)
    try {
      await api.delete('/notifications')
      setNotifications([])
    } catch (err) {} finally {
      setClearing(false)
    }
  }

  async function handleClick(notif) {
    await handleMarkRead(notif.id)
    if (notif.link) navigate(`/${role}${notif.link}`)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <PageShell
      title="Notifications"
      subtitle={unreadCount > 0
        ? `${unreadCount} unread`
        : 'All caught up!'}
    >
      {/* Action bar */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                border-2 border-[var(--color-border)] text-[13px]
                font-semibold text-[var(--color-text-muted)]
                hover:bg-[var(--color-bg)] transition-colors">
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
              border-2 border-red-200 text-[13px] font-semibold
              text-red-600 hover:bg-red-50 transition-colors
              disabled:opacity-40">
            <Trash2 size={15} />
            {clearing ? 'Clearing...' : 'Clear all'}
          </button>
        </div>
      )}

      <SectionCard noPadding>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-border)]
              flex items-center justify-center">
              <Bell size={24} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[15px] font-semibold
              text-[var(--color-text)]">
              No notifications
            </p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {notifications.map(notif => {
              const cfg  = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general
              const Icon = cfg.icon
              return (
                <div key={notif.id}
                  className={`flex items-start gap-3 px-4 py-4
                    transition-colors cursor-pointer group ${
                    notif.is_read
                      ? 'hover:bg-[var(--color-bg)]'
                      : 'bg-blue-50/40 hover:bg-blue-50'
                  }`}
                  onClick={() => handleClick(notif)}>

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex-shrink-0
                    flex items-center justify-center
                    ${cfg.bg} ${cfg.text}`}>
                    <Icon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13px] ${
                        notif.is_read
                          ? 'text-[var(--color-text-muted)]'
                          : 'font-semibold text-[var(--color-text)]'
                      }`}>
                        {notif.title}
                      </p>
                      <span className="text-[11px] text-[var(--color-text-muted)]
                        flex-shrink-0">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    {notif.body && (
                      <p className="text-[12px] text-[var(--color-text-muted)]
                        mt-0.5 line-clamp-2">
                        {notif.body}
                      </p>
                    )}
                    <span className={`inline-block mt-1.5 text-[10px]
                      font-semibold px-2 py-0.5 rounded-full
                      ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1
                    opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.is_read && (
                      <button
                        onClick={e => { e.stopPropagation(); handleMarkRead(notif.id) }}
                        className="p-1.5 rounded-lg hover:bg-green-100
                          text-green-600 transition-colors"
                        title="Mark as read">
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(notif.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-100
                        text-red-500 transition-colors"
                      title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500
                      flex-shrink-0 mt-1.5" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}