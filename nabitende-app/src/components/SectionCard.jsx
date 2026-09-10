export default function SectionCard({ title, action, onAction, children, noPadding = false }) {
  return (
    <div
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-4
          border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
            {title}
          </h2>
          {action && (
            <button
              onClick={onAction}
              className="text-[12px] font-medium text-[var(--color-secondary)]
                hover:opacity-75 transition-opacity"
            >
              {action}
            </button>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  )
}