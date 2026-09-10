import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import StatCard from '../../components/StatCard'

const statusStyle = {
  present: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200',  label: 'Present' },
  absent:  { icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-50 border-red-200',      label: 'Absent'  },
  late:    { icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200',  label: 'Late'    },
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-UG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function ParentAttendance() {
  const [records,  setRecords]  = useState([])
  const [student,  setStudent]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
  setLoading(true)
  try {
    const studentsRes = await api.get('/students')
    const children = [...(studentsRes.data.students || [])].sort((a, b) => a.id - b.id)
    if (children.length === 0) { setLoading(false); return }
    const child = children[0]
    setStudent(child)

    const res = await api.get('/attendance', { params: { student_id: child.id } })
    setRecords(res.data.attendance || [])
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to load attendance.')
  } finally {
    setLoading(false)
  }
}

  const total   = records.length
  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const late    = records.filter(r => r.status === 'late').length
  const pct     = total ? Math.round((present / total) * 100) : 0

  return (
    <PageShell
      title="Attendance Record"
      subtitle={student
        ? `${student.full_name} · ${student.class_name} · Term 2, 2026`
        : 'Term 2, 2026'
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#0891b2]/20
            border-t-[#0891b2] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 text-[13px]">
          {error}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Days recorded" value={total}   color="#2563eb" />
            <StatCard label="Present"       value={present} color="#16a34a" />
            <StatCard label="Absent"        value={absent}  color="#dc2626" />
            <StatCard label="Late"          value={late}    color="#f59e0b" />
          </div>

          {/* Rate */}
          <SectionCard title="Overall attendance rate">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-[var(--color-text-muted)]">
                This term
              </span>
              <span className="text-[22px] font-bold"
                style={{
                  color: pct >= 90 ? '#16a34a' :
                         pct >= 75 ? '#f59e0b' : '#dc2626'
                }}>
                {pct}%
              </span>
            </div>
            <div className="w-full h-3 bg-[var(--color-border)]
              rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: pct >= 90 ? '#16a34a' :
                              pct >= 75 ? '#f59e0b' : '#dc2626'
                }} />
            </div>
            {pct < 75 && total > 0 && (
              <div className="flex items-center gap-2 mt-3 p-3
                rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle size={14} className="text-amber-600
                  flex-shrink-0" />
                <span className="text-[12px] text-amber-700 font-medium">
                  Below minimum attendance of 75%.
                  Please contact the school.
                </span>
              </div>
            )}
          </SectionCard>

          {/* Daily record */}
          <SectionCard title="Daily record" noPadding>
            {records.length === 0 ? (
              <div className="p-10 text-center text-[13px]
                text-[var(--color-text-muted)]">
                No attendance records yet for this term.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {records.map((r, i) => {
                  const s    = statusStyle[r.status] || statusStyle.present
                  const Icon = s.icon
                  return (
                    <div key={i}
                      className="flex items-center gap-4 px-5 py-3">
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold
                          text-[var(--color-text)]">
                          {formatDate(r.date)}
                        </div>
                        <div className="text-[11px]
                          text-[var(--color-text-muted)]">
                          {r.class_name} · {r.full_name}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3
                        py-1.5 rounded-full border text-[12px]
                        font-semibold ${s.bg}`}>
                        <Icon size={13} className={s.color} />
                        <span className={s.color}>{s.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </PageShell>
  )
}