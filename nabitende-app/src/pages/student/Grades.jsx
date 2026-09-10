import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { computeGrade, gradeColor } from '../../data/academicsData'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import StatCard from '../../components/StatCard'

export default function StudentGrades() {
  const { user }   = useAuth()
  const [grades,   setGrades]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    fetchGrades()
  }, [])

  async function fetchGrades() {
    setLoading(true)
    try {
      // Get the logged-in student's own record
      const meRes = await api.get('/students/me')
      const student = meRes.data.student

      const res = await api.get('/grades', {
        params: { student_id: student.id }
      })
      setGrades(res.data.grades || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load grades.')
    } finally {
      setLoading(false)
    }
  }

  // Group grades by subject
  const bySubject = {}
  grades.forEach(g => {
    if (!bySubject[g.subject]) bySubject[g.subject] = {}
    bySubject[g.subject][g.exam_type] = g.mark
  })

  const rows = Object.entries(bySubject).map(([subject, exams]) => {
    const bot1    = exams['Bot 1'] ?? null
    const bot2    = exams['Bot 2'] ?? null
    const average = bot1 != null && bot2 != null
      ? Math.round((bot1 + bot2) / 2)
      : bot1 ?? bot2
    const computed = average != null ? computeGrade(average) : null
    return { subject, bot1, bot2, average, computed }
  })

  const totalPoints = rows.reduce((sum, r) => sum + (r.computed?.points || 0), 0)
  const division =
    totalPoints <= 12 ? 'Division I'   :
    totalPoints <= 24 ? 'Division II'  :
    totalPoints <= 32 ? 'Division III' :
    totalPoints <= 45 ? 'Division IV'  : 'Ungraded'

  const divColor =
    division === 'Division I'   ? 'text-green-700 bg-green-100'  :
    division === 'Division II'  ? 'text-blue-700 bg-blue-100'    :
    division === 'Division III' ? 'text-amber-700 bg-amber-100'  :
    'text-red-700 bg-red-100'

  return (
    <PageShell title="My Grades" subtitle="Term 2, 2026">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#7c3aed]/20
            border-t-[#7c3aed] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 text-[13px]">{error}</div>
      ) : (
        <>
          {/* Division banner */}
          <div className={`flex items-center justify-between p-5
            rounded-2xl border-2 ${
            division === 'Division I'  ? 'bg-green-50 border-green-200' :
            division === 'Division II' ? 'bg-blue-50 border-blue-200'  :
            'bg-amber-50 border-amber-200'
          }`}>
            <div>
              <div className="text-[11px] font-semibold uppercase
                tracking-widest text-[var(--color-text-muted)] mb-1">
                Current standing
              </div>
              <div className={`text-[22px] font-bold ${
                division === 'Division I'  ? 'text-green-700' :
                division === 'Division II' ? 'text-blue-700'  : 'text-amber-700'
              }`}>
                {division}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[var(--color-text-muted)]
                uppercase tracking-widest mb-1">
                Aggregate
              </div>
              <div className="text-[32px] font-bold text-[var(--color-text)]">
                {totalPoints}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Subjects"     value={rows.length}   color="#2563eb" />
            <StatCard label="Total points" value={totalPoints}   color="#1a6b4a" />
            <StatCard label="Best subject" value={
              rows.length > 0
                ? rows.reduce((a, b) => (a.average || 0) > (b.average || 0) ? a : b).subject.split(' ')[0]
                : '—'
            } color="#f59e0b" />
          </div>

          {/* Report card */}
          <SectionCard title="Report card" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]
                    bg-[var(--color-bg)]">
                    {['Subject', 'Bot 1', 'Bot 2', 'Average', 'Grade', 'Points'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px]
                        font-semibold text-[var(--color-text-muted)]
                        uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {rows.map(r => {
                    const gc = r.computed ? gradeColor(r.computed.grade) : null
                    return (
                      <tr key={r.subject}
                        className="hover:bg-[var(--color-bg)] transition-colors">
                        <td className="px-4 py-3 text-[13px] font-semibold
                          text-[var(--color-text)]">
                          {r.subject}
                        </td>
                        <td className="px-4 py-3 text-[13px]
                          text-[var(--color-text-muted)]">
                          {r.bot1 ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[13px]
                          text-[var(--color-text-muted)]">
                          {r.bot2 ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-semibold
                          text-[var(--color-text)]">
                          {r.average ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          {r.computed && (
                            <span className={`text-[12px] font-bold
                              px-2.5 py-1 rounded-lg ${gc.bg} ${gc.text}`}>
                              {r.computed.grade}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px]
                          text-[var(--color-text-muted)]">
                          {r.computed?.points ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--color-border)]
                    bg-[var(--color-bg)]">
                    <td colSpan={4} className="px-4 py-3 text-[13px]
                      font-bold text-[var(--color-text)]">
                      Total aggregate
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-bold px-3 py-1
                        rounded-full ${divColor}`}>
                        {division}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[15px] font-bold
                      text-[var(--color-text)]">
                      {totalPoints}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </PageShell>
  )
}