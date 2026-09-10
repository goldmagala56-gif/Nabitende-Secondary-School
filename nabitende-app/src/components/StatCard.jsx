export default function StatCard({ label, value, sub, color = '#1a6b4a', icon: Icon, trend }) {
  return (
    <div
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[12px] font-medium text-[var(--color-text-muted)] leading-snug pr-2">
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: color + '18' }}
          >
            <Icon size={15} style={{ color }} />
          </div>
        )}
      </div>
      <div
        className="text-[26px] font-bold leading-none mb-1.5"
        style={{ color: trend ? (trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : 'var(--color-text)') : 'var(--color-text)' }}
      >
        {value}
      </div>
      {sub && (
        <p className="text-[12px] text-[var(--color-text-muted)] leading-snug mt-1">
          {sub}
        </p>
      )}
    </div>
  )
}