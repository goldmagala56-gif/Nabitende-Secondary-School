import { useState, useEffect } from 'react'
import {
  BookOpen, Plus, X, ChevronDown, ChevronUp,
  CheckCircle, Circle, Clock, Edit2, Save, Target
} from 'lucide-react'
import api from '../../api'

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: '#6b7280' },
  { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { value: 'done',        label: 'Done',         color: '#16a34a' },
]

function StatusIcon({ status }) {
  if (status === 'done')        return <CheckCircle size={16} style={{ color: '#16a34a' }} />
  if (status === 'in_progress') return <Clock       size={16} style={{ color: '#f59e0b' }} />
  return                               <Circle      size={16} style={{ color: '#6b7280' }} />
}

function statusColor(s) {
  return STATUS_OPTIONS.find(o => o.value === s)?.color || '#6b7280'
}

export default function TeacherSyllabus() {
  const [scope, setScope]         = useState({ subjects: [], classes: [] })
  const [subject, setSubject]     = useState('')
  const [className, setClassName] = useState('')
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [scopeLoading, setScopeLoading] = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // Add topic form
  const [showAdd, setShowAdd]     = useState(false)
  const [addForm, setAddForm]     = useState({ topic: '', subtopics: '' })
  const [saving, setSaving]       = useState(false)

  // Edit topic
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({
    topic: '', subtopics: '', status: '', date_taught: '', notes: ''
  })

  // Target
  const [showTarget, setShowTarget] = useState(false)
  const [targetVal, setTargetVal]   = useState('')

  // Expanded subtopics
  const [expanded, setExpanded]   = useState(null)

  useEffect(() => { loadScope() }, [])
  useEffect(() => {
    if (subject && className) loadSyllabus()
  }, [subject, className])

  async function loadScope() {
    setScopeLoading(true)
    try {
      const res = await api.get('/syllabus/me/scope')
      setScope(res.data)
      if (res.data.subjects?.length) setSubject(res.data.subjects[0])
      if (res.data.classes?.length)  setClassName(res.data.classes[0])
    } catch {
      setError('Failed to load your subjects.')
    } finally {
      setScopeLoading(false)
    }
  }

  async function loadSyllabus() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/syllabus', {
        params: { class_name: className, subject }
      })
      setData(res.data)
      setTargetVal(res.data.target || '')
    } catch {
      setError('Failed to load syllabus.')
    } finally {
      setLoading(false)
    }
  }

  async function addTopic() {
    if (!addForm.topic.trim()) return
    setSaving(true)
    setError('')
    try {
      await api.post('/syllabus', {
        class_name: className,
        subject,
        topic:      addForm.topic.trim(),
        subtopics:  addForm.subtopics
          ? addForm.subtopics.split('\n').map(s => s.trim()).filter(Boolean)
          : []
      })
      setAddForm({ topic: '', subtopics: '' })
      setShowAdd(false)
      await loadSyllabus()
      setSuccess('Topic added!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add topic.')
    } finally {
      setSaving(false)
    }
  }

  async function saveTopic() {
    setSaving(true)
    setError('')
    try {
      await api.patch(`/syllabus/${editingId}`, {
        topic:       editForm.topic,
        subtopics:   editForm.subtopics
          ? editForm.subtopics.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        status:      editForm.status,
        date_taught: editForm.date_taught || null,
        notes:       editForm.notes || null
      })
      setEditingId(null)
      await loadSyllabus()
      setSuccess('Topic updated!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update topic.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTopic(id) {
    if (!confirm('Delete this topic?')) return
    try {
      await api.delete(`/syllabus/${id}`)
      await loadSyllabus()
    } catch {
      setError('Failed to delete topic.')
    }
  }

  async function quickStatus(id, status) {
    try {
      await api.patch(`/syllabus/${id}`, { status })
      await loadSyllabus()
    } catch {
      setError('Failed to update status.')
    }
  }

  async function saveTarget() {
    if (!targetVal) return
    setSaving(true)
    try {
      await api.put('/syllabus/target', {
        class_name:    className,
        subject,
        target_topics: parseInt(targetVal)
      })
      setShowTarget(false)
      await loadSyllabus()
      setSuccess('Target set!')
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('Failed to set target.')
    } finally {
      setSaving(false)
    }
  }

  const topics   = data?.topics    || []
  const summary  = data?.summary   || {}
  const target   = data?.target    || 0
  const pct      = target > 0 ? Math.min(Math.round((summary.done / target) * 100), 100) : 0

  if (scopeLoading) return (
    <p className="text-[13px] text-[var(--color-text-muted)]">Loading…</p>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Syllabus Tracker</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Track your teaching progress per topic
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setError('') }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
          style={{ background: '#1a6b4a' }}>
          <Plus size={15} /> Add Topic
        </button>
      </div>

      {error   && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[13px]">{success}</div>}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-[var(--color-border)]
              bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] font-medium
              cursor-pointer focus:outline-none" style={{ minWidth: 150 }}>
            {scope.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2
            text-[var(--color-text-muted)] pointer-events-none" />
        </div>

        <div className="relative">
          <select value={className} onChange={e => setClassName(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-[var(--color-border)]
              bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] font-medium
              cursor-pointer focus:outline-none" style={{ minWidth: 120 }}>
            {scope.classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2
            text-[var(--color-text-muted)] pointer-events-none" />
        </div>

        {data && (
          <span className="text-[12px] text-[var(--color-text-muted)]">
            {data.term} · {data.academic_year}
          </span>
        )}
      </div>

      {/* Progress + target */}
      {data && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
              Term Progress
            </h2>
            <button onClick={() => setShowTarget(t => !t)}
              className="flex items-center gap-1.5 text-[12px] text-[#1a6b4a]">
              <Target size={13} />
              {target > 0 ? `Target: ${target} topics` : 'Set target'}
            </button>
          </div>

          {showTarget && (
            <div className="flex items-center gap-2 mb-4">
              <input type="number" min={1}
                className="w-24 px-3 py-1.5 rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                value={targetVal}
                onChange={e => setTargetVal(e.target.value)}
                placeholder="e.g. 20" />
              <button onClick={saveTarget} disabled={saving}
                className="px-3 py-1.5 rounded-lg text-white text-[12px]"
                style={{ background: '#1a6b4a' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setShowTarget(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)]
                  text-[12px] text-[var(--color-text-muted)]">
                Cancel
              </button>
            </div>
          )}

          {/* Progress bar */}
          {target > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-[var(--color-text-muted)]">
                  {summary.done || 0} of {target} topics done
                </span>
                <span className="text-[12px] font-semibold" style={{ color: '#1a6b4a' }}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-border)]">
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${pct}%`, background: '#1a6b4a' }} />
              </div>
            </div>
          )}

          {/* Summary pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Done',        value: summary.done        || 0, color: '#16a34a' },
              { label: 'In Progress', value: summary.in_progress || 0, color: '#f59e0b' },
              { label: 'Not Started', value: summary.not_started || 0, color: '#6b7280' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-lg border
                border-[var(--color-border)]">
                <div className="text-[20px] font-bold" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add topic modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]
            p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-[var(--color-text)]">Add Topic</h2>
              <button onClick={() => setShowAdd(false)}>
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                  placeholder="e.g. Quadratic Equations"
                  value={addForm.topic}
                  onChange={e => setAddForm(f => ({ ...f, topic: e.target.value }))} />
              </div>
              <div>
                <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                  Subtopics (one per line, optional)
                </label>
                <textarea rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)] resize-none"
                  placeholder="e.g.&#10;Factorisation&#10;Completing the square&#10;Quadratic formula"
                  value={addForm.subtopics}
                  onChange={e => setAddForm(f => ({ ...f, subtopics: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2 rounded-lg border border-[var(--color-border)]
                  text-[13px] text-[var(--color-text-muted)]">
                Cancel
              </button>
              <button onClick={addTopic} disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-[13px] font-medium"
                style={{ background: '#1a6b4a', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Adding…' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topics list */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
        style={{ boxShadow: 'var(--shadow-sm)' }}>

        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
            Topics
            <span className="ml-2 text-[12px] font-normal text-[var(--color-text-muted)]">
              ({topics.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : topics.length === 0 ? (
          <div className="py-14 text-center">
            <BookOpen size={28} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-[13px] text-[var(--color-text-muted)]">
              No topics yet. Add your first topic to start tracking.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {topics.map((t, i) => {
              const isEditing  = editingId === t.id
              const isExpanded = expanded === t.id

              return (
                <div key={t.id}>
                  {isEditing ? (
                    /* ── Edit mode ── */
                    <div className="px-5 py-4 space-y-3 bg-[var(--color-bg)]">
                      <div>
                        <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Topic</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                            bg-[var(--color-surface)] text-[13px] text-[var(--color-text)]"
                          value={editForm.topic}
                          onChange={e => setEditForm(f => ({ ...f, topic: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">
                          Subtopics (one per line)
                        </label>
                        <textarea rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                            bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] resize-none"
                          value={editForm.subtopics}
                          onChange={e => setEditForm(f => ({ ...f, subtopics: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Status</label>
                          <select
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                              bg-[var(--color-surface)] text-[13px] text-[var(--color-text)]"
                            value={editForm.status}
                            onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                            {STATUS_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">
                            Date Taught
                          </label>
                          <input type="date"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                              bg-[var(--color-surface)] text-[13px] text-[var(--color-text)]"
                            value={editForm.date_taught}
                            onChange={e => setEditForm(f => ({ ...f, date_taught: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Notes</label>
                        <textarea rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                            bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] resize-none"
                          value={editForm.notes}
                          onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                          placeholder="Any notes about this topic…" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)}
                          className="flex-1 py-2 rounded-lg border border-[var(--color-border)]
                            text-[13px] text-[var(--color-text-muted)]">
                          Cancel
                        </button>
                        <button onClick={saveTopic} disabled={saving}
                          className="flex-1 py-2 rounded-lg text-white text-[13px] font-medium
                            flex items-center justify-center gap-1"
                          style={{ background: '#1a6b4a', opacity: saving ? 0.7 : 1 }}>
                          <Save size={13} />
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── View mode ── */
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-3">

                        {/* Status icon — click to cycle */}
                        <button
                          onClick={() => {
                            const order = ['not_started', 'in_progress', 'done']
                            const next  = order[(order.indexOf(t.status) + 1) % order.length]
                            quickStatus(t.id, next)
                          }}
                          className="mt-0.5 flex-shrink-0">
                          <StatusIcon status={t.status} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-semibold text-[var(--color-text)]">
                              {i + 1}. {t.topic}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: statusColor(t.status) + '18',
                                color:      statusColor(t.status)
                              }}>
                              {STATUS_OPTIONS.find(o => o.value === t.status)?.label}
                            </span>
                          </div>

                          {t.date_taught && (
                            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                              Taught: {new Date(t.date_taught).toLocaleDateString()}
                            </p>
                          )}

                          {t.notes && (
                            <p className="text-[12px] text-[var(--color-text-muted)] mt-1 italic">
                              {t.notes}
                            </p>
                          )}

                          {/* Subtopics toggle */}
                          {t.subtopics?.length > 0 && (
                            <button
                              onClick={() => setExpanded(isExpanded ? null : t.id)}
                              className="flex items-center gap-1 mt-1.5 text-[12px] text-[#1a6b4a]">
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              {t.subtopics.length} subtopic{t.subtopics.length !== 1 ? 's' : ''}
                            </button>
                          )}

                          {isExpanded && (
                            <ul className="mt-2 space-y-1 ml-2">
                              {t.subtopics.map((sub, j) => (
                                <li key={j}
                                  className="flex items-center gap-2 text-[12px]
                                    text-[var(--color-text-muted)]">
                                  <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]
                                    flex-shrink-0" />
                                  {sub}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingId(t.id)
                              setEditForm({
                                topic:       t.topic,
                                subtopics:   (t.subtopics || []).join('\n'),
                                status:      t.status,
                                date_taught: t.date_taught?.slice(0, 10) || '',
                                notes:       t.notes || ''
                              })
                            }}
                            className="text-[12px] px-2 py-1 rounded border border-[var(--color-border)]
                              text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                            Edit
                          </button>
                          <button onClick={() => deleteTopic(t.id)}
                            className="text-red-400 hover:text-red-600">
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}