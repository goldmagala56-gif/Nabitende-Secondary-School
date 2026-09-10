import { useState, useEffect } from 'react'
import {
  ClipboardList, Plus, X, ChevronDown, ChevronUp,
  CheckCircle, Clock, AlertCircle, FileText, Download
} from 'lucide-react'
import api from '../../api'

function statusColor(status) {
  if (status === 'marked')    return '#16a34a'
  if (status === 'submitted') return '#2563eb'
  return '#f59e0b'
}

function dueBadge(due) {
  const diff = new Date(due) - new Date()
  const days = Math.ceil(diff / 86400000)
  if (days < 0)  return { label: 'Overdue',       color: '#dc2626' }
  if (days === 0) return { label: 'Due today',     color: '#f59e0b' }
  if (days <= 3)  return { label: `${days}d left`, color: '#f59e0b' }
  return              { label: `${days}d left`,    color: '#16a34a' }
}

export default function TeacherAssignments() {
  const [assignments, setAssignments]       = useState([])
  const [loading, setLoading]               = useState(true)
  const [showCreate, setShowCreate]         = useState(false)
  const [expanded, setExpanded]             = useState(null)
  const [submissions, setSubmissions]       = useState({})
  const [loadingSubs, setLoadingSubs]       = useState(false)
  const [markingId, setMarkingId]           = useState(null)
  const [markForm, setMarkForm]             = useState({ marks: '', feedback: '' })
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState('')
  const [editingId, setEditingId]           = useState(null)
  const [editForm, setEditForm]             = useState({
    title: '', instructions: '', due_date: '', max_marks: '', status: '',
    class_name: '', subject: ''
  })
  const [form, setForm] = useState({
    class_name: '', subject: '', title: '',
    instructions: '', due_date: '', max_marks: '100'
  })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/assignments')
      setAssignments(res.data.assignments || [])
    } catch (err) {
      setError('Failed to load assignments.')
    } finally {
      setLoading(false)
    }
  }

  async function createAssignment() {
    if (!form.class_name || !form.subject || !form.title || !form.due_date) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/assignments', form)
      setShowCreate(false)
      setForm({ class_name: '', subject: '', title: '', instructions: '', due_date: '', max_marks: '100' })
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteAssignment(id) {
    if (!confirm('Delete this assignment and all its submissions?')) return
    try {
      await api.delete(`/assignments/${id}`)
      setAssignments(prev => prev.filter(a => a.id !== id))
    } catch {
      setError('Failed to delete assignment.')
    }
  }

  async function toggleExpand(id) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (submissions[id]) return
    setLoadingSubs(true)
    try {
      const res = await api.get(`/assignments/${id}/submissions`)
      setSubmissions(prev => ({ ...prev, [id]: res.data }))
    } catch {
      setError('Failed to load submissions.')
    } finally {
      setLoadingSubs(false)
    }
    }

    async function saveEdit(id) {
    setSaving(true)
    setError('')
    try {
      const res = await api.patch(`/assignments/${id}`, editForm)
      setAssignments(prev =>
        prev.map(a => a.id === id ? { ...a, ...res.data.assignment } : a)
      )
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function saveMark(assignmentId, studentId) {
    if (markForm.marks === '') return
    setSaving(true)
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${studentId}/mark`, {
        marks: parseFloat(markForm.marks),
        feedback: markForm.feedback
      })
      setMarkingId(null)
      setMarkForm({ marks: '', feedback: '' })
      // Refresh submissions
      const res = await api.get(`/assignments/${assignmentId}/submissions`)
      setSubmissions(prev => ({ ...prev, [assignmentId]: res.data }))
    } catch {
      setError('Failed to save mark.')
    } finally {
      setSaving(false)
    }
  }

  const active   = assignments.filter(a => a.status === 'active')
  const closed   = assignments.filter(a => a.status !== 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Assignments</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Create and manage class assignments
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError('') }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
          style={{ background: '#1a6b4a' }}>
          <Plus size={15} /> New Assignment
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]
            p-6 w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-[var(--color-text)]">New Assignment</h2>
              <button onClick={() => setShowCreate(false)}>
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    placeholder="e.g. S.4A"
                    value={form.class_name}
                    onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    placeholder="e.g. Mathematics"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                  placeholder="e.g. Algebra Exercise 1"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                  Instructions
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)] resize-none"
                  placeholder="Describe what students need to do..."
                  value={form.instructions}
                  onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    value={form.max_marks}
                    onChange={e => setForm(f => ({ ...f, max_marks: e.target.value }))} />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-[12px] mt-3">{error}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 rounded-lg border border-[var(--color-border)]
                  text-[13px] text-[var(--color-text-muted)]">
                Cancel
              </button>
              <button
                onClick={createAssignment}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-[13px] font-medium"
                style={{ background: '#1a6b4a', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Creating…' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]
            p-6 w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-[var(--color-text)]">Edit Assignment</h2>
              <button onClick={() => setEditingId(null)}>
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">Class</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    placeholder="e.g. S.4A"
                    value={editForm.class_name}
                    onChange={e => setEditForm(f => ({ ...f, class_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">Subject</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    placeholder="e.g. Mathematics"
                    value={editForm.subject}
                    onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">Title</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">Instructions</label>
                <textarea rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)] resize-none"
                  value={editForm.instructions}
                  onChange={e => setEditForm(f => ({ ...f, instructions: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">Due Date</label>
                  <input type="date"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    value={editForm.due_date}
                    onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">Max Marks</label>
                  <input type="number"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                    value={editForm.max_marks}
                    onChange={e => setEditForm(f => ({ ...f, max_marks: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">Status</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {error && <p className="text-red-600 text-[12px] mt-3">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditingId(null)}
                className="flex-1 py-2 rounded-lg border border-[var(--color-border)]
                  text-[13px] text-[var(--color-text-muted)]">
                Cancel
              </button>
              <button
                onClick={() => saveEdit(editingId)}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-[13px] font-medium"
                style={{ background: '#1a6b4a', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-[13px] text-[var(--color-text-muted)]">Loading…</p>
      ) : (
        <>
          {/* Active assignments */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                Active Assignments
                <span className="ml-2 text-[12px] font-normal text-[var(--color-text-muted)]">
                  ({active.length})
                </span>
              </h2>
            </div>

            {active.length === 0 ? (
              <div className="py-12 text-center">
                <ClipboardList size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  No active assignments. Create one to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {active.map(a => {
                  const badge = dueBadge(a.due_date)
                  const submitted = parseInt(a.total_submissions || 0)
                  const total     = parseInt(a.total_students   || 0)
                  const marked    = parseInt(a.marked_count     || 0)
                  const isOpen    = expanded === a.id
                  const subs      = submissions[a.id]

                  return (
                    <div key={a.id}>
                      {/* Assignment row */}
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-semibold text-[var(--color-text)]">
                                {a.title}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full"
                                style={{ background: badge.color + '18', color: badge.color }}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                              {a.subject} · {a.class_name} · Max: {a.max_marks} marks
                            </div>
                            {a.instructions && (
                              <p className="text-[12px] text-[var(--color-text-muted)] mt-1 line-clamp-1">
                                {a.instructions}
                              </p>
                            )}

                            {/* Progress bar */}
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border)]">
                                <div className="h-1.5 rounded-full transition-all"
                                  style={{
                                    width: total ? `${(submitted / total) * 100}%` : '0%',
                                    background: '#1a6b4a'
                                  }} />
                              </div>
                              <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
                                {submitted}/{total} submitted · {marked} marked
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingId(a.id)
                                setEditForm({
                                  title:        a.title,
                                  instructions: a.instructions || '',
                                  due_date:     a.due_date?.slice(0, 10),
                                  max_marks:    a.max_marks,
                                  status:       a.status,
                                  class_name:   a.class_name,
                                  subject:      a.subject,
                                })
                                setError('')
                              }}
                              className="text-[12px] px-2 py-1 rounded border border-[var(--color-border)]
                                text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                                transition-colors">
                              Edit
                            </button>
                            <button
                              onClick={() => deleteAssignment(a.id)}
                              className="text-red-400 hover:text-red-600 transition-colors">
                              <X size={15} />
                            </button>
                            <button
                              onClick={() => toggleExpand(a.id)}
                              className="text-[var(--color-text-muted)]">
                              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Submissions panel */}
                      {isOpen && (
                        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-4">
                          {loadingSubs ? (
                            <p className="text-[13px] text-[var(--color-text-muted)]">Loading submissions…</p>
                          ) : !subs ? null : (
                            <div className="space-y-4">
                              {/* Submitted */}
                              {subs.submissions.length > 0 && (
                                <div>
                                  <p className="text-[12px] font-semibold text-[var(--color-text)] mb-2">
                                    Submitted ({subs.submissions.length})
                                  </p>
                                  <div className="space-y-2">
                                    {subs.submissions.map(s => (
                                      <div key={s.id}
                                        className="p-3 rounded-lg border border-[var(--color-border)]
                                          bg-[var(--color-surface)]">
                                        <div className="flex items-center justify-between gap-2">
                                          <div>
                                            <span className="text-[13px] font-medium text-[var(--color-text)]">
                                              {s.student_name}
                                            </span>
                                            <span className="text-[11px] text-[var(--color-text-muted)] ml-2">
                                              {s.admission_number}
                                            </span>
                                          </div>
                                          <span className="text-[11px] px-2 py-0.5 rounded-full"
                                            style={{
                                              background: statusColor(s.status) + '18',
                                              color: statusColor(s.status)
                                            }}>
                                            {s.status}
                                          </span>
                                        </div>

                                        {s.text_answer && (
                                          <p className="text-[12px] text-[var(--color-text-muted)] mt-2
                                            line-clamp-2 italic">
                                            "{s.text_answer}"
                                          </p>
                                        )}

                                        {s.file_url && (
                                          <a href={s.file_url} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1 mt-2 text-[12px]
                                              text-[#2563eb] hover:underline">
                                            <Download size={12} /> {s.file_name || 'Download file'}
                                          </a>
                                        )}

                                        {/* Mark form */}
                                        {markingId === s.id ? (
                                          <div className="mt-3 flex items-end gap-2">
                                            <div>
                                              <label className="text-[11px] text-[var(--color-text-muted)]">
                                                Marks / {a.max_marks}
                                              </label>
                                              <input type="number"
                                                className="block w-24 px-2 py-1.5 rounded border
                                                  border-[var(--color-border)] bg-[var(--color-bg)]
                                                  text-[13px] text-[var(--color-text)] mt-0.5"
                                                value={markForm.marks}
                                                onChange={e => setMarkForm(f => ({ ...f, marks: e.target.value }))}
                                                max={a.max_marks} min={0} />
                                            </div>
                                            <div className="flex-1">
                                              <label className="text-[11px] text-[var(--color-text-muted)]">
                                                Feedback (optional)
                                              </label>
                                              <input
                                                className="block w-full px-2 py-1.5 rounded border
                                                  border-[var(--color-border)] bg-[var(--color-bg)]
                                                  text-[13px] text-[var(--color-text)] mt-0.5"
                                                value={markForm.feedback}
                                                onChange={e => setMarkForm(f => ({ ...f, feedback: e.target.value }))}
                                                placeholder="Great work, but…" />
                                            </div>
                                            <button
                                              onClick={() => saveMark(a.id, s.student_id)}
                                              disabled={saving}
                                              className="px-3 py-1.5 rounded text-white text-[12px]"
                                              style={{ background: '#1a6b4a' }}>
                                              Save
                                            </button>
                                            <button onClick={() => setMarkingId(null)}
                                              className="px-3 py-1.5 rounded border border-[var(--color-border)]
                                                text-[12px] text-[var(--color-text-muted)]">
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="mt-2 flex items-center gap-3">
                                            {s.marks !== null ? (
                                              <span className="text-[12px] font-semibold"
                                                style={{ color: '#16a34a' }}>
                                                {s.marks}/{a.max_marks}
                                                {s.feedback && (
                                                  <span className="font-normal text-[var(--color-text-muted)] ml-2">
                                                    — {s.feedback}
                                                  </span>
                                                )}
                                              </span>
                                            ) : null}
                                            <button
                                              onClick={() => {
                                                setMarkingId(s.id)
                                                setMarkForm({ marks: s.marks || '', feedback: s.feedback || '' })
                                              }}
                                              className="text-[12px] text-[#2563eb] hover:underline">
                                              {s.marks !== null ? 'Edit mark' : 'Mark'}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Not submitted */}
                              {subs.not_submitted.length > 0 && (
                                <div>
                                  <p className="text-[12px] font-semibold text-[var(--color-text)] mb-2">
                                    Not submitted ({subs.not_submitted.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {subs.not_submitted.map(s => (
                                      <span key={s.student_id}
                                        className="text-[12px] px-2 py-1 rounded-full border
                                          border-[var(--color-border)] text-[var(--color-text-muted)]">
                                        {s.student_name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Closed assignments */}
          {closed.length > 0 && (
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                  Closed / Archived
                  <span className="ml-2 text-[12px] font-normal text-[var(--color-text-muted)]">
                    ({closed.length})
                  </span>
                </h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {closed.map(a => (
                  <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-[13px] text-[var(--color-text-muted)]">{a.title}</span>
                      <span className="text-[12px] text-[var(--color-text-muted)] ml-2">
                        · {a.class_name} · {a.subject}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      closed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}