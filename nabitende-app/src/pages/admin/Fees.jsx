import { useState, useEffect } from 'react'
import {
  CheckCircle2, AlertCircle, Clock, TrendingUp, TrendingDown,
  Save, X, Plus, ChevronDown, Settings
} from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import { useNavigate } from 'react-router-dom'
import SectionCard from '../../components/SectionCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const TERMS = ['Term 1', 'Term 2', 'Term 3']
const METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque']
const CURRENT_TERM = 'Term 2'
const CURRENT_YEAR = '2026'

function formatUGX(v) {
  return `UGX ${Number(v || 0).toLocaleString()}`
}

export default function AdminFees() {
  const [fees,          setFees]          = useState([])
  const [structures,    setStructures]    = useState([])
  const [classes,       setClasses]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [filterClass,   setFilterClass]   = useState('all')
  const [tab,           setTab]           = useState('records')

  // Payment modal
  const [payModal,      setPayModal]      = useState(null)
  const [payAmount,     setPayAmount]     = useState('')
  const [payAccountDetail, setPayAccountDetail] = useState('')
  const [payMethod,     setPayMethod]     = useState('Cash')
  const [payRef,        setPayRef]        = useState('')
  const [paying,        setPaying]        = useState(false)

  // Fee structure modal
  const [structModal,   setStructModal]   = useState(false)
  const [structForm,    setStructForm]    = useState({
    class_name: '', term: CURRENT_TERM,
    academic_year: CURRENT_YEAR, amount: ''
  })
  const [savingStruct,  setSavingStruct]  = useState(false)
  const navigate = useNavigate()

  // Assign fees modal
  const [assignModal,   setAssignModal]   = useState(false)
  const [assignClass,   setAssignClass]   = useState('')
  const [assignTerm,    setAssignTerm]    = useState(CURRENT_TERM)
  const [assignYear,    setAssignYear]    = useState(CURRENT_YEAR)
  const [assigning,     setAssigning]     = useState(false)

  // Discount modal
  const [discountModal,    setDiscountModal]    = useState(null)
  const [discountAmount,   setDiscountAmount]   = useState('')
  const [discountReason,   setDiscountReason]   = useState('')
  const [savingDiscount,   setSavingDiscount]   = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

 const [trendData, setTrendData] = useState([])

async function fetchAll() {
  setLoading(true)
  try {
    const [feesRes, structRes, classRes, trendRes] = await Promise.all([
      api.get('/fees'),
      api.get('/fees/structures'),
      api.get('/students/classes'),
      api.get('/fees/trend', { params: { months: 6 } }),
    ])
    setFees(feesRes.data.fees || [])
    setStructures(structRes.data.structures || [])
    setClasses(classRes.data.classes || [])
    setTrendData(trendRes.data.trend.map(t => ({
      month: t.month,
      collected: Number(t.collected),
    })))
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  async function handleRecordPayment(e) {
  e.preventDefault()
  if (!payAmount || !payModal) return
  setPaying(true)
  try {
    await api.post('/fees/payment', {
      student_id:    payModal.student_id,
      amount:        Number(payAmount),
      method:        payMethod,
      reference:     payRef,
      account_detail: payAccountDetail,
      term:          payModal.term,
      academic_year: payModal.academic_year,
    })
    setPayModal(null)
    setPayAmount('')
    setPayMethod('Cash')
    setPayRef('')
    setPayAccountDetail('')
    fetchAll()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to record payment.')
  } finally {
    setPaying(false)
  }
}

  async function handleSaveStructure(e) {
    e.preventDefault()
    setSavingStruct(true)
    try {
      await api.post('/fees/structures', structForm)
      setStructModal(false)
      setStructForm({
        class_name: '', term: CURRENT_TERM,
        academic_year: CURRENT_YEAR, amount: ''
      })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save structure.')
    } finally {
      setSavingStruct(false)
    }
  }

  async function handleAssignFees(e) {
    e.preventDefault()
    setAssigning(true)
    try {
      await api.post('/fees/assign', {
        class_name:    assignClass,
        term:          assignTerm,
        academic_year: assignYear,
      })
      setAssignModal(false)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign fees.')
    } finally {
      setAssigning(false)
    }
  }

  async function handleSaveDiscount(e) {
    e.preventDefault()
    setSavingDiscount(true)
    try {
      await api.patch(`/fees/${discountModal.id}/discount`, {
        discount:        Number(discountAmount),
        discount_reason: discountReason,
      })
      setDiscountModal(null)
      setDiscountAmount('')
      setDiscountReason('')
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply discount.')
    } finally {
      setSavingDiscount(false)
    }
  }

  

  // ── Stats ──────────────────────────────────────────────────
  const totalExpected  = fees.reduce((s, f) => s + Number(f.amount  || 0), 0)
  const totalCollected = fees.reduce((s, f) => s + Number(f.paid    || 0), 0)
  const totalBalance   = fees.reduce((s, f) => s + Number(f.balance || 0), 0)
  const clearedCount   = fees.filter(f => f.status === 'cleared').length
  const overdueCount   = fees.filter(f => f.status === 'unpaid').length
  const collectedPct   = totalExpected > 0
    ? Math.round((totalCollected / totalExpected) * 100) : 0

const lastTwo = trendData.slice(-2)
const momChange = lastTwo.length === 2 && lastTwo[0].collected > 0
  ? Math.round(((lastTwo[1].collected - lastTwo[0].collected) / lastTwo[0].collected) * 100)
  : null

  const filtered = fees.filter(f => {
    const matchSearch = f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.admission_number?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || f.status === filterStatus
    const matchClass  = filterClass  === 'all' || f.class_name === filterClass
    return matchSearch && matchStatus && matchClass
  })



  return (
    <PageShell
      title="Fees & Finance"
      subtitle={`${CURRENT_TERM}, ${CURRENT_YEAR}`}
      actions={
        <div className="flex gap-2">
          <button onClick={() => setStructModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              border-2 border-[#1a6b4a] text-[#1a6b4a] text-[13px]
              font-semibold hover:bg-[#1a6b4a]/5 transition-colors">
            <Settings size={15} />
            1. Set fee amount
          </button>
          <button onClick={() => setAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-[#1a6b4a] hover:bg-[#15573c] text-white
              text-[13px] font-semibold transition-colors">
            <Plus size={15} />
            2. Apply to students
          </button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total expected',   value: formatUGX(totalExpected),  color: '#2563eb', icon: TrendingUp   },
          { label: 'Collected',        value: formatUGX(totalCollected), color: '#1a6b4a', icon: CheckCircle2 },
          { label: 'Outstanding',      value: formatUGX(totalBalance),   color: '#dc2626', icon: AlertCircle  },
          { label: 'Fully cleared',    value: clearedCount,              color: '#f59e0b', icon: Clock        },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label}
              className="bg-[var(--color-surface)] rounded-xl border
                border-[var(--color-border)] p-4"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[var(--color-text-muted)]">{s.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: s.color + '18' }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-[16px] font-bold text-[var(--color-text)]">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Progress + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Collection progress">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[var(--color-text-muted)]">
              {formatUGX(totalCollected)} of {formatUGX(totalExpected)}
            </span>
            <span className="text-[20px] font-bold text-[#1a6b4a]">{collectedPct}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--color-bg)] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#1a6b4a] rounded-full transition-all"
              style={{ width: `${collectedPct}%` }} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--color-text-muted)]">Cleared</span>
              <span className="font-semibold text-green-600">{clearedCount} students</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--color-text-muted)]">Partial</span>
              <span className="font-semibold text-yellow-600">
                {fees.filter(f => f.status === 'partial').length} students
              </span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--color-text-muted)]">Unpaid</span>
              <span className="font-semibold text-red-600">{overdueCount} students</span>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Collection trend"
          subtitle={momChange !== null ? `MoM change: ${momChange > 0 ? '+' : ''}${momChange}%` : ''}
          icon={<TrendingUp size={16} className="text-[#1a6b4a]" />}
        >
          {trendData.length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-muted)]">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trendData} barSize={28}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={v => [formatUGX(v), 'Collected']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="collected" radius={[4,4,0,0]}>
                  {trendData.map((_, i) => (
                    <Cell key={i}
                      fill={i === trendData.length - 1 ? '#f59e0b' : '#1a6b4a'} />
                  ))}
                </Bar>
              </BarChart>

            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      

      {/* Fee structures */}
      {structures.length > 0 && (
        <SectionCard title="Fee structures">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Class', 'Term', 'Year', 'Amount'].map(h => (
                    <th key={h} className="pb-2 text-left text-[11px] font-semibold
                      text-[var(--color-text-muted)] uppercase tracking-wide px-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {structures.map((s, i) => (
                  <tr key={i} className="hover:bg-[var(--color-bg)]">
                    <td className="px-2 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
                      {s.class_name}
                    </td>
                    <td className="px-2 py-2.5 text-[13px] text-[var(--color-text-muted)]">
                      {s.term}
                    </td>
                    <td className="px-2 py-2.5 text-[13px] text-[var(--color-text-muted)]">
                      {s.academic_year}
                    </td>
                    <td className="px-2 py-2.5 text-[13px] font-semibold text-[#1a6b4a]">
                      {formatUGX(s.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Student records */}
      <SectionCard title={`${filtered.length} student records`} noPadding>
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex flex-wrap gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student or adm. no..."
            className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg border
              border-[var(--color-border)] bg-white text-[13px]
              focus:outline-none focus:border-[#1a6b4a]" />

          <div className="relative">
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-7 rounded-lg border
                border-[var(--color-border)] bg-white text-[11px] focus:outline-none">
              <option value="all">All classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2
              pointer-events-none text-[var(--color-text-muted)]" />
          </div>

          {['all', 'cleared', 'partial', 'unpaid'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-2
                transition-colors ${filterStatus === s
                  ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-[var(--color-text-muted)]">
            No fee records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                  {['Student', 'Class', 'Term Fee', 'Discount', 'Paid', 'Balance', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold
                      text-[var(--color-text-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-4 py-3 text-[13px] font-semibold text-[#1a6b4a]
                      cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/students/${f.student_id}`)}>
                      {f.full_name}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
                      {f.class_name}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
                      {f.amount ? (
                        formatUGX(f.amount)
                      ) : f.structure_amount ? (
                        <span className="text-blue-600 text-[11px] font-semibold">
                          {formatUGX(f.structure_amount)} (structure — not assigned)
                        </span>
                      ) : (
                        <span className="text-yellow-600 text-[11px] font-semibold">No fee structure set</span>
                      )}
                    </td>
                  <td className="px-4 py-3 text-[13px] text-blue-600">
                    {Number(f.discount) > 0 ? formatUGX(f.discount) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-green-600 font-medium">
                    {f.paid ? formatUGX(f.paid) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold"
                    style={{ color: Number(f.balance) > 0 ? '#dc2626' : '#1a6b4a' }}>
                    {f.balance ? formatUGX(f.balance) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {f.status ? (
                      <span className={`text-[11px] font-semibold px-2.5 py-1
                        rounded-full border ${
                        f.status === 'cleared'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : f.status === 'partial'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {f.status}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2.5 py-1
                        rounded-full border bg-gray-50 text-gray-500 border-gray-200">
                        not assigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {f.id && f.status !== 'cleared' && (
                        <button onClick={() => { setPayModal(f); setPayAmount('') }}
                          className="text-[12px] font-semibold text-[#1a6b4a] hover:underline">
                          Pay
                        </button>
                      )}
                      {f.id && (
                        <button onClick={() => { setDiscountModal(f); setDiscountAmount(''); setDiscountReason('') }}
                          className="text-[12px] font-semibold text-blue-600 hover:underline">
                          Discount
                        </button>
                      )}
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ── Fee structure modal ── */}
      {structModal && (
        <Modal title="Set fee structure" onClose={() => setStructModal(false)}>
          <form onSubmit={handleSaveStructure} className="space-y-4">
            <Field label="Class">
              <select value={structForm.class_name}
                onChange={e => setStructForm(f => ({ ...f, class_name: e.target.value }))}
                required className="input">
                <option value="">Select class...</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Term">
              <select value={structForm.term}
                onChange={e => setStructForm(f => ({ ...f, term: e.target.value }))}
                className="input">
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Academic year">
              <input type="text" value={structForm.academic_year}
                onChange={e => setStructForm(f => ({ ...f, academic_year: e.target.value }))}
                className="input" />
            </Field>
            <Field label="Amount (UGX)">
              <input type="number" required value={structForm.amount}
                onChange={e => setStructForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 850000" className="input" />
            </Field>
            <ModalActions
              onCancel={() => setStructModal(false)}
              saving={savingStruct}
              label="Save structure"
            />
          </form>
        </Modal>
      )}

      {/* ── Assign fees modal ── */}
      {assignModal && (
        <Modal title="Assign fees to class" onClose={() => setAssignModal(false)}>
          <p className="text-[13px] text-[var(--color-text-muted)] mb-4">
            This pushes the fee amount you set (via "Set fee amount") out to
             every student in this class — creating a fee record for anyone 
             missing one, and updating the amount for anyone who already has one.
              Their existing payments and discounts are kept.
          </p>
          <form onSubmit={handleAssignFees} className="space-y-4">
            <Field label="Class">
              <select value={assignClass}
                onChange={e => setAssignClass(e.target.value)}
                required className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all">
                <option value="">Select class...</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Term">
              <select value={assignTerm}
                onChange={e => setAssignTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all">
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Academic year">
              <input type="text" value={assignYear}
                onChange={e => setAssignYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
            </Field>
            <ModalActions
              onCancel={() => setAssignModal(false)}
              saving={assigning}
              label="Assign fees"
            />
          </form>
        </Modal>
      )}

      {/* ── Payment modal ── */}
      {payModal && (
        <Modal title="Record payment" onClose={() => setPayModal(null)}>
          <div className="p-3 rounded-xl bg-[var(--color-bg)] mb-4">
            <p className="text-[13px] font-semibold text-[var(--color-text)]">
              {payModal.full_name}
            </p>
            <p className="text-[12px] text-[var(--color-text-muted)]">
              Balance: <span className="text-red-600 font-semibold">
                {formatUGX(payModal.balance)}
              </span>
            </p>
          </div>
          <Field label={
            payMethod === 'Mobile Money' ? 'Mobile Money number'
            : payMethod === 'Bank Transfer' ? 'Bank account / branch'
            : payMethod === 'Cheque' ? 'Cheque number'
            : 'Account detail (optional)'
          }>
            <input type="text" value={payAccountDetail}
              onChange={e => setPayAccountDetail(e.target.value)}
              placeholder={payMethod === 'Mobile Money' ? 'e.g. 0772-XXX-XXX' : 'e.g. Stanbic - 01-XXXXXXX'}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
          </Field>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <Field label="Amount (UGX)">
              <input type="number" required value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder="e.g. 250000" className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
            </Field>
            <Field label="Payment method">
              <select value={payMethod}
                onChange={e => setPayMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all">  
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Reference / receipt no. (optional)">
              <input type="text" value={payRef}
                onChange={e => setPayRef(e.target.value)}
                placeholder="e.g. MM-TXN-12345" className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
            </Field>
            <ModalActions
              onCancel={() => setPayModal(null)}
              saving={paying}
              label="Save payment"
            />
          </form>
        </Modal>
      )}

      {/* ── Discount modal ── */}
      {discountModal && (
        <Modal title={`Apply discount — ${discountModal.full_name}`}
          onClose={() => setDiscountModal(null)}>
          <div className="p-3 rounded-xl bg-[var(--color-bg)] mb-4">
            <p className="text-[12px] text-[var(--color-text-muted)]">
              Current fee: <span className="font-semibold text-[var(--color-text)]">
                {formatUGX(discountModal.amount)}
              </span>
            </p>
            {Number(discountModal.discount) > 0 && (
              <p className="text-[12px] text-blue-600 mt-0.5">
                Existing discount: {formatUGX(discountModal.discount)}
                {discountModal.discount_reason && ` — ${discountModal.discount_reason}`}
              </p>
            )}
          </div>
          <form onSubmit={handleSaveDiscount} className="space-y-4">
            <Field label="Discount amount (UGX)">
              <input type="number" required value={discountAmount}
                onChange={e => setDiscountAmount(e.target.value)}
                placeholder="e.g. 100000" className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
            </Field>
            <Field label="Reason">
              <input type="text" required value={discountReason}
                onChange={e => setDiscountReason(e.target.value)}
                placeholder="e.g. Academic merit, Bursary, Staff child"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)] bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
            </Field>
            <ModalActions
              onCancel={() => setDiscountModal(null)}
              saving={savingDiscount}
              label="Apply discount"
            />
          </form>
        </Modal>
      )}

    </PageShell>
  )
}

/* ── Small reusable components ── */

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
        p-6 w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-[var(--color-text)]">{title}</h3>
          <button onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function ModalActions({ onCancel, saving, label }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)]
          text-[13px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]">
        Cancel
      </button>
      <button type="submit" disabled={saving}
        className="flex-1 py-2.5 rounded-xl bg-[#1a6b4a] hover:bg-[#15573c]
          text-white text-[13px] font-semibold disabled:opacity-60">
        {saving ? 'Saving...' : label}
      </button>
    </div>
  )
}