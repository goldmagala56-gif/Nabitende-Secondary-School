import { useState, useEffect } from 'react'
import { FileText, Send, X, Download, Inbox, Users, Plus } from 'lucide-react'
import api from '../../api'

const REPORT_CATEGORIES = [
  { value: 'general',      label: 'General',      color: '#6b7280' },
  { value: 'performance',  label: 'Performance',  color: '#2563eb' },
  { value: 'incident',     label: 'Incident',     color: '#dc2626' },
  { value: 'commendation', label: 'Commendation', color: '#16a34a' },
]

function categoryColor(cat) {
  return REPORT_CATEGORIES.find(c => c.value === cat)?.color || '#6b7280'
}

function downloadAsText(filename, lines) {
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function AdminTeacherReports() {
  const [tab, setTab] = useState('compose') // 'compose' | 'sent' | 'incoming'

  const [teachers, setTeachers] = useState([])
  const [staffRoles, setStaffRoles] = useState([])

  // Compose form
  const [form, setForm] = useState({ title: '', body: '', category: 'general' })
  const [targetType, setTargetType] = useState('teachers') // 'teachers' | 'role' | 'all'
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Sent history
  const [sent, setSent] = useState([])
  const [sentLoading, setSentLoading] = useState(true)

  // Incoming submissions
  const [incoming, setIncoming] = useState([])
  const [incomingLoading, setIncomingLoading] = useState(true)

  useEffect(() => {
    api.get('/teachers').then(res => setTeachers(res.data.teachers || [])).catch(console.error)
    api.get('/teachers/staff-roles').then(res => setStaffRoles(res.data.roles || [])).catch(console.error)
    loadSent()
    loadIncoming()
  }, [])

  async function loadSent() {
    setSentLoading(true)
    try {
      const res = await api.get('/teachers/reports/sent')
      setSent(res.data.reports || [])
    } catch (err) {
      console.error(err)
    } finally {
      setSentLoading(false)
    }
  }

  async function loadIncoming() {
    setIncomingLoading(true)
    try {
      const res = await api.get('/report-submissions')
      setIncoming(res.data.submissions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIncomingLoading(false)
    }
  }

  function toggleTeacher(id) {
    setSelectedTeacherIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    setError('')
    setSuccess('')

    let target
    if (targetType === 'teachers') {
      if (!selectedTeacherIds.length) { setError('Select at least one teacher.'); return }
      target = { type: 'teachers', teacher_ids: selectedTeacherIds }
    } else if (targetType === 'role') {
      if (!selectedRole) { setError('Select a staff role.'); return }
      target = { type: 'role', staff_role: selectedRole }
    } else {
      target = { type: 'all' }
    }

    setSending(true)
    try {
      const res = await api.post('/teachers/reports/broadcast', { ...form, target })
      setSuccess(`Sent to ${res.data.count} teacher${res.data.count !== 1 ? 's' : ''}: ${res.data.recipients.join(', ')}`)
      setForm({ title: '', body: '', category: 'general' })
      setSelectedTeacherIds([])
      setSelectedRole('')
      loadSent()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send report.')
    } finally {
      setSending(false)
    }
  }

  // Group sent reports by batch_id (broadcasts) vs individual (batch_id null)
  const sentGrouped = []
  const seenBatches = new Set()
  for (const r of sent) {
    if (r.batch_id) {
      if (seenBatches.has(r.batch_id)) continue
      seenBatches.add(r.batch_id)
      const batchReports = sent.filter(x => x.batch_id === r.batch_id)
      sentGrouped.push({
        isBatch: true,
        batch_id: r.batch_id,
        title: r.title,
        category: r.category,
        author_name: r.author_name,
        created_at: r.created_at,
        recipients: batchReports.map(x => x.teacher_name),
        body: r.body,
      })
    } else {
      sentGrouped.push({ isBatch: false, ...r })
    }
  }
  sentGrouped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  function downloadSentItem(item) {
    const lines = [
      item.title,
      `Category: ${item.category}`,
      `Sent: ${new Date(item.created_at).toLocaleString()}`,
      `By: ${item.author_name || 'Admin'}`,
      item.isBatch
        ? `Recipients (${item.recipients.length}): ${item.recipients.join(', ')}`
        : `Recipient: ${item.teacher_name}`,
      '',
      item.body,
    ]
    downloadAsText(`${item.title.replace(/[^a-z0-9]/gi, '_')}.txt`, lines)
  }

  function downloadIncomingItem(item) {
    const lines = [
      item.title,
      `Type: ${item.report_type}`,
      `From: ${item.teacher_name}`,
      `Submitted: ${new Date(item.submitted_at).toLocaleString()}`,
      '',
      item.body,
    ]
    downloadAsText(`${item.title.replace(/[^a-z0-9]/gi, '_')}.txt`, lines)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Teacher Reports</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          Write reports to teachers or groups, and review what teachers submit to you
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border-2 border-[var(--color-border)] p-1 bg-white">
        <button onClick={() => setTab('compose')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
            tab === 'compose' ? 'bg-[#ea580c] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
          }`}>
          Write Report
        </button>
        <button onClick={() => setTab('sent')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
            tab === 'sent' ? 'bg-[#ea580c] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
          }`}>
          Sent ({sent.length})
        </button>
        <button onClick={() => setTab('incoming')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
            tab === 'incoming' ? 'bg-[#ea580c] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
          }`}>
          Incoming ({incoming.length})
        </button>
      </div>

      {/* ══════════ COMPOSE ══════════ */}
      {tab === 'compose' && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 max-w-2xl"
          style={{ boxShadow: 'var(--shadow-sm)' }}>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-[12px] text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-5">
            {/* Target selector */}
            <div>
              <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
                Send to
              </label>
              <div className="flex gap-2 mb-3">
                {[
                  { value: 'teachers', label: 'Specific teachers', icon: Users },
                  { value: 'role',     label: 'By staff role/group', icon: Users },
                  { value: 'all',      label: 'All teachers',     icon: Users },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setTargetType(opt.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-[12px] font-semibold border-2 transition-all ${
                      targetType === opt.value
                        ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {targetType === 'teachers' && (
                <div className="max-h-48 overflow-y-auto rounded-xl border-2 border-[var(--color-border)] p-2 space-y-1">
                  {teachers.map(t => (
                    <label key={t.id}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                      <input type="checkbox" checked={selectedTeacherIds.includes(t.id)}
                        onChange={() => toggleTeacher(t.id)}
                        className="w-4 h-4 rounded accent-[#ea580c]" />
                      <span className="text-[13px] text-[var(--color-text)]">{t.full_name}</span>
                    </label>
                  ))}
                </div>
              )}

              {targetType === 'role' && (
                <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#ea580c]">
                  <option value="">Select a role/group...</option>
                  {staffRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}

              {targetType === 'all' && (
                <p className="text-[12px] text-[var(--color-text-muted)]">
                  This will send to every active teacher ({teachers.length} total).
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {REPORT_CATEGORIES.map(c => (
                  <button key={c.value} type="button"
                    onClick={() => setForm(f => ({ ...f, category: c.value }))}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                    style={{
                      background: form.category === c.value ? c.color + '18' : 'transparent',
                      borderColor: form.category === c.value ? c.color : 'var(--color-border)',
                      color: form.category === c.value ? c.color : 'var(--color-text-muted)'
                    }}>
                    {c.label}
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
                placeholder="e.g. Term 2 Board of Governors update"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                  bg-white text-[14px] focus:outline-none focus:border-[#ea580c]" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                Report
              </label>
              <textarea required rows={6} value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Write the report..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                  bg-white text-[14px] resize-none focus:outline-none focus:border-[#ea580c]" />
            </div>

            <button type="submit" disabled={sending}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                bg-[#ea580c] hover:bg-[#c2410c] text-white text-[13px] font-semibold disabled:opacity-60">
              <Send size={14} />
              {sending ? 'Sending...' : 'Send report'}
            </button>
          </form>
        </div>
      )}

      {/* ══════════ SENT ══════════ */}
      {tab === 'sent' && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          {sentLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#ea580c]/20 border-t-[#ea580c] rounded-full animate-spin" />
            </div>
          ) : sentGrouped.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <FileText size={28} className="text-[var(--color-text-muted)]" />
              <p className="text-[13px] text-[var(--color-text-muted)]">No reports sent yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {sentGrouped.map((item, i) => {
                const color = categoryColor(item.category)
                return (
                  <div key={item.isBatch ? item.batch_id : item.id} className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: color + '18', color }}>
                          {REPORT_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                        </span>
                        {item.isBatch && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ea580c]/10 text-[#ea580c]">
                            Group · {item.recipients.length} recipients
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {new Date(item.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-[14px] font-semibold text-[var(--color-text)]">{item.title}</div>
                      <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                        {item.isBatch ? item.recipients.join(', ') : item.teacher_name}
                      </p>
                      <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed mt-1">{item.body}</p>
                    </div>
                    <button onClick={() => downloadSentItem(item)}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-text-muted)]
                        hover:text-[#ea580c] flex-shrink-0">
                      <Download size={13} /> Download
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════ INCOMING ══════════ */}
      {tab === 'incoming' && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          {incomingLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#ea580c]/20 border-t-[#ea580c] rounded-full animate-spin" />
            </div>
          ) : incoming.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Inbox size={28} className="text-[var(--color-text-muted)]" />
              <p className="text-[13px] text-[var(--color-text-muted)]">No submissions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {incoming.map(s => (
                <div key={s.id} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1a6b4a]/10 text-[#1a6b4a]">
                        {s.report_type}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {new Date(s.submitted_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-[14px] font-semibold text-[var(--color-text)]">{s.title}</div>
                    <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">From {s.teacher_name}</p>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed mt-1">{s.body}</p>
                  </div>
                  <button onClick={() => downloadIncomingItem(s)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-text-muted)]
                      hover:text-[#ea580c] flex-shrink-0">
                    <Download size={13} /> Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}