import { useState, useEffect } from 'react'
import { Receipt, DollarSign } from 'lucide-react'
import api from '../api'
import PageShell from '../components/PageShell'
import SectionCard from '../components/SectionCard'

function formatUGX(v) {
  return `UGX ${Number(v || 0).toLocaleString()}`
}

export default function PaymentHistory({ role }) {
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const studentsRes = await api.get('/students')
      const children = [...(studentsRes.data.students || [])].sort((a, b) => a.id - b.id)
      if (children.length === 0) { setLoading(false); return }
      const child = children[0]
      setStudent(child)

      const histRes = await api.get(`/fees/history/${child.id}`)
      setPayments(histRes.data.payments || [])
    } catch (err) {
      console.error('Failed to load payment history:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#1a6b4a]/20 border-t-[#1a6b4a] rounded-full animate-spin" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <p className="text-[15px] font-semibold text-[var(--color-text)]">
          {role === 'parent' ? 'No child linked to this account' : 'No student record linked to this account'}
        </p>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
          Contact the school office for assistance.
        </p>
      </div>
    )
  }

  return (
    <PageShell
      title="Payment History"
      subtitle={`${student.full_name} · ${payments.length} transactions`}
    >
      <SectionCard>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-[var(--color-text)]">{formatUGX(totalPaid)}</p>
            <p className="text-[12px] text-[var(--color-text-muted)]">Total paid to date</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="All transactions" noPadding>
        {payments.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-[var(--color-text-muted)]">
            <Receipt size={28} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
            No payments recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {payments.map(p => (
              <div key={p.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div>
                  <p className="text-[13px] font-semibold text-[var(--color-text)]">
                    {formatUGX(p.amount)}
                    <span className="text-[var(--color-text-muted)] font-normal ml-2">
                      via {p.method}
                    </span>
                  </p>
                  {p.account_detail && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {p.account_detail}
                    </p>
                  )}
                  {p.reference && (
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Ref: {p.reference}
                    </p>
                  )}
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    {p.term} — {p.academic_year}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">
                  {new Date(p.created_at).toLocaleDateString('en-UG', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}