import { ScrollText, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { policies, policyStatusStyle } from '../../data/governmentData'
import PageShell from '../../components/PageShell'
import StatCard from '../../components/StatCard'

const categoryColors = {
  Curriculum: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Technology: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Welfare:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  Equity:     { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
}

export default function GovPolicies() {
  const activeCount = policies.filter(p => p.status === 'active').length
  const urgentCount = policies.filter(p => p.status === 'urgent').length
  const avgAdoption = Math.round(
    policies.reduce((a, p) => a + p.adoptionRate, 0) / policies.length
  )

  return (
    <PageShell
      title="Policy Rollouts"
      subtitle="Active reform policies · Term 2, 2026"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Active policies" value={activeCount}      color="#1d4ed8" icon={ScrollText}   sub="in progress"   />
        <StatCard label="Urgent"          value={urgentCount}      color="#dc2626" icon={AlertCircle}  sub="near deadline" />
        <StatCard label="Avg adoption"    value={`${avgAdoption}%`} color="#16a34a" icon={CheckCircle2} sub="across schools" />
      </div>

      {/* Policy cards */}
      <div className="space-y-4">
        {policies.map(p => {
          const ss  = policyStatusStyle[p.status]
          const cc  = categoryColors[p.category] || categoryColors.Curriculum
          const nonCompliant = p.totalSchools - p.compliantSchools
          const barColor = p.adoptionRate >= 80 ? '#16a34a'
            : p.adoptionRate >= 60 ? '#f59e0b' : '#dc2626'

          return (
            <div key={p.id}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}>

              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`text-[11px] font-semibold px-2.5 py-1
                  rounded-full border ${ss.bg} ${ss.text} ${ss.border}`}>
                  {ss.label}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1
                  rounded-full border ${cc.bg} ${cc.text} ${cc.border}`}>
                  {p.category}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]
                  flex items-center gap-1 ml-auto">
                  <Clock size={11} /> {p.deadline}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-semibold text-[var(--color-text)] mb-2">
                {p.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed mb-4">
                {p.description}
              </p>

              {/* Adoption progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--color-text-muted)] font-medium">
                    School adoption rate
                  </span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {p.compliantSchools}/{p.totalSchools} schools
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${p.adoptionRate}%`, background: barColor }} />
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span style={{ color: barColor, fontWeight: 500 }}>
                    {p.adoptionRate}% adopted
                  </span>
                  {nonCompliant > 0 && (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {nonCompliant} not yet compliant
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}