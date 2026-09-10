import { useState, useEffect, useRef } from 'react'
import {
  User, Phone, BookOpen, Award, Edit2, Save,
  X, Camera, CheckCircle, AlertCircle, Clock, FileText
} from 'lucide-react'
import api from '../../api'

const STATUS_OPTIONS = [
  { value: 'Present',    label: 'Present',    color: '#16a34a' },
  { value: 'On Leave',   label: 'On Leave',   color: '#f59e0b' },
  { value: 'Sick',       label: 'Sick',       color: '#dc2626' },
  { value: 'Training',   label: 'Training',   color: '#2563eb' },
  { value: 'Suspended',  label: 'Suspended',  color: '#7c3aed' },
]

const REPORT_CATEGORIES = [
  { value: 'general',      label: 'General',      color: '#6b7280' },
  { value: 'performance',  label: 'Performance',  color: '#2563eb' },
  { value: 'incident',     label: 'Incident',     color: '#dc2626' },
  { value: 'commendation', label: 'Commendation', color: '#16a34a' },
]

function statusColor(s) {
  return STATUS_OPTIONS.find(o => o.value === s)?.color || '#6b7280'
}

function categoryColor(cat) {
  return REPORT_CATEGORIES.find(c => c.value === cat)?.color || '#6b7280'
}

function StatusBadge({ status }) {
  const color = statusColor(status)
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium"
      style={{ background: color + '18', color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status || 'Present'}
    </span>
  )
}

export default function TeacherProfile() {
  const [teacher, setTeacher]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const fileRef                     = useRef()

  const [form, setForm] = useState({
    phone: '', bio: '', achievements: '', photo_url: '', photo_file: null
  })

  const [statusForm, setStatusForm] = useState({
    status: '', status_note: '', status_until: ''
  })

  // Staff reports written about this teacher (read-only)
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)

  useEffect(() => { load(); loadReports() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/teachers/me')
      setTeacher(res.data.teacher)
      const t = res.data.teacher
      setForm({
        phone:        t.phone || '',
        bio:          t.bio || '',
        achievements: (t.achievements || []).join('\n'),
        photo_url:    t.photo_url || '',
        photo_file:   null
      })
      setStatusForm({
        status:       t.status || 'Present',
        status_note:  t.status_note || '',
        status_until: t.status_until?.slice(0, 10) || ''
      })
    } catch {
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  async function loadReports() {
    setReportsLoading(true)
    try {
      const res = await api.get('/teachers/me/reports')
      setReports(res.data.reports || [])
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setReportsLoading(false)
    }
  }

  async function saveProfile() {
    setSaving(true)
    setError('')
    try {
      const data = new FormData()
      data.append('phone', form.phone)
      data.append('bio', form.bio)
      // Split achievements by newline into array
      form.achievements.split('\n')
        .map(a => a.trim()).filter(Boolean)
        .forEach(a => data.append('achievements', a))
      if (form.photo_file) data.append('photo', form.photo_file)

      const res = await api.patch('/teachers/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setTeacher(res.data.teacher)
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function saveStatus() {
    setSaving(true)
    setError('')
    try {
      const res = await api.patch('/teachers/me', statusForm)
      setTeacher(prev => ({ ...prev, ...res.data.teacher }))
      setEditStatus(false)
      setSuccess('Status updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !teacher) return (
    <p className="text-[13px] text-[var(--color-text-muted)]">Loading profile…</p>
  )

  const initials = teacher?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">My Profile</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          View and update your personal information
        </p>
      </div>

      {error   && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[13px]">{success}</div>}

      {/* Profile card */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6"
        style={{ boxShadow: 'var(--shadow-sm)' }}>

        {/* Photo + name */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative flex-shrink-0">
            {teacher.photo_url ? (
              <img src={teacher.photo_url} alt={teacher.full_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-border)]" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center
                text-[22px] font-bold text-white"
                style={{ background: '#1a6b4a' }}>
                {initials}
              </div>
            )}
            {editing && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1a6b4a]
                  flex items-center justify-center border-2 border-[var(--color-surface)]">
                <Camera size={13} className="text-white" />
              </button>
            )}
            <input type="file" ref={fileRef} className="hidden" accept="image/*"
              onChange={e => {
                const file = e.target.files[0]
                if (file) setForm(f => ({ ...f, photo_file: file }))
              }} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
              {teacher.full_name}
            </h2>
            <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
              {(teacher.subjects || [teacher.subject]).join(', ')}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={teacher.status} />
              {teacher.status_note && (
                <span className="text-[12px] text-[var(--color-text-muted)]">
                  — {teacher.status_note}
                </span>
              )}
              {teacher.status_until && (
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  until {new Date(teacher.status_until).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => { setEditing(e => !e); setError('') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border
              border-[var(--color-border)] text-[12px] text-[var(--color-text-muted)]
              hover:text-[var(--color-text)] transition-colors flex-shrink-0">
            {editing ? <X size={13} /> : <Edit2 size={13} />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Info rows */}
        <div className="space-y-4">

          {/* Phone */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)]
              uppercase tracking-wide">
              Phone
            </label>
            {editing ? (
              <input
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+256 700 000000" />
            ) : (
              <p className="mt-1 text-[14px] text-[var(--color-text)]">
                {teacher.phone || <span className="text-[var(--color-text-muted)]">Not set</span>}
              </p>
            )}
          </div>

          {/* Email (read only) */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)]
              uppercase tracking-wide">
              Email
            </label>
            <p className="mt-1 text-[14px] text-[var(--color-text)]">{teacher.account_email}</p>
          </div>

          {/* Qualification (read only) */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)]
              uppercase tracking-wide">
              Qualification
            </label>
            <p className="mt-1 text-[14px] text-[var(--color-text)]">
              {teacher.qualification || <span className="text-[var(--color-text-muted)]">Not set</span>}
            </p>
          </div>

          {/* Classes */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)]
              uppercase tracking-wide">
              Classes Assigned
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(teacher.classes || []).length === 0 ? (
                <span className="text-[13px] text-[var(--color-text-muted)]">None assigned</span>
              ) : (
                (teacher.classes || []).map(c => (
                  <span key={c} className="text-[12px] px-2 py-0.5 rounded-full
                    bg-[#1a6b4a18] text-[#1a6b4a] font-medium">
                    {c}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Staff roles */}
          {(teacher.staff_roles || []).length > 0 && (
            <div>
              <label className="text-[11px] font-semibold text-[var(--color-text-muted)]
                uppercase tracking-wide">
                Staff Responsibilities
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {teacher.staff_roles.map(r => (
                  <span key={r} className="text-[12px] px-2 py-0.5 rounded-full
                    bg-[#2563eb18] text-[#2563eb] font-medium">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)]
              uppercase tracking-wide">
              Bio
            </label>
            {editing ? (
              <textarea rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-bg)] text-[13px] text-[var(--color-text)] resize-none"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Write a short bio about yourself…" />
            ) : (
              <p className="mt-1 text-[14px] text-[var(--color-text)] leading-relaxed">
                {teacher.bio || <span className="text-[var(--color-text-muted)]">No bio yet</span>}
              </p>
            )}
          </div>

          {/* Achievements */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)]
              uppercase tracking-wide">
              Achievements
            </label>
            {editing ? (
              <>
                <textarea rows={4}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[13px] text-[var(--color-text)] resize-none"
                  value={form.achievements}
                  onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))}
                  placeholder="One achievement per line e.g.&#10;Best Teacher Award 2024&#10;Class Teacher of S4A" />
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Enter one achievement per line
                </p>
              </>
            ) : (
              <ul className="mt-1 space-y-1">
                {(teacher.achievements || []).length === 0 ? (
                  <li className="text-[13px] text-[var(--color-text-muted)]">None listed</li>
                ) : (
                  teacher.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-text)]">
                      <Award size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                      {a}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Save button */}
          {editing && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2 rounded-lg border border-[var(--color-border)]
                  text-[13px] text-[var(--color-text-muted)]">
                Cancel
              </button>
              <button onClick={saveProfile} disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-[13px] font-medium
                  flex items-center justify-center gap-2"
                style={{ background: '#1a6b4a', opacity: saving ? 0.7 : 1 }}>
                <Save size={13} />
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status card */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6"
        style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
            Availability Status
          </h2>
          <button
            onClick={() => { setEditStatus(e => !e); setError('') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border
              border-[var(--color-border)] text-[12px] text-[var(--color-text-muted)]
              hover:text-[var(--color-text)] transition-colors">
            {editStatus ? <X size={13} /> : <Edit2 size={13} />}
            {editStatus ? 'Cancel' : 'Update'}
          </button>
        </div>

        {editStatus ? (
          <div className="space-y-4">
            {/* Status selector */}
            <div>
              <label className="text-[12px] text-[var(--color-text-muted)] mb-2 block">
                Current Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setStatusForm(f => ({ ...f, status: opt.value }))}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                    style={{
                      background: statusForm.status === opt.value ? opt.color + '18' : 'transparent',
                      borderColor: statusForm.status === opt.value ? opt.color : 'var(--color-border)',
                      color: statusForm.status === opt.value ? opt.color : 'var(--color-text-muted)'
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                Note (optional)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                value={statusForm.status_note}
                onChange={e => setStatusForm(f => ({ ...f, status_note: e.target.value }))}
                placeholder="e.g. Attending workshop in Kampala" />
            </div>

            <div>
              <label className="text-[12px] text-[var(--color-text-muted)] mb-1 block">
                Until (optional)
              </label>
              <input type="date"
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-bg)] text-[13px] text-[var(--color-text)]"
                value={statusForm.status_until}
                onChange={e => setStatusForm(f => ({ ...f, status_until: e.target.value }))} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditStatus(false)}
                className="flex-1 py-2 rounded-lg border border-[var(--color-border)]
                  text-[13px] text-[var(--color-text-muted)]">
                Cancel
              </button>
              <button onClick={saveStatus} disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-[13px] font-medium"
                style={{ background: '#1a6b4a', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Update Status'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={teacher?.status} />
              {teacher?.status_note && (
                <span className="text-[13px] text-[var(--color-text-muted)]">
                  {teacher.status_note}
                </span>
              )}
            </div>
            {teacher?.status_until && (
              <p className="text-[12px] text-[var(--color-text-muted)]">
                Expected back: {new Date(teacher.status_until).toLocaleDateString('en-UG', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Staff reports — read only */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6"
        style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-[var(--color-text-muted)]" />
          <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
            Reports from School Administration
          </h2>
        </div>

        {reportsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#1a6b4a]/20 border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">No reports have been written about you yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map(r => {
              const color = categoryColor(r.category)
              return (
                <div key={r.id}
                  className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
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
                  <div className="text-[13.5px] font-semibold text-[var(--color-text)]">
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
      </div>
    </div>
  )
}