import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'
import api from '../../api'

export default function StudentAttendance() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)) // 'YYYY-MM'
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, pct: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [month])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/students/me/attendance', { params: { month } })
      setRecords(res.data.records || [])
      setSummary(res.data.summary || { total: 0, present: 0, absent: 0, late: 0, pct: null })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load attendance.')
    } finally {
      setLoading(false)
    }
  }

  const statusStyle = {
    present: { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    absent:  { icon: XCircle,      bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200' },
    late:    { icon: Clock,        bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">My Attendance</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Your attendance record, month by month
          </p>
        </div>
        <input type="month" value={month}
          onChange={e => setMonth(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
            bg-white text-[13px] text-[var(--color-text)]
            focus:outline-none focus:border-[#7c3aed] transition-all" />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#7c3aed]/20
            border-t-[#7c3aed] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
              <div className="text-[22px] font-bold text-[var(--color-text)]">
                {summary.pct !== null ? `${summary.pct}%` : '—'}
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Attendance rate</div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
              <div className="text-[22px] font-bold text-green-600">{summary.present}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Present</div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
              <div className="text-[22px] font-bold text-red-600">{summary.absent}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Absent</div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
              <div className="text-[22px] font-bold text-amber-600">{summary.late}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Late</div>
            </div>
          </div>

          {/* Records list */}
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            {records.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  No attendance records for this month yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {records.map((r, i) => {
                  const s = statusStyle[r.status] || statusStyle.present
                  const Icon = s.icon
                  return (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-[var(--color-text)]">
                        {new Date(r.date).toLocaleDateString('en-UG', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </span>
                      <span className={`flex items-center gap-1.5 text-[12px] font-semibold
                        px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                        <Icon size={13} />
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
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