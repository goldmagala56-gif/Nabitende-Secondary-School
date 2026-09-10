import { Download, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  paymentHistory, feeStructure,
  termFeeTotal, formatUGX, statusStyle
} from '../../data/financeData'

const studentFee = {
  paid:    600000,
  balance: termFeeTotal - 600000,
  status:  'partial',
}

export default function ParentFees() {
  const paidPct = Math.round((studentFee.paid / termFeeTotal) * 100)
  const s = statusStyle[studentFee.status]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">
            Fee Payments
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            David Ssemanda · S.3A · Term 2, 2026
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg
          border border-[var(--color-border)] text-[13px] font-medium
          text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors">
          <Download size={15} />
          Download invoice
        </button>
      </div>

      {/* Balance card */}
      <div className={`p-5 rounded-xl border-2 ${
        studentFee.status === 'cleared'
          ? 'bg-green-50 border-green-200'
          : studentFee.status === 'partial'
          ? 'bg-amber-50 border-amber-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide
              text-[var(--color-text-muted)] mb-1">
              Outstanding balance
            </div>
            <div className={`text-[32px] font-bold ${
              studentFee.balance === 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatUGX(studentFee.balance)}
            </div>
          </div>
          <span className={`text-[12px] font-bold px-4 py-2 rounded-full border
            ${s.bg} ${s.text} ${s.border}`}>
            {s.label}
          </span>
        </div>
        <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${paidPct}%` }} />
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[var(--color-text-muted)]">
            Paid: <strong className="text-green-700">{formatUGX(studentFee.paid)}</strong>
          </span>
          <span className="text-[var(--color-text-muted)]">{paidPct}% of {formatUGX(termFeeTotal)}</span>
        </div>
      </div>

      {/* Fee breakdown + Payment history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Fee breakdown */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[14px] font-semibold text-[var(--color-text)] mb-4">
            Fee breakdown — Term 2
          </h2>
          <div className="space-y-2">
            {Object.entries(feeStructure).map(([key, val]) => (
              <div key={key}
                className="flex items-center justify-between py-2
                  border-b border-[var(--color-border)] last:border-0">
                <span className="text-[13px] text-[var(--color-text-muted)] capitalize">
                  {key}
                </span>
                <span className="text-[13px] font-medium text-[var(--color-text)]">
                  {formatUGX(val)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[14px] font-bold text-[var(--color-text)]">Total</span>
              <span className="text-[14px] font-bold text-[#1a6b4a]">
                {formatUGX(termFeeTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment history */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[14px] font-semibold text-[var(--color-text)] mb-4">
            Payment history
          </h2>
          {paymentHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <AlertCircle size={24} className="text-[var(--color-text-muted)]" />
              <p className="text-[13px] text-[var(--color-text-muted)]">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map(p => (
                <div key={p.id}
                  className="p-3 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-green-600">
                      + {formatUGX(p.amount)}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">{p.date}</span>
                  </div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">
                    {p.method} · Ref: {p.ref}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Received by: {p.received_by}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile money payment info */}
      <div className="flex items-start gap-3 p-4 rounded-lg
        bg-blue-50 border border-blue-200">
        <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-blue-800">
            How to pay via Mobile Money
          </p>
          <p className="text-[12px] text-blue-700 mt-1 leading-relaxed">
            Send to MTN Mobile Money: <strong>0772-123-456</strong> (St. Mary's College).<br />
            Use your child's admission number <strong>SMC/2024/0312</strong> as the reference.<br />
            Bring the payment confirmation to the bursar's office within 24 hours.
          </p>
        </div>
      </div>

    </div>
  )
}