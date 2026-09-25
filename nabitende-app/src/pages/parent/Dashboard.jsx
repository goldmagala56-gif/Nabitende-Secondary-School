import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

function gradeLetter(score) {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}

function dayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short' })
}

export default function ParentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    if (user) loadDashboard()
  }, [user])

  async function loadDashboard() {
    setLoading(true)
    try {
      const { data: links, count: childrenCount } = await supabase
        .from('parent_students')
        .select('student_id', { count: 'exact' })
        .eq('parent_id', user.id)

      if (!links || links.length === 0) {
        setData({ child: null })
        setLoading(false)
        return
      }

      const primaryStudentId = links[0].student_id

      const [
        { data: studentRow },
        { data: attendanceRows },
        { data: feeRow },
        { data: gradeRows },
        { data: announcementRows },
        { data: notificationRows },
      ] = await Promise.all([
        supabase.from('students').select('id, first_name, last_name, admission_no, streams(name, classes(name))').eq('id', primaryStudentId).single(),
        supabase.from('attendance').select('date, status').eq('student_id', primaryStudentId).order('date', { ascending: false }).limit(7),
        supabase.from('fees').select('*').eq('student_id', primaryStudentId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('grades').select('subject, score, created_at').eq('student_id', primaryStudentId).order('created_at', { ascending: false }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('notifications').select('*').eq('recipient_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])

      const bySubject = {}
      ;(gradeRows || []).forEach(g => {
        bySubject[g.subject] ??= []
        bySubject[g.subject].push(g)
      })
      const recentGrades = Object.entries(bySubject).map(([subject, rows]) => {
        const latest = rows[0]
        const prev = rows[1]
        return {
          subject,
          score: latest.score,
          trend: prev ? (latest.score >= prev.score ? 'up' : 'down') : null,
        }
      })

      setData({
        child: studentRow ? {
          name: `${studentRow.first_name} ${studentRow.last_name}`,
          class: `${studentRow.streams?.classes?.name ?? ''} ${studentRow.streams?.name ?? ''}`.trim(),
          admNo: studentRow.admission_no,
        } : null,
        childrenCount: childrenCount ?? 1,
        weekAttendance: (attendanceRows || []).reverse().map(a => ({ date: a.date, present: a.status === 'present' })),
        fee: feeRow || null,
        recentGrades,
      })
      setAnnouncements(announcementRows || [])
      setNotifications(notificationRows || [])
    } catch (err) {
      console.error('Failed to load parent dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-[13px] text-[var(--color-text-muted)]">Loading dashboard…</p>
  }

  if (!data?.child) {
    return (
      <div className="text-center py-16">
        <p className="text-[15px] font-semibold text-[var(--color-text)]">No child linked to this account</p>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
          Contact the school office to link your account to your child's record.
        </p>
      </div>
    )
  }

  const { child, childrenCount, weekAttendance, fee, recentGrades } = data
  const paidPct = fee ? Math.round((fee.paid / fee.term_fee) * 100) : 0
  const presentCount = weekAttendance.filter(d => d.present).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Parent Dashboard</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {childrenCount > 1 ? `Showing ${child.name} (1 of ${childrenCount} children)` : 'Term overview'}
        </p>
      </div>

      {/* Child profile card */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0891b2]/10 flex items-center
            justify-center text-[18px] font-bold text-[#0891b2]">
            {child.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold text-[var(--color-text)]">{child.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="text-[12px] text-[var(--color-text-muted)]">Class: <strong className="text-[var(--color-text)]">{child.class}</strong></span>
              <span className="text-[12px] text-[var(--color-text-muted)]">Adm No: <strong className="text-[var(--color-text)]">{child.admNo}</strong></span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
            rounded-full bg-green-50 border border-green-200">
            <CheckCircle2 size={13} className="text-green-600" />
            <span className="text-[12px] font-medium text-green-700">Enrolled</span>
          </div>
        </div>
      </div>
      {/* Announcements summary */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-[var(--color-secondary)]">Announcements</h2>
          <span onClick={() => navigate('/parent/announcements')}
            className="text-[12px] text-[var(--color-secondary)] cursor-pointer">View all</span>
        </div>
        {announcements.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">No announcements yet.</p>
        ) : (
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a.id} onClick={() => navigate('/parent/announcements')}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                {a.pinned && <span className="text-[11px] font-bold text-[#0891b2] flex-shrink-0 mt-0.5">📌</span>}
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--color-text)] truncate">{a.title}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Notifications summary */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-[var(--color-secondary)]">Notifications</h2>
            <span onClick={() => navigate('/parent/notifications')}
              className="text-[12px] text-[var(--color-secondary)] cursor-pointer">View all</span>
          </div>
          {notifications.filter(n => !n.is_read).length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-muted)]">You're all caught up!</p>
          ) : (
            <div className="space-y-2">
              {notifications.filter(n => !n.is_read).slice(0, 3).map(n => (
                <div key={n.id} onClick={() => navigate('/parent/notifications')}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-[13px] text-[var(--color-text)] truncate">{n.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Stats + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent attendance */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Recent attendance</h2>
            <span onClick={() => navigate('/parent/attendance')}
              className="text-[12px] text-[var(--color-secondary)] cursor-pointer">Full record</span>
          </div>
          {weekAttendance.length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-muted)] py-6 text-center">No attendance recorded yet.</p>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                {weekAttendance.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full h-10 rounded-lg flex items-center justify-center ${
                      d.present ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {d.present
                        ? <CheckCircle2 size={16} className="text-green-600" />
                        : <AlertCircle size={16} className="text-red-500" />
                      }
                    </div>
                    <span className="text-[11px] text-[var(--color-text-muted)]">{dayLabel(d.date)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--color-text-muted)]">
                  {presentCount}/{weekAttendance.length} days present
                </span>
                <span className="font-medium text-green-600">
                  {Math.round((presentCount / weekAttendance.length) * 100)}% recent
                </span>
              </div>
            </>
          )}
        </div>

        {/* Fee status */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
              Fee status{fee ? ` — ${fee.term} ${fee.academic_year}` : ''}
            </h2>
            <span onClick={() => navigate('/parent/fees')}
              className="text-[12px] text-[var(--color-secondary)] cursor-pointer">Pay now</span>
          </div>
          {!fee ? (
            <p className="text-[13px] text-[var(--color-text-muted)] py-6 text-center">No fee records yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--color-text-muted)]">Term fee</span>
                <span className="font-medium text-[var(--color-text)]">
                  UGX {Number(fee.term_fee).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--color-text-muted)]">Paid</span>
                <span className="font-medium text-green-600">
                  UGX {Number(fee.paid).toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--color-text-muted)]">Balance due</span>
                <span className="font-semibold text-[var(--color-danger)]">
                  UGX {Number(fee.balance).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle size={13} className="text-amber-600 flex-shrink-0" />
                <span className="text-[12px] text-amber-700 capitalize">Status: {fee.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent grades */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Recent grades</h2>
          <span onClick={() => navigate('/parent/grades')}
            className="text-[12px] text-[var(--color-secondary)] cursor-pointer">Full report card</span>
        </div>
        {recentGrades.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)] py-6 text-center">No grades recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentGrades.map((g) => {
              const letter = gradeLetter(g.score)
              const gradeColor = letter === 'A' ? '#16a34a' : letter === 'B' ? '#2563eb' : '#f59e0b'
              return (
                <div key={g.subject}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)]">
                  <div className="flex-1 text-[13px] font-medium text-[var(--color-text)]">{g.subject}</div>
                  <div className="w-10 text-center">
                    <span className="text-[13px] font-semibold text-[var(--color-text)]">{g.score}%</span>
                  </div>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center
                    text-[12px] font-bold text-white" style={{ background: gradeColor }}>
                    {letter}
                  </div>
                  {g.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                  {g.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}