import { useState, useEffect } from 'react'
import {
  Users, ClipboardCheck, Receipt, GraduationCap,
  UserPlus, Megaphone, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const BAR_COLORS = ['#1a6b4a', '#1a6b4a', '#f59e0b', '#1a6b4a', '#dc2626', '#1a6b4a']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [attendanceByClass, setAttendanceByClass] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)

      const [
        { count: totalStudents },
        { count: totalTeachers },
        { data: todayAttendance },
        { data: feeRows },
        { data: announcementRows },
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('attendance').select('status, streams(name, classes(name))').eq('date', today),
        supabase.from('fees').select('term_fee, paid, status'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
      ])

      let attendanceToday = null
      if (todayAttendance?.length) {
        const present = todayAttendance.filter(a => a.status === 'present').length
        attendanceToday = Math.round((present / todayAttendance.length) * 100)
      }

      const byClass = {}
      ;(todayAttendance || []).forEach(a => {
        const className = a.streams?.classes?.name
        if (!className) return
        byClass[className] ??= { present: 0, total: 0 }
        byClass[className].total += 1
        if (a.status === 'present') byClass[className].present += 1
      })

      let feesCollectedPct = null
      let overdueCount = 0
      if (feeRows?.length) {
        const totalFee = feeRows.reduce((sum, f) => sum + Number(f.term_fee), 0)
        const totalPaid = feeRows.reduce((sum, f) => sum + Number(f.paid), 0)
        feesCollectedPct = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : null
        overdueCount = feeRows.filter(f => f.status === 'overdue').length
      }

      setStats({
        totalStudents: totalStudents ?? 0,
        totalTeachers: totalTeachers ?? 0,
        attendanceToday,
        attendanceDate: today,
        feesCollectedPct,
        overdueCount,
      })
      setAttendanceByClass(
        Object.entries(byClass).map(([cls, v]) => ({ class: cls, pct: Math.round((v.present / v.total) * 100) }))
      )
      setAnnouncements(announcementRows || [])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
  { label: 'Total students',   value: String(stats.totalStudents),   icon: Users,          color: '#1a6b4a', to: '/admin/students' },
  { label: 'Attendance latest', value: stats.attendanceToday !== null ? `${stats.attendanceToday}%` : 'No data', icon: ClipboardCheck, color: '#2563eb', to: '/admin/attendance' },
  { label: 'Fees collected',   value: stats.feesCollectedPct !== null ? `${stats.feesCollectedPct}%` : 'No data', sub: `${stats.overdueCount} overdue`, icon: Receipt, color: '#f59e0b', to: '/admin/fees' },
  { label: 'Active teachers',  value: String(stats.totalTeachers),   icon: GraduationCap,  color: '#7c3aed', to: '/admin/teachers' },
] : []

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">
          School overview
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {stats?.attendanceDate
            ? `Live snapshot · Attendance as of ${new Date(stats.attendanceDate).toLocaleDateString()}`
            : 'Live snapshot'}
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
                <div
                  key={s.label}
                  onClick={() => s.to && navigate(s.to)}
                  className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 cursor-pointer hover:border-[var(--color-text-muted)] transition-colors"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] text-[var(--color-text-muted)]">{s.label}</span>
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center"
                      style={{ background: s.color + '18' }}
                    >
                      <Icon size={15} style={{ color: s.color }} />
                    </div>
                  </div>
                  <div className="text-[24px] font-semibold text-[var(--color-text)]">
                    {s.value}
                  </div>
                  {s.sub && (
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-[var(--color-text-muted)]">
                      {s.sub}
                    </div>
                  )}
                </div>
              )
})}
          </div>

          {/* Quick actions */}
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text)] mb-3">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: UserPlus,      label: 'Enrol student',     color: '#1a6b4a', to: '/admin/students' },
              { icon: Megaphone,     label: 'Send announcement', color: '#2563eb', to: '/admin/announcements' },
              { icon: Receipt,       label: 'Record payment',    color: '#f59e0b', to: '/admin/fees' },
              { icon: GraduationCap, label: 'Add teacher',       color: '#7c3aed', to: '/admin/teachers' },
            ].map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.label}
                  onClick={() => navigate(a.to)}
                  className="flex flex-col items-center gap-2.5 p-4
                    bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
                    hover:bg-[var(--color-bg)] transition-colors text-center"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: a.color + '18' }}
                  >
                    <Icon size={18} style={{ color: a.color }} />
                  </div>
                  <span className="text-[12px] text-[var(--color-text-muted)] leading-tight">
                    {a.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
          {/* Chart + Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Attendance chart */}
            <div
              className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                  Attendance by class
                </h2>
              </div>
              {attendanceByClass.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-muted)] py-8 text-center">
                  No attendance data recorded yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={attendanceByClass} barSize={28}>
                    <XAxis
                      dataKey="class"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v) => [`${v}%`, 'Attendance']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {attendanceByClass.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Announcements */}
            <div
              className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                  Recent announcements
                </h2>
              </div>
              {announcements.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-muted)] py-8 text-center">
                  No announcements yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-blue-50">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-blue-700">
                            {a.category}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">
                            {new Date(a.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[13px] font-medium text-[var(--color-text)] mt-0.5">
                          {a.title}
                        </p>
                        <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                          {a.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}