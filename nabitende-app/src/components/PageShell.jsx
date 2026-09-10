export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="space-y-5 pb-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <h1 className="text-[21px] font-semibold text-[var(--color-text)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}