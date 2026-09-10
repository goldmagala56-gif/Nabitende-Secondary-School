import { FileText, CheckCircle2, Clock } from 'lucide-react'
import { termReturns, districtSummary } from '../../data/governmentData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'

export default function GovReports() {
  return (
    <PageShell
      title="District Reports"
      subtitle="Term 2, 2026 · Central Region"
    >
      {/* Term returns */}
      <SectionCard title="Term returns submission status">
        <div className="space-y-5">
          {termReturns.map((r, i) => {
            const total = r.submitted + r.pending
            const pct   = Math.round((r.submitted / total) * 100)
            const color = pct >= 90 ? '#16a34a' : pct >= 70 ? '#f59e0b' : '#dc2626'
            return (
              <div key={i}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    <span className="text-[13px] font-medium text-[var(--color-text)]">
                      {r.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">
                    Due: {r.deadline}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span style={{ color, fontWeight: 500 }}>{pct}% submitted</span>
                  <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={11} /> {r.submitted}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock size={11} /> {r.pending} pending
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Enrolment chart */}
      <SectionCard title="Enrolment by district">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={districtSummary} barSize={28}>
            <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={v => [v.toLocaleString(), 'Students']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="enrolment" radius={[4, 4, 0, 0]} fill="#1d4ed8" />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Compliance chart */}
      <SectionCard title="Compliance rate by district">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={districtSummary} barSize={28}>
            <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={v => [`${v}%`, 'Compliance']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="compliance" radius={[4, 4, 0, 0]}>
              {districtSummary.map((d, i) => (
                <Cell key={i}
                  fill={d.compliance >= 80 ? '#16a34a' : d.compliance >= 65 ? '#f59e0b' : '#dc2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* District summary table */}
      <SectionCard title="District summary" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                {['District', 'Schools', 'Enrolled', 'Pass %', 'Comply %'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold
                    text-[var(--color-text-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {districtSummary.map(d => (
                <tr key={d.district} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-[var(--color-text)]">
                    {d.district}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                    {d.schools}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                    {d.enrolment.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold"
                    style={{ color: d.passRate >= 75 ? '#16a34a' : d.passRate >= 65 ? '#f59e0b' : '#dc2626' }}>
                    {d.passRate}%
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold"
                    style={{ color: d.compliance >= 80 ? '#16a34a' : d.compliance >= 65 ? '#f59e0b' : '#dc2626' }}>
                    {d.compliance}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageShell>
  )
}