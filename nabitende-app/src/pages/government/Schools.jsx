import { useState } from 'react'
import { Building2, Users, TrendingUp, ShieldCheck } from 'lucide-react'
import { schools, districtSummary, complianceStyle } from '../../data/governmentData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import PageShell from '../../components/PageShell'
import StatCard from '../../components/StatCard'
import SectionCard from '../../components/SectionCard'

export default function GovSchools() {
  const [search,     setSearch]     = useState('')
  const [filterDist, setFilterDist] = useState('all')
  const [filterComp, setFilterComp] = useState('all')

  const districts = ['all', ...new Set(schools.map(s => s.district))]

  const filtered = schools.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchDist   = filterDist === 'all' || s.district === filterDist
    const matchComp   = filterComp === 'all' || s.compliance === filterComp
    return matchSearch && matchDist && matchComp
  })

  const totalEnrolment = schools.reduce((a, s) => a + s.enrolment, 0)
  const avgPassRate    = Math.round(schools.reduce((a, s) => a + s.passRate, 0) / schools.length)
  const compliantCount = schools.filter(s => s.compliance === 'compliant').length

  return (
    <PageShell
      title="Schools Overview"
      subtitle={`Central Region · ${schools.length} schools registered · Term 2, 2026`}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Registered schools" value={schools.length}                        color="#1d4ed8" icon={Building2}   sub="in Central Region"    />
        <StatCard label="Total enrolment"    value={totalEnrolment.toLocaleString()}        color="#1a6b4a" icon={Users}       sub="students this term"   />
        <StatCard label="Avg pass rate"      value={`${avgPassRate}%`}                      color="#16a34a" icon={TrendingUp}  sub="across all schools"   />
        <StatCard label="Fully compliant"    value={`${compliantCount}/${schools.length}`}  color="#f59e0b" icon={ShieldCheck} sub="submitted all returns" />
      </div>

      {/* Chart */}
      <SectionCard title="Pass rate by district">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={districtSummary} barSize={28}>
            <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false} />
            <YAxis domain={[50, 90]} tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={v => [`${v}%`, 'Pass rate']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="passRate" radius={[4, 4, 0, 0]}>
              {districtSummary.map((d, i) => (
                <Cell key={i}
                  fill={d.passRate >= 75 ? '#1d4ed8' : d.passRate >= 65 ? '#f59e0b' : '#dc2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search school name..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)]
            bg-[var(--color-surface)] text-[13px]
            focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]" />
        <div className="flex gap-2 flex-wrap">
          <select value={filterDist} onChange={e => setFilterDist(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--color-border)]
              bg-[var(--color-surface)] text-[13px] text-[var(--color-text)]
              focus:outline-none">
            {districts.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'All districts' : d}</option>
            ))}
          </select>
          {['all', 'compliant', 'pending', 'non-compliant'].map(c => (
            <button key={c} onClick={() => setFilterComp(c)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border
                transition-colors ${filterComp === c
                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <SectionCard title={`${filtered.length} schools`} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                {['School', 'District', 'Enrolled', 'Pass', 'Attend.', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold
                    text-[var(--color-text-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map(s => {
                const cs = complianceStyle[s.compliance]
                return (
                  <tr key={s.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--color-text)]
                      max-w-[140px] truncate">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {s.district}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {s.enrolment.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold"
                      style={{ color: s.passRate >= 75 ? '#16a34a' : s.passRate >= 65 ? '#f59e0b' : '#dc2626' }}>
                      {s.passRate}%
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {s.attendance}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-1
                        rounded-full border ${cs.bg} ${cs.text} ${cs.border}`}>
                        {cs.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageShell>
  )
}