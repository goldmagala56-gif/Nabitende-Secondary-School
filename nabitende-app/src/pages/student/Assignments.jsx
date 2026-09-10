import { useState, useEffect, useRef } from 'react'
import { ClipboardList, Upload, CheckCircle, Clock, AlertCircle, X } from 'lucide-react'
import api from '../../api'

function dueBadge(due) {
  const diff = new Date(due) - new Date()
  const days = Math.ceil(diff / 86400000)
  if (days < 0)   return { label: 'Overdue',       color: '#dc2626' }
  if (days === 0) return { label: 'Due today',     color: '#f59e0b' }
  if (days <= 3)  return { label: `${days}d left`, color: '#f59e0b' }
  return               { label: `${days}d left`,   color: '#16a34a' }
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(null)
  const [form, setForm]               = useState({ text_answer: '', file: null })
  const [openId, setOpenId]           = useState(null)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const fileRef                       = useRef()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/assignments/student/mine')
      setAssignments(res.data.assignments || [])
    } catch {
      setError('Failed to load assignments.')
    } finally {
      setLoading(false)
    }
  }

  async function submit(assignmentId) {
    if (!form.text_answer && !form.file) {
      setError('Please type an answer or upload a file.')
      return
    }
    setSubmitting(assignmentId)
    setError('')
    try {
      const data = new FormData()
      if (form.text_answer) data.append('text_answer', form.text_answer)
      if (form.file)        data.append('file', form.file)

      await api.post(`/assignments/${assignmentId}/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Submitted successfully!')
      setOpenId(null)
      setForm({ text_answer: '', file: null })
      await load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.')
    } finally {
      setSubmitting(null)
    }
  }

  const pending  = assignments.filter(a => !a.submission_id)
  const done     = assignments.filter(a =>  a.submission_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">My Assignments</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          View and submit your class assignments
        </p>
      </div>

      {error   && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[13px]">{success}</div>}

      {loading ? (
        <p className="text-[13px] text-[var(--color-text-muted)]">Loading…</p>
      ) : (
        <>
          {/* Pending */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                Pending <span className="text-[12px] font-normal text-[var(--color-text-muted)]">({pending.length})</span>
              </h2>
            </div>
            {pending.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle size={28} className="mx-auto mb-2 text-green-500" />
                <p className="text-[13px] text-[var(--color-text-muted)]">All caught up! No pending assignments.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {pending.map(a => {
                  const badge = dueBadge(a.due_date)
                  const isOpen = openId === a.id
                  return (
                    <div key={a.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-semibold text-[var(--color-text)]">{a.title}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full"
                              style={{ background: badge.color + '18', color: badge.color }}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                            {a.subject} · Due {new Date(a.due_date).toLocaleDateString()}
                          </p>
                          {a.instructions && (
                            <p className="text-[12px] text-[var(--color-text-muted)] mt-1">{a.instructions}</p>
                          )}
                        </div>
                        <button
                          onClick={() => { setOpenId(isOpen ? null : a.id); setError('') }}
                          className="px-3 py-1.5 rounded-lg text-white text-[12px] font-medium flex-shrink-0"
                          style={{ background: '#1a6b4a' }}>
                          {isOpen ? 'Cancel' : 'Submit'}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-[var(--color-border)]">
                          <div>
                            <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                              Your answer (text)
                            </label>
                            <textarea rows={4}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                                bg-[var(--color-bg)] text-[13px] text-[var(--color-text)] resize-none"
                              placeholder="Type your answer here…"
                              value={form.text_answer}
                              onChange={e => setForm(f => ({ ...f, text_answer: e.target.value }))} />
                          </div>

                          <div>
                            <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                              Or attach a file (PDF, Word, image — max 20MB)
                            </label>
                            <div
                              onClick={() => fileRef.current?.click()}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed
                                border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg)]
                                transition-colors">
                              <Upload size={14} className="text-[var(--color-text-muted)]" />
                              <span className="text-[12px] text-[var(--color-text-muted)]">
                                {form.file ? form.file.name : 'Click to choose file'}
                              </span>
                              {form.file && (
                                <button onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, file: null })) }}>
                                  <X size={12} className="text-red-400" />
                                </button>
                              )}
                            </div>
                            <input type="file" ref={fileRef} className="hidden"
                                onChange={e => {
                                    const file = e.target.files[0]
                                    if (file && file.size > 20 * 1024 * 1024) {
                                    setError('File must be under 20MB.')
                                    return
                                    }
                                    setForm(f => ({ ...f, file: file || null }))
                                }} />
                          </div>

                          <button
                            onClick={() => submit(a.id)}
                            disabled={submitting === a.id}
                            className="w-full py-2 rounded-lg text-white text-[13px] font-medium"
                            style={{ background: '#1a6b4a', opacity: submitting === a.id ? 0.7 : 1 }}>
                            {submitting === a.id ? 'Submitting…' : 'Submit Assignment'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submitted */}
          {done.length > 0 && (
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                  Submitted <span className="text-[12px] font-normal text-[var(--color-text-muted)]">({done.length})</span>
                </h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {done.map(a => (
                  <div key={a.id} className="px-5 py-4 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[13px] font-semibold text-[var(--color-text)]">{a.title}</span>
                      <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{a.subject}</p>
                      {a.marks !== null && (
                        <p className="text-[13px] font-semibold mt-1" style={{ color: '#16a34a' }}>
                          {a.marks} / {a.max_marks}
                          {a.feedback && (
                            <span className="font-normal text-[var(--color-text-muted)] ml-2">— {a.feedback}</span>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: a.marks !== null ? '#16a34a18' : '#2563eb18',
                        color:      a.marks !== null ? '#16a34a'   : '#2563eb'
                      }}>
                      {a.marks !== null ? 'Marked' : 'Submitted'}
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