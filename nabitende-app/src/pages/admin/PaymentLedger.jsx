import { useState, useEffect } from 'react'
import { Search, ChevronDown, Receipt } from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import { useNavigate } from 'react-router-dom'

const METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque']

function formatUGX(v) {
  return `UGX ${Number(v || 0).toLocaleString()}`
}

export default function AdminPaymentLedger() {
  const [payments, setPayments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    fetchLedger()
  }, [filterMethod, filterClass])

  async function fetchClasses() {
    try {
      const res = await api.get('/students/classes')
      setClasses(res.data.classes || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchLedger() {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterMethod) params.method = filterMethod
      if (filterClass) params.class = filterClass
      const res = await api.get('/fees/ledger', { params })
      setPayments(res.data.payments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalShown = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <PageShell
      title="Payment Ledger"
      subtitle={`${payments.length} transactions · Total: ${formatUGX(totalShown)}`}
    >
      <SectionCard noPadding>
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex flex-wrap gap-2">
          <input value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchLedger()}
            placeholder="Search student or adm. no..."
            className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg border
              border-[var(--color-border)] bg-white text-[13px]
              focus:outline-none focus:border-[#1a6b4a]" />

          <div className="relative">
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-7 rounded-lg border
                border-[var(--color-border)] bg-white text-[13px] focus:outline-none">
              <option value="">All classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2
              pointer-events-none text-[var(--color-text-muted)]" />
          </div>

          <div className="relative">
            <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-7 rounded-lg border
                border-[var(--color-border)] bg-white text-[13px] focus:outline-none">
              <option value="">All methods</option>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2
              pointer-events-none text-[var(--color-text-muted)]" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-[var(--color-text-muted)]">
            <Receipt size={28} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                  {['Date', 'Student', 'Class', 'Amount', 'Method', 'Account detail', 'Reference', 'Received by'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold
                      text-[var(--color-text-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {new Date(p.created_at).toLocaleDateString('en-UG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-[#1a6b4a]
                      cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/students/${p.student_id}`)}>
                      {p.full_name}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {p.class_name}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-green-600">
                      {formatUGX(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full
                        bg-[#1a6b4a]/10 text-[#1a6b4a]">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {p.account_detail || '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {p.reference || '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                      {p.received_by_name || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}