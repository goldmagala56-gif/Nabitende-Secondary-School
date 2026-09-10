import { useState, useEffect } from 'react'
import {
  BookOpen, ClipboardCheck, Users, MessageSquare,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

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

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null)
  const [attendanceSummary, setAttendanceSummary] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/teacher')
      setStats(res.data.stats)
      setAttendanceSummary(res.data.attendanceSummary || [])
      setRecentMessages(res.data.recentMessages || [])
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    { label: 'My classes',      value: String(stats.classCount),   sub: stats.subject || '',        color: '#1a6b4a', icon: BookOpen },
    { label: 'Students taught', value: String(stats.totalStudents), sub: 'across all classes',       color: '#2563eb', icon: Users },
    { label: 'Attendance marked', value: `${stats.classesMarked}/${stats.classCount}`, sub: stats.latestDate ? `as of ${new Date(stats.latestDate).toLocaleDateString()}` : 'no records yet', color: '#f59e0b', icon: ClipboardCheck },
    { label: 'Unread messages', value: String(stats.unreadCount),  sub: 'need reply',               color: '#7c3aed', icon: MessageSquare },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">
          My Dashboard
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {stats?.subject ? `${stats.subject} Dept.` : 'Teacher overview'}
        </p>
      </div>

      {loading ? (
        <p className="text-[13px] text-[var(--color-text-muted)]">Loading dashboard…</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label}
                  className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
                  style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] text-[var(--color-text-muted)]">{s.label}</span>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center"
                      style={{ background: s.color + '18' }}>
                      <Icon size={15} style={{ color: s.color }} />
                    </div>
                  </div>
                  <div className="text-[24px] font-semibold text-[var(--color-text)]">{s.value}</div>
                  <div className="text-[12px] text-[var(--color-text-muted)] mt-1">{s.sub}</div>
                </div>
              )
            })}
          </div>

          {/* My classes + Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* My classes */}
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">My classes</h2>
                <span onClick={() => navigate('/teacher/attendance')}
                  className="text-[12px] text-[var(--color-secondary)] cursor-pointer">
                  Mark attendance
                </span>
              </div>
              {!stats?.classes || stats.classes.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-muted)] py-8 text-center">
                  No classes assigned yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.classes.map((className) => {
                    const marked = attendanceSummary.find(a => a.class === className)
                    return (
                      <div key={className}
                        className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)]">
                        <div>
                          <div className="text-[13px] font-medium text-[var(--color-text)]">
                            {stats.subject} · {className}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            {marked ? `${marked.present}/${marked.total} present` : 'Not marked yet'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Messages</h2>
                <span onClick={() => navigate('/teacher/messages')}
                  className="text-[12px] text-[var(--color-secondary)] cursor-pointer">
                  View all
                </span>
              </div>
              {recentMessages.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-muted)] py-8 text-center">
                  No messages yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {recentMessages.map((m) => (
                    <div key={m.id}
                      onClick={() => navigate('/teacher/messages')}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--color-bg)]
                        cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#1a6b4a]/10 flex items-center
                        justify-center text-[11px] font-semibold text-[#1a6b4a] flex-shrink-0">
                        {m.from_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[13px] ${!m.is_read ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                            {m.from_name}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">
                            {timeAgo(m.created_at)}
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--color-text-muted)] truncate mt-0.5">
                          {m.subject || m.body}
                        </p>
                      </div>
                      {!m.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#1a6b4a] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendance summary */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                Attendance summary{stats?.latestDate ? ` — ${new Date(stats.latestDate).toLocaleDateString()}` : ''}
              </h2>
              <span onClick={() => navigate('/teacher/attendance')}
                className="text-[12px] text-[var(--color-secondary)] cursor-pointer">
                Mark attendance
              </span>
            </div>
            {attendanceSummary.length === 0 ? (
              <p className="text-[13px] text-[var(--color-text-muted)] py-8 text-center">
                No attendance recorded yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {attendanceSummary.map((a) => {
                  const pct = Math.round((a.present / a.total) * 100)
                  const color = pct >= 90 ? '#16a34a' : pct >= 75 ? '#f59e0b' : '#dc2626'
                  return (
                    <div key={a.class}
                      className="p-4 rounded-lg border border-[var(--color-border)] text-center">
                      <div className="text-[13px] font-semibold text-[var(--color-text)] mb-1">{a.class}</div>
                      <div className="text-[22px] font-bold" style={{ color }}>{pct}%</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                        {a.present}/{a.total} present
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}