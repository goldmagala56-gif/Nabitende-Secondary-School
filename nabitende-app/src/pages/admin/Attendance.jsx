import { useState, useEffect } from 'react'
import { AlertCircle, TrendingDown, Users, CheckCircle2 } from 'lucide-react'
import api from '../../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

export default function AdminAttendance() {
  const [classSummary, setClassSummary] = useState([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSummary() }, [date])

  async function loadSummary() {
    setLoading(true)
    try {
      const res = await api.get('/attendance/summary', { params: { date } })
      setClassSummary(
        (res.data.classSummary || []).map(c => ({
          class:   c.class,
          present: Number(c.present),
          absent:  Number(c.absent),
          late:    Number(c.late),
          total:   Number(c.total),
        }))
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = classSummary.map(c => ({
    class: c.class,
    pct: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0,
  }))

  const BAR_COLORS = chartData.map(d =>
    d.pct >= 90 ? '#16a34a' : d.pct >= 75 ? '#f59e0b' : '#dc2626'
  )

  const schoolTotal   = classSummary.reduce((a, c) => a + c.total, 0)
  const schoolPresent = classSummary.reduce((a, c) => a + c.present, 0)
  const schoolAbsent  = classSummary.reduce((a, c) => a + c.absent, 0)
  const schoolLate    = classSummary.reduce((a, c) => a + c.late, 0)
  const schoolPct     = schoolTotal > 0 ? Math.round((schoolPresent / schoolTotal) * 100) : 0

  const lowAttendance = classSummary.filter(c =>
    c.total > 0 && Math.round((c.present / c.total) * 100) < 85
  )

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#1a6b4a]/20 border-t-[#1a6b4a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">
            Attendance Overview
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            School-wide · {new Date(date).toLocaleDateString('en-UG', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <input type="date" value={date}
          onChange={e => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--color-border)]
            bg-white text-[13px] focus:outline-none" />
      </div>

      {classSummary.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
          p-10 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            No attendance recorded for this date yet.
          </p>
        </div>
      ) : (
        <>
          {/* School-wide stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'School rate',    value: `${schoolPct}%`, color: schoolPct >= 90 ? '#16a34a' : '#f59e0b', icon: CheckCircle2 },
              { label: 'Total present',  value: schoolPresent,   color: '#16a34a', icon: Users       },
              { label: 'Total absent',   value: schoolAbsent,    color: '#dc2626', icon: AlertCircle },
              { label: 'Late arrivals',  value: schoolLate,      color: '#f59e0b', icon: TrendingDown },
            ].map(s => {
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
                  <div className="text-[26px] font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              )
            })}
          </div>

          {/* Chart + Low attendance flags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[14px] font-semibold text-[var(--color-text)] mb-4">
                Attendance by class
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={22}>
                  <XAxis dataKey="class" tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    formatter={v => [`${v}%`, 'Attendance']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px' }}
                  />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-[12px]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-600 inline-block"></span>≥ 90%</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>75–89%</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span>&lt; 75%</span>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[14px] font-semibold text-[var(--color-text)] mb-4">
                Classes needing attention
              </h2>
              {lowAttendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <CheckCircle2 size={28} className="text-green-500" />
                  <p className="text-[13px] text-[var(--color-text-muted)]">All classes above 85% — great day!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowAttendance.map(c => {
                    const pct = Math.round((c.present / c.total) * 100)
                    return (
                      <div key={c.class}
                        className="flex items-center gap-3 p-3 rounded-lg
                          bg-red-50 border border-red-200">
                        <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-[13px] font-semibold text-red-700">{c.class}</div>
                          <div className="text-[11px] text-red-600">
                            {c.present}/{c.total} present · {c.absent} absent · {c.late} late
                          </div>
                        </div>
                        <div className="text-[16px] font-bold text-red-600">{pct}%</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Full class table */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="px-5 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-[14px] font-semibold text-[var(--color-text)]">All classes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {['Class', 'Total', 'Present', 'Absent', 'Late', 'Rate'].map(h => (
                      <th key={h}
                        className="px-5 py-3 text-left text-[12px] font-semibold
                          text-[var(--color-text-muted)] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {classSummary.map(c => {
                    const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0
                    const color = pct >= 90 ? '#16a34a' : pct >= 75 ? '#f59e0b' : '#dc2626'
                    return (
                      <tr key={c.class} className="hover:bg-[var(--color-bg)] transition-colors">
                        <td className="px-5 py-3 text-[13px] font-semibold text-[var(--color-text)]">{c.class}</td>
                        <td className="px-5 py-3 text-[13px] text-[var(--color-text-muted)]">{c.total}</td>
                        <td className="px-5 py-3 text-[13px] text-green-600 font-medium">{c.present}</td>
                        <td className="px-5 py-3 text-[13px] text-red-500 font-medium">{c.absent}</td>
                        <td className="px-5 py-3 text-[13px] text-amber-600 font-medium">{c.late}</td>
                        <td className="px-5 py-3">
                          <span className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: color + '18', color }}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}