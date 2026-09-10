import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Mail, Phone, GraduationCap,
  MessageSquare, X, BookOpen, Briefcase, Pencil,
  Star, TrendingUp, Plus, Trash2, Camera, FileText, Send
} from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'

const SUGGESTED_ROLES = [
  'Teacher', 'Class Teacher', 'Head of Department',
  'Director of Studies', 'Bursar', 'Deputy Head Teacher',
  'Head Teacher', 'Dormitory Warden', 'Welfare Teacher',
  'Cook', 'Librarian', 'Sports Master', 'Sports Mistress',
  'Counsellor', 'School Nurse', 'Security Officer',
]

const REPORT_CATEGORIES = [
  { value: 'general',      label: 'General',      color: '#6b7280' },
  { value: 'performance',  label: 'Performance',  color: '#2563eb' },
  { value: 'incident',     label: 'Incident',     color: '#dc2626' },
  { value: 'commendation', label: 'Commendation', color: '#16a34a' },
]

function categoryColor(cat) {
  return REPORT_CATEGORIES.find(c => c.value === cat)?.color || '#6b7280'
}

export default function TeacherProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMsgForm, setShowMsgForm] = useState(false)
  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const [editingRole, setEditingRole] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState([])
  const [savingRole, setSavingRole] = useState(false)
  const [roleInput, setRoleInput] = useState('')

  const [editingPhoto, setEditingPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')

  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')

  const [editingPotential, setEditingPotential] = useState(false)
  const [potentialText, setPotentialText] = useState('')

  const [newAchievement, setNewAchievement] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Staff Reports
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportForm, setReportForm] = useState({ title: '', body: '', category: 'general' })
  const [savingReport, setSavingReport] = useState(false)

  useEffect(() => {
    loadTeacher()
    loadReports()
  }, [id])

  async function loadTeacher() {
    setLoading(true)
    try {
      const res = await api.get(`/teachers/${id}`)
      const t = res.data.teacher
      setTeacher(t)
      setSelectedRoles(t.staff_roles?.length ? t.staff_roles : [t.staff_role || 'Teacher'])
      setPhotoUrl(t.photo_url || '')
      setBioText(t.bio || '')
      setPotentialText(t.potential_notes || '')
    } catch (err) {
      console.error('Failed to load teacher:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadReports() {
    setReportsLoading(true)
    try {
      const res = await api.get(`/teachers/${id}/reports`)
      setReports(res.data.reports || [])
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setReportsLoading(false)
    }
  }

  async function handleSaveRole() {
  if (selectedRoles.length === 0) {
    alert('Please select at least one role.')
    return
  }
  setSavingRole(true)
  try {
    const res = await api.patch(`/teachers/${id}/role`, { staff_roles: selectedRoles })
    setTeacher(res.data.teacher)
    setEditingRole(false)
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to update role.')
  } finally {
    setSavingRole(false)
  }
}

  async function saveProfileField(fields) {
    setSavingProfile(true)
    try {
      const res = await api.patch(`/teachers/${id}/profile`, fields)
      setTeacher(res.data.teacher)
      return true
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save changes.')
      return false
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSavePhoto() {
    const ok = await saveProfileField({ photo_url: photoUrl })
    if (ok) setEditingPhoto(false)
  }

  async function handleSaveBio() {
    const ok = await saveProfileField({ bio: bioText })
    if (ok) setEditingBio(false)
  }

  async function handleSavePotential() {
    const ok = await saveProfileField({ potential_notes: potentialText })
    if (ok) setEditingPotential(false)
  }

  async function handleAddAchievement() {
    if (!newAchievement.trim()) return
    const updated = [...(teacher.achievements || []), newAchievement.trim()]
    const ok = await saveProfileField({ achievements: updated })
    if (ok) setNewAchievement('')
  }

  async function handleRemoveAchievement(index) {
    const updated = (teacher.achievements || []).filter((_, i) => i !== index)
    await saveProfileField({ achievements: updated })
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    setSending(true)
    try {
      await api.post('/messages', {
        to_id: teacher.user_id,
        subject: msgSubject,
        body: msgBody,
      })
      setSent(true)
      setMsgBody('')
      setMsgSubject('')
      setTimeout(() => {
        setShowMsgForm(false)
        setSent(false)
      }, 1500)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  async function handleWriteReport(e) {
    e.preventDefault()
    if (!reportForm.title.trim() || !reportForm.body.trim()) return
    setSavingReport(true)
    try {
      const res = await api.post(`/teachers/${id}/reports`, reportForm)
      setReports(prev => [res.data.report, ...prev])
      setReportForm({ title: '', body: '', category: 'general' })
      setShowReportModal(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save report.')
    } finally {
      setSavingReport(false)
    }
  }

  async function handleDeleteReport(reportId) {
    if (!confirm('Delete this report? This cannot be undone.')) return
    try {
      await api.delete(`/teachers/${id}/reports/${reportId}`)
      setReports(prev => prev.filter(r => r.id !== reportId))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete report.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
          border-t-[#1a6b4a] rounded-full animate-spin" />
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="text-center py-16">
        <p className="text-[15px] font-semibold text-[var(--color-text)]">Teacher not found</p>
      </div>
    )
  }

  

  return (
    <PageShell title={teacher.full_name} subtitle="Teacher profile">
      <button
        onClick={() => navigate('/admin/teachers')}
        className="flex items-center gap-1.5 text-[13px] font-medium
          text-[var(--color-text-muted)] hover:text-[var(--color-text)]
          transition-colors mb-2">
        <ChevronLeft size={16} />
        Back to teachers
      </button>

      <SectionCard>
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            {teacher.photo_url ? (
              <img src={teacher.photo_url} alt={teacher.full_name}
                className="w-28 h-36 rounded-xl object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-28 h-36 rounded-xl bg-[#1a6b4a]/10
                flex flex-col items-center justify-center gap-2
                text-[#1a6b4a]">
                <span className="text-[22px] font-bold">
                  {teacher.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">No photo</span>
              </div>
            )}
            <button
              onClick={() => setEditingPhoto(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white
                border border-[var(--color-border)] flex items-center justify-center
                shadow-sm hover:bg-[var(--color-bg)]">
              <Camera size={13} className="text-[var(--color-text-muted)]" />
            </button>
          </div>
    {/* rest of info stays same */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
              {teacher.full_name}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                <Mail size={13} /> {teacher.email}
              </span>
              {teacher.phone && (
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                  <Phone size={13} /> {teacher.phone}
                </span>
              )}
              {teacher.qualification && (
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                  <GraduationCap size={13} /> {teacher.qualification}
                </span>
              )}
            </div>
            <span className={`inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              teacher.account_active
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {teacher.account_active ? 'Active' : 'Deactivated'}
            </span>
          </div>
          <button
            onClick={() => setShowMsgForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-[#1a6b4a] hover:bg-[#15573c] text-white
              text-[13px] font-semibold transition-colors flex-shrink-0">
            <MessageSquare size={15} />
            Message
          </button>
        </div>

        {editingPhoto && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <PhotoUpload
              teacherId={id}
              onSaved={(url) => {
                setTeacher(t => ({ ...t, photo_url: url }))
                setEditingPhoto(false)
              }}
              onCancel={() => setEditingPhoto(false)}
            />
          </div>
        )}
      </SectionCard>

      {/* Staff role / responsibility */}
      <SectionCard title="Staff responsibility">
        {editingRole ? (
          <div className="space-y-4">

            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={roleInput}
                onChange={e => setRoleInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = roleInput.trim()
                    if (val && !selectedRoles.includes(val)) {
                      setSelectedRoles(prev => [...prev, val])
                    }
                    setRoleInput('')
                  }
                }}
                placeholder="Type a role and press Enter..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border-2
                  border-[var(--color-border)] bg-white text-[14px]
                  focus:outline-none focus:border-[#1a6b4a] transition-all"
              />
              <button type="button"
                onClick={() => {
                  const val = roleInput.trim()
                  if (val && !selectedRoles.includes(val)) {
                    setSelectedRoles(prev => [...prev, val])
                  }
                  setRoleInput('')
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1a6b4a] text-white
                  text-[13px] font-semibold">
                Add
              </button>
            </div>

            {/* Status management — admin only */}
<div className="mt-6 pt-6 border-t border-[var(--color-border)]">
  <h3 className="text-[13px] font-semibold text-[var(--color-text)] mb-3">
    Availability Status
  </h3>
  <div className="flex flex-wrap gap-2 mb-3">
    {['Present', 'On Leave', 'Sick', 'Training', 'Suspended'].map(s => {
      const colors = {
        Present: '#16a34a', 'On Leave': '#f59e0b',
        Sick: '#dc2626', Training: '#2563eb', Suspended: '#7c3aed'
      }
      const color = colors[s]
      const active = teacher?.status === s
      return (
        <button key={s}
          onClick={async () => {
            try {
              await api.patch(`/teachers/${teacher.id}/status`, { status: s })
              setTeacher(prev => ({ ...prev, status: s }))
            } catch { }
          }}
          className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
          style={{
            background:  active ? color + '18' : 'transparent',
            borderColor: active ? color : 'var(--color-border)',
            color:       active ? color : 'var(--color-text-muted)'
          }}>
          {s}
        </button>
      )
    })}
  </div>
</div>

            {/* Selected roles */}
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(r => (
                  <span key={r}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      text-[12px] font-semibold bg-[#7c3aed] text-white">
                    {r}
                    <button type="button"
                      onClick={() => setSelectedRoles(prev => prev.filter(x => x !== r))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ROLES.filter(r => !selectedRoles.includes(r)).map(r => (
                  <button key={r} type="button"
                    onClick={() => setSelectedRoles(prev => [...prev, r])}
                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold
                      border-2 border-[var(--color-border)]
                      text-[var(--color-text-muted)] hover:border-[#7c3aed]
                      hover:text-[#7c3aed] transition-all">
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSaveRole} disabled={savingRole}
                className="px-4 py-2.5 rounded-xl bg-[#1a6b4a] text-white
                  text-[13px] font-semibold disabled:opacity-60">
                {savingRole ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditingRole(false)
                  setSelectedRoles(teacher.staff_roles?.length
                    ? teacher.staff_roles
                    : [teacher.staff_role || 'Teacher'])
                  setRoleInput('')
                }}
                className="px-4 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                  text-[13px] font-semibold text-[var(--color-text)]">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(teacher.staff_roles?.length
                ? teacher.staff_roles
                : [teacher.staff_role || 'Teacher']
              ).map(r => (
                <span key={r} className="flex items-center gap-1.5 text-[12px] font-semibold
                  px-3 py-1.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed]">
                  <Briefcase size={13} />
                  {r}
                </span>
              ))}
            </div>
            <button onClick={() => setEditingRole(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold
                text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex-shrink-0">
              <Pencil size={13} />
              Change
            </button>
          </div>
        )}
      </SectionCard>
      {/* About / Bio */}
      <SectionCard title="About">
        {editingBio ? (
          <div className="space-y-3">
            <textarea rows={4} value={bioText}
              onChange={e => setBioText(e.target.value)}
              placeholder="A short bio — background, teaching philosophy, years of experience..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2
                border-[var(--color-border)] bg-white text-[14px]
                resize-none focus:outline-none focus:border-[#1a6b4a]" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingBio(false); setBioText(teacher.bio || '') }}
                className="px-4 py-2 rounded-xl border-2 border-[var(--color-border)] text-[12px] font-semibold text-[var(--color-text)]">
                Cancel
              </button>
              <button onClick={handleSaveBio} disabled={savingProfile}
                className="px-4 py-2 rounded-xl bg-[#1a6b4a] text-white text-[12px] font-semibold disabled:opacity-60">
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed flex-1">
              {teacher.bio || 'No bio added yet.'}
            </p>
            <button onClick={() => setEditingBio(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold
                text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex-shrink-0">
              <Pencil size={13} />
              Edit
            </button>
          </div>
        )}
      </SectionCard>

      {/* Merits & Achievements */}
      <SectionCard title="Merits & achievements">
        <div className="space-y-2 mb-3">
          {(teacher.achievements || []).length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-muted)]">No achievements recorded yet.</p>
          ) : (
            teacher.achievements.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-xl
                bg-amber-50 border border-amber-200">
                <span className="flex items-center gap-2 text-[13px] text-amber-800">
                  <Star size={14} className="text-amber-500 flex-shrink-0" />
                  {a}
                </span>
                <button onClick={() => handleRemoveAchievement(i)}
                  className="text-amber-600 hover:text-red-600 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newAchievement}
            onChange={e => setNewAchievement(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddAchievement() }}
            placeholder="e.g. Best Teacher Award 2025"
            className="flex-1 px-3.5 py-2 rounded-xl border-2
              border-[var(--color-border)] bg-white text-[13px] focus:outline-none" />
          <button onClick={handleAddAchievement} disabled={savingProfile}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a6b4a]
              text-white text-[12px] font-semibold disabled:opacity-60">
            <Plus size={14} />
            Add
          </button>
        </div>
      </SectionCard>

      {/* Growth & Potential */}
      <SectionCard title="Growth & potential">
        {editingPotential ? (
          <div className="space-y-3">
            <textarea rows={4} value={potentialText}
              onChange={e => setPotentialText(e.target.value)}
              placeholder="Admin notes on this teacher's growth areas, leadership potential, readiness for promotion..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2
                border-[var(--color-border)] bg-white text-[14px]
                resize-none focus:outline-none focus:border-[#1a6b4a]" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingPotential(false); setPotentialText(teacher.potential_notes || '') }}
                className="px-4 py-2 rounded-xl border-2 border-[var(--color-border)] text-[12px] font-semibold text-[var(--color-text)]">
                Cancel
              </button>
              <button onClick={handleSavePotential} disabled={savingProfile}
                className="px-4 py-2 rounded-xl bg-[#1a6b4a] text-white text-[12px] font-semibold disabled:opacity-60">
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-start gap-2 text-[13px] text-[var(--color-text-muted)] leading-relaxed flex-1">
              <TrendingUp size={14} className="text-[#2563eb] flex-shrink-0 mt-0.5" />
              {teacher.potential_notes || 'No growth notes added yet.'}
            </p>
            <button onClick={() => setEditingPotential(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold
                text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex-shrink-0">
              <Pencil size={13} />
              Edit
            </button>
          </div>
        )}
      </SectionCard>

      {/* Staff Reports */}
      <SectionCard title="Staff reports">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] text-[var(--color-text-muted)]">
            Dated reports and notes written about this teacher — visible to them.
          </p>
          <button onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
              bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[12px] font-semibold
              flex-shrink-0 transition-colors">
            <FileText size={14} />
            Write report
          </button>
        </div>

        {reportsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#1a6b4a]/20 border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">No reports written yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map(r => {
              const color = categoryColor(r.category)
              return (
                <div key={r.id}
                  className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
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
                    <button onClick={() => handleDeleteReport(r.id)}
                      className="text-[var(--color-text-muted)] hover:text-red-600 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Subjects taught">
        {(teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects : [teacher.subject]).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {(teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects : [teacher.subject]).map(s => (
              <span key={s} className="flex items-center gap-1.5 text-[12px] font-semibold
                px-3 py-1.5 rounded-full bg-[#1a6b4a]/10 text-[#1a6b4a]">
                <BookOpen size={13} /> {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[var(--color-text-muted)]">No subjects assigned.</p>
        )}
      </SectionCard>

      <SectionCard title="Classes assigned">
        {teacher.classes && teacher.classes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {teacher.classes.map(cls => (
              <span key={cls} className="text-[12px] font-medium px-3 py-1.5 rounded-full
                bg-[var(--color-bg)] border border-[var(--color-border)]
                text-[var(--color-text-muted)]">
                {cls}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[var(--color-text-muted)]">No classes assigned.</p>
        )}
      </SectionCard>

      {/* Message modal */}
      {showMsgForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
            p-6 w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-[var(--color-text)]">
                Message {teacher.full_name}
              </h3>
              <button onClick={() => setShowMsgForm(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X size={18} />
              </button>
            </div>
            {sent ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare size={22} className="text-green-600" />
                </div>
                <p className="text-[14px] font-semibold text-[var(--color-text)]">Message sent!</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <input type="text" value={msgSubject}
                  onChange={e => setMsgSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px] focus:outline-none" />
                <textarea required rows={4} value={msgBody}
                  onChange={e => setMsgBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    resize-none focus:outline-none" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowMsgForm(false)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                      text-[13px] font-semibold text-[var(--color-text)]">
                    Cancel
                  </button>
                  <button type="submit" disabled={sending}
                    className="flex-1 py-2.5 rounded-xl bg-[#1a6b4a] text-white
                      text-[13px] font-semibold disabled:opacity-60">
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Write report modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
            p-6 w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-[var(--color-text)]">
                Write report — {teacher.full_name}
              </h3>
              <button onClick={() => setShowReportModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleWriteReport} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {REPORT_CATEGORIES.map(c => (
                    <button key={c.value} type="button"
                      onClick={() => setReportForm(f => ({ ...f, category: c.value }))}
                      className="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                      style={{
                        background: reportForm.category === c.value ? c.color + '18' : 'transparent',
                        borderColor: reportForm.category === c.value ? c.color : 'var(--color-border)',
                        color: reportForm.category === c.value ? c.color : 'var(--color-text-muted)'
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
                <input type="text" required value={reportForm.title}
                  onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Term 2 performance review"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#1a6b4a] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                  Report
                </label>
                <textarea required rows={5} value={reportForm.body}
                  onChange={e => setReportForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write the details of this report..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] resize-none focus:outline-none focus:border-[#1a6b4a] transition-all" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    text-[13px] font-semibold text-[var(--color-text)]">
                  Cancel
                </button>
                <button type="submit" disabled={savingReport}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[13px] font-semibold
                    disabled:opacity-60">
                  <Send size={14} />
                  {savingReport ? 'Saving...' : 'Save report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function PhotoUpload({ teacherId, onSaved, onCancel }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [base64, setBase64] = useState(null)
  const [uploading, setUploading] = useState(false)

  function handlePick(e) {
    const f = e.target.files[0]
    if (!f) return

    // Reject files over 2MB
    if (f.size > 2 * 1024 * 1024) {
      alert('Image too large. Please choose a photo under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
      setBase64(reader.result)
    }
    reader.readAsDataURL(f)
  }

  async function handleUpload() {
    if (!base64) return
    setUploading(true)
    try {
      const res = await api.patch(`/teachers/${teacherId}/profile`, {
        photo_url: base64,
      })
      onSaved(res.data.teacher.photo_url)
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        className="hidden"
      />

      {preview ? (
        <img src={preview} alt="Preview"
          className="w-32 h-40 rounded-xl object-cover border border-[var(--color-border)]" />
      ) : (
        <div className="w-32 h-40 rounded-xl bg-[var(--color-bg)]
          border-2 border-dashed border-[var(--color-border)]
          flex flex-col items-center justify-center gap-2
          text-[var(--color-text-muted)]">
          <Camera size={28} />
          <span className="text-[11px]">Passport size</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button type="button"
          onClick={() => inputRef.current.click()}
          className="px-4 py-2 rounded-xl border-2 border-[var(--color-border)]
            text-[13px] font-semibold text-[var(--color-text)]
            hover:bg-[var(--color-bg)] transition-colors">
          {preview ? 'Change photo' : 'Choose from device'}
        </button>
        {preview && (
          <button type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-[#1a6b4a] text-white
              text-[13px] font-semibold disabled:opacity-60 transition-colors">
            {uploading ? 'Saving...' : 'Save photo'}
          </button>
        )}
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl border-2 border-[var(--color-border)]
            text-[13px] font-semibold text-[var(--color-text-muted)]">
          Cancel
        </button>
      </div>
    </div>
  )
}