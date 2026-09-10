import {
  BookOpen, ClipboardCheck, Calendar, Megaphone,
  CheckCircle2, AlertCircle, Clock, TrendingUp, TrendingDown
} from 'lucide-react'

const todayTimetable = [
  { time: '8:00 AM',  subject: 'Mathematics', teacher: 'Ms. Nakato',  room: 'Room 12', done: true  },
  { time: '10:00 AM', subject: 'English',      teacher: 'Mr. Kaggwa',  room: 'Room 5',  done: true  },
  { time: '1:00 PM',  subject: 'Physics',      teacher: 'Ms. Atim',    room: 'Lab 2',   done: false },
  { time: '3:00 PM',  subject: 'History',      teacher: 'Mr. Byarugaba', room: 'Room 9', done: false },
]

const recentGrades = [
  { subject: 'Mathematics', score: 78, grade: 'B', trend: 'up'   },
  { subject: 'English',     score: 85, grade: 'A', trend: 'up'   },
  { subject: 'Physics',     score: 62, grade: 'C', trend: 'down' },
  { subject: 'History',     score: 88, grade: 'A', trend: 'up'   },
]

const notices = [
  { title: 'Mid-term exams: 16–20 June',      type: 'info',    time: 'Today'     },
  { title: 'Fee deadline: 15 June',           type: 'warning', time: 'Yesterday' },
  { title: 'Sports day confirmed: 28 June',   type: 'success', time: '3 days ago'},
]

export default function StudentDashboard() {
  const attendanceRate = 91

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">My Dashboard</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          Monday, 8 June 2026 · S.3A · Term 2
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Classes today',    value: '4',    sub: '2 remaining',     color: '#7c3aed', icon: BookOpen       },
          { label: 'Attendance rate',  value: '91%',  sub: 'this term',       color: '#16a34a', icon: ClipboardCheck },
          { label: 'Average grade',    value: 'B+',   sub: 'across subjects', color: '#2563eb', icon: TrendingUp     },
          { label: 'Days to exams',    value: '8',    sub: 'mid-term exams',  color: '#f59e0b', icon: Calendar       },
        ].map((s) => {
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

      {/* Timetable + Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Today's timetable */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Today's timetable</h2>
            <span className="text-[12px] text-[var(--color-secondary)] cursor-pointer">Full week</span>
          </div>
          <div className="space-y-2">
            {todayTimetable.map((c, i) => (
              <div key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  c.done ? 'bg-gray-50 border-gray-100' : 'bg-purple-50 border-purple-100'
                }`}>
                <div className="min-w-[60px]">
                  <div className="text-[11px] font-medium text-[var(--color-text-muted)]">{c.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium ${c.done ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                    {c.subject}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {c.teacher} · {c.room}
                  </div>
                </div>
                {c.done
                  ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                  : <Clock size={15} className="text-purple-400 flex-shrink-0" />
                }
              </div>
            ))}
          </div>
        </div>

        {/* Recent grades */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Recent grades</h2>
            <span className="text-[12px] text-[var(--color-secondary)] cursor-pointer">Full report</span>
          </div>
          <div className="space-y-2">
            {recentGrades.map((g) => {
              const gradeColor = g.grade === 'A' ? '#16a34a' : g.grade === 'B' ? '#2563eb' : '#f59e0b'
              return (
                <div key={g.subject}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)]">
                  <div className="flex-1 text-[13px] font-medium text-[var(--color-text)]">
                    {g.subject}
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--color-text)]">{g.score}%</span>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center
                    text-[12px] font-bold text-white" style={{ background: gradeColor }}>
                    {g.grade}
                  </div>
                  {g.trend === 'up'
                    ? <TrendingUp size={14} className="text-green-500" />
                    : <TrendingDown size={14} className="text-red-500" />
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* School notices */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-[var(--color-text)]">School notices</h2>
          <span className="text-[12px] text-[var(--color-secondary)] cursor-pointer">View all</span>
        </div>
        <div className="space-y-2">
          {notices.map((n, i) => {
            const styles = {
              info:    { bg: 'bg-blue-50',   border: 'border-blue-100',  text: 'text-blue-700',  icon: Clock         },
              warning: { bg: 'bg-amber-50',  border: 'border-amber-100', text: 'text-amber-700', icon: AlertCircle   },
              success: { bg: 'bg-green-50',  border: 'border-green-100', text: 'text-green-700', icon: CheckCircle2  },
            }
            const s = styles[n.type]
            const Icon = s.icon
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${s.bg} ${s.border}`}>
                <Icon size={15} className={s.text} />
                <span className={`flex-1 text-[13px] font-medium ${s.text}`}>{n.title}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{n.time}</span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}