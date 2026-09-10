import { useState, useEffect } from 'react'
import { FileText, Plus, X, Send, Trash2 } from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'

const REPORT_CATEGORIES = [
  { value: 'general',      label: 'General',      color: '#6b7280' },
  { value: 'performance',  label: 'Performance',  color: '#2563eb' },
  { value: 'incident',     label: 'Incident',     color: '#dc2626' },
  { value: 'commendation', label: 'Commendation', color: '#16a34a' },
]

const SUGGESTED_REPORT_TYPES = [
  'Term Report', 'Lesson Coverage', 'Incident Report',
  'Student Concern', 'Administrative Request', 'General',
]

const MAX_BODY_LENGTH = 3000

function categoryColor(cat) {
  return REPORT_CATEGORIES.find(c => c.value === cat)?.color || '#6b7280'
}

export default function TeacherReports() {
  const [tab, setTab] = useState('received') // 'received' | 'submitted'

  // Reports received from admin
  const [received, setReceived] = useState([])
  const [receivedLoading, setReceivedLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Reports the teacher submits
  const [submitted, setSubmitted] = useState([])
  const [submittedLoading, setSubmittedLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ report_type: '', title: '', body: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReceived()
    loadSubmitted()
  }, [])

  async function loadReceived() {
    setReceivedLoading(true)
    try {
      const res = await api.get('/teachers/me/reports')
      setReceived(res.data.reports || [])
    } catch (err) {
      console.error(err)
    } finally {
      setReceivedLoading(false)
    }
  }

  async function loadSubmitted() {
    setSubmittedLoading(true)
    try {
      const res = await api.get('/report-submissions/me')
      setSubmitted(res.data.submissions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittedLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.report_type.trim() || !form.title.trim() || !form.body.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/report-submissions', form)
      setSubmitted(prev => [res.data.submission, ...prev])
      setForm({ report_type: '', title: '', body: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this submission? This cannot be undone.')) return
    try {
      await api.delete(`/report-submissions/${id}`)
      setSubmitted(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete submission.')
    }
  }

  const visibleReceived = filter === 'all'
    ? received
    : received.filter(r => r.category === filter)

  const receivedCounts = REPORT_CATEGORIES.reduce((acc, c) => {
    acc[c.value] = received.filter(r => r.category === c.value).length
    return acc
  }, {})

  return (
    <PageShell title="My Reports" subtitle="Reports from admin, and reports you submit">

      {/* Tabs */}
      <div className="inline-flex rounded-xl border-2 border-[var(--color-border)] p-1 bg-white">
        <button onClick={() => setTab('received')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
            tab === 'received'
              ? 'bg-[#1a6b4a] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
          }`}>
          From Admin
        </button>
        <button onClick={() => setTab('submitted')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
            tab === 'submitted'
              ? 'bg-[#1a6b4a] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
          }`}>
          My Submissions
        </button>
      </div>

      {/* ══════════ FROM ADMIN ══════════ */}
      {tab === 'received' && (
        <>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-all ${
                filter === 'all'
                  ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
              }`}>
              All ({received.length})
            </button>
            {REPORT_CATEGORIES.map(c => (
              <button key={c.value}
                onClick={() => setFilter(c.value)}
                className="px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-all"
                style={{
                  background:  filter === c.value ? c.color : 'transparent',
                  borderColor: filter === c.value ? c.color : 'var(--color-border)',
                  color:       filter === c.value ? 'white' : 'var(--color-text-muted)',
                }}>
                {c.label} ({receivedCounts[c.value] || 0})
              </button>
            ))}
          </div>

          <SectionCard title="Reports" noPadding>
            {receivedLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
                  border-t-[#1a6b4a] rounded-full animate-spin" />
              </div>
            ) : visibleReceived.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FileText size={28} className="text-[var(--color-text-muted)]" />
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  {received.length === 0
                    ? 'No reports have been written about you yet.'
                    : 'No reports in this category.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {visibleReceived.map(r => {
                  const color = categoryColor(r.category)
                  return (
                    <div key={r.id} className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: color + '18', color }}>
                          {REPORT_CATEGORIES.find(c => c.value === r.category)?.label || r.category}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {new Date(r.created_at).toLocaleDateString('en-UG', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                          {r.author_name ? ` · ${r.author_name}` : ''}
                        </span>
                      </div>
                      <div className="text-[14px] font-semibold text-[var(--color-text)]">
                        {r.title}
                      </div>
                      <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed mt-1">
                        {r.body}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* ══════════ MY SUBMISSIONS ══════════ */}
      {tab === 'submitted' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[13px]
                font-semibold transition-colors">
              <Plus size={15} />
              New report
            </button>
          </div>

          <SectionCard title="Submitted reports" noPadding>
            {submittedLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
                  border-t-[#1a6b4a] rounded-full animate-spin" />
              </div>
            ) : submitted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FileText size={28} className="text-[var(--color-text-muted)]" />
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  You haven't submitted any reports yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {submitted.map(s => (
                  <div key={s.id} className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                          bg-[#1a6b4a]/10 text-[#1a6b4a]">
                          {s.report_type}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {new Date(s.submitted_at).toLocaleDateString('en-UG', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-[14px] font-semibold text-[var(--color-text)]">
                        {s.title}
                      </div>
                      <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed mt-1">
                        {s.body}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(s.id)}
                      className="text-[var(--color-text-muted)] hover:text-red-600 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* Submit report modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
            p-6 w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-[var(--color-text)]">
                New report
              </h3>
              <button onClick={() => { setShowForm(false); setError('') }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200
                text-[12px] text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                  Report type
                </label>
                <input type="text" required list="report-type-suggestions"
                  value={form.report_type}
                  onChange={e => setForm(f => ({ ...f, report_type: e.target.value }))}
                  placeholder="e.g. Term Report, Incident Report..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
                <datalist id="report-type-suggestions">
                  {SUGGESTED_REPORT_TYPES.map(t => <option key={t} value={t} />)}
                </datalist>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_REPORT_TYPES.map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, report_type: t }))}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium
                        border border-[var(--color-border)] text-[var(--color-text-muted)]
                        hover:border-[#1a6b4a] hover:text-[#1a6b4a] transition-all">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                  Title
                </label>
                <input type="text" required value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Term 2 syllabus coverage — Mathematics S.3A"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-semibold text-[var(--color-text)]">
                    Report
                  </label>
                  <span className={`text-[11px] ${
                    form.body.length > MAX_BODY_LENGTH ? 'text-red-600 font-semibold' : 'text-[var(--color-text-muted)]'
                  }`}>
                    {form.body.length}/{MAX_BODY_LENGTH}
                  </span>
                </div>
                <textarea required rows={6} value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write the details of your report..."
                  maxLength={MAX_BODY_LENGTH}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] resize-none focus:outline-none focus:border-[#1a6b4a] transition-all" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowForm(false); setError('') }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    text-[13px] font-semibold text-[var(--color-text)]">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[13px] font-semibold
                    disabled:opacity-60">
                  <Send size={14} />
                  {saving ? 'Submitting...' : 'Submit report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}