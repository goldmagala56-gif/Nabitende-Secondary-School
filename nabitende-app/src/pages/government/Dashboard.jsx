import {
  Building2, Users, TrendingUp, ShieldCheck,
  AlertCircle, CheckCircle2, BarChart2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import PageShell from '../../components/PageShell'
import StatCard from '../../components/StatCard'
import SectionCard from '../../components/SectionCard'

const districtStats = [
  { label: 'Schools registered', value: '248',    sub: 'across 5 districts',  color: '#1d4ed8', icon: Building2,   },
  { label: 'Total enrolment',    value: '94,210', sub: 'students this term',   color: '#1a6b4a', icon: Users,       },
  { label: 'Average pass rate',  value: '73%',    sub: '+4% vs last year',     color: '#16a34a', icon: TrendingUp,  },
  { label: 'Policy compliance',  value: '89%',    sub: '22 schools pending',   color: '#f59e0b', icon: ShieldCheck, },
]

const schoolPerformance = [
  { name: 'Kampala', rate: 81 },
  { name: 'Wakiso',  rate: 74 },
  { name: 'Mukono',  rate: 68 },
  { name: 'Jinja',   rate: 77 },
  { name: 'Mbale',   rate: 65 },
  { name: 'Gulu',    rate: 70 },
]

const alerts = [
  { type: 'warning', text: '22 schools yet to submit Term 2 returns',    time: '2 days ago'  },
  { type: 'danger',  text: '3 schools flagged for low attendance (<60%)', time: '1 week ago'  },
  { type: 'success', text: 'Kampala district met enrolment targets',      time: '1 week ago'  },
  { type: 'info',    text: 'New curriculum rollout scheduled for Term 3', time: '2 weeks ago' },
]

const alertStyles = {
  warning: { bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  icon: AlertCircle  },
  danger:  { bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700',    icon: AlertCircle  },
  success: { bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  info:    { bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   icon: BarChart2    },
}

const BAR_COLORS = schoolPerformance.map(d =>
  d.rate >= 75 ? '#1d4ed8' : d.rate >= 65 ? '#f59e0b' : '#dc2626'
)

export default function GovDashboard() {
  return (
    <PageShell
      title="Government Overview"
      subtitle="Ministry of Education · Central Region · Term 2, 2026"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {districtStats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Chart */}
      <SectionCard title="Pass rate by district" action="Full report">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={schoolPerformance} barSize={28}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={v => [`${v}%`, 'Pass rate']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {schoolPerformance.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Alerts */}
      <SectionCard title="District alerts" action="View all">
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const s = alertStyles[a.type]
            const Icon = s.icon
            return (
              <div key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${s.bg} ${s.border}`}>
                <Icon size={15} className={`${s.text} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium ${s.text}`}>{a.text}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{a.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </PageShell>
  )
}