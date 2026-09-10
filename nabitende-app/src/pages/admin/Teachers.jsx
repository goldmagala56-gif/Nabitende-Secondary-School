import { useState, useEffect } from 'react'
import {
  GraduationCap, Plus, X, Mail, Phone,
  BookOpen, ChevronDown, MessageSquare, Trash2
} from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import StatCard from '../../components/StatCard'
import { useNavigate } from 'react-router-dom'
import {
   Pencil
} from 'lucide-react'

const SUBJECTS = [
  'Mathematics', 'English', 'Physics', 'Chemistry',
  'Biology', 'History', 'Geography', 'CRE',
  'Computer Studies', 'Agriculture', 'Art', 'Music',
  'Physical Education', 'Kiswahili'
]

export default function AdminTeachers() {
  const [teachers,     setTeachers]     = useState([])
  const [classes,      setClasses]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [msgTeacher,   setMsgTeacher]   = useState(null)
  const [msgBody,      setMsgBody]      = useState('')
  const [msgSubject,   setMsgSubject]   = useState('')
  const [sendingMsg,   setSendingMsg]   = useState(false)
  const [editTeacher, setEditTeacher] = useState(null)
  const [editForm,    setEditForm]    = useState(null)
  const [updating,    setUpdating]    = useState(false)
  const [msgSuccess,   setMsgSuccess]   = useState(false)
  const navigate = useNavigate()
  const [form, setForm] = useState({
  full_name: '', email: '', phone: '',
  subjects: [], classes: [],
  qualification: '', password: '',
})

  useEffect(() => {
    fetchTeachers()
    fetchClasses()
  }, [])

  async function fetchTeachers() {
    setLoading(true)
    try {
      const res = await api.get('/teachers')
      setTeachers(res.data.teachers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchClasses() {
  try {
    const res = await api.get('/students/classes')
    setClasses(res.data.classes || [])
  } catch (err) {
    console.error('Failed to load classes:', err)
    alert('Could not load class list — check your connection or contact support.')
  }
}

  function toggleClass(cls) {
    setForm(f => ({
      ...f,
      classes: f.classes.includes(cls)
        ? f.classes.filter(c => c !== cls)
        : [...f.classes, cls]
    }))
  }

  function toggleSubject(subj) {
  setForm(f => ({
    ...f,
    subjects: f.subjects.includes(subj)
      ? f.subjects.filter(s => s !== subj)
      : [...f.subjects, subj]
  }))
}

  async function handleDeactivate(teacher) {
    if (!confirm(`Deactivate ${teacher.full_name}? They will lose access to the app.`)) return
    try {
      await api.delete(`/teachers/${teacher.id}`)
      setTeachers(prev => prev.filter(t => t.id !== teacher.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to deactivate teacher.')
    }
  }

  async function handleAddTeacher(e) {
  e.preventDefault()
  if (form.subjects.length === 0) {
    alert('Please select at least one subject.')
    return
  }
  setSaving(true)
  try {
    const res = await api.post('/teachers', form)
    setTeachers(prev => [...prev, res.data.teacher])
    setShowForm(false)
    setForm({
      full_name: '', email: '', phone: '',
      subjects: [], classes: [],
      qualification: '', password: '',
    })
    alert(res.data.message)
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to add teacher.')
  } finally {
    setSaving(false)
  }
}

async function handleEditTeacher(e) {
  e.preventDefault()
  if (editForm.subjects.length === 0) {
    alert('Please select at least one subject.')
    return
  }
  setUpdating(true)
  try {
    const res = await api.put(`/teachers/${editTeacher.id}`, editForm)
    setTeachers(prev => prev.map(t =>
      t.id === editTeacher.id ? { ...t, ...res.data.teacher } : t
    ))
    setEditTeacher(null)
    setEditForm(null)
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to update teacher.')
  } finally {
    setUpdating(false)
  }
}

  async function handleSendMessage(e) {
    e.preventDefault()
    setSendingMsg(true)
    try {
      await api.post('/messages', {
        to_id:   msgTeacher.user_id,
        subject: msgSubject,
        body:    msgBody,
      })
      setMsgSuccess(true)
      setMsgBody('')
      setMsgSubject('')
      setTimeout(() => {
        setMsgTeacher(null)
        setMsgSuccess(false)
      }, 2000)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message.')
    } finally {
      setSendingMsg(false)
    }
  }

  const activeCount  = teachers.length
  const subjects     = [...new Set(teachers.map(t => t.subject))].length

  return (
    <PageShell
      title="Teachers"
      subtitle={`${activeCount} staff members · Term 2, 2026`}
      actions={
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-[#1a6b4a] hover:bg-[#15573c] text-white
            text-[13px] font-semibold transition-colors">
          <Plus size={16} />
          Add teacher
        </button>
      }
    >

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total staff"   value={activeCount} color="#1a6b4a" icon={GraduationCap} sub="active teachers"   />
        <StatCard label="Subjects"      value={subjects}    color="#2563eb" icon={BookOpen}      sub="being taught"      />
        <StatCard label="Classes"       value={classes.length} color="#f59e0b" icon={GraduationCap} sub="streams covered" />
      </div>

      {/* Add teacher form */}
      {showForm && (
        <SectionCard title="Add new teacher">
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Full name</label>
                <input type="text" required
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. Mr. Kato James"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Email address</label>
                <input type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. kato@stmarys.ac.ug"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Phone number</label>
                <input type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 0772-123-456"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Main subject</label>
                <div className="relative">
                  <div className="lg:col-span-2">
                    <label className="block text-[13px] font-semibold
                      text-[var(--color-text)] mb-2">
                      Subjects taught
                      <span className="text-[var(--color-text-muted)] font-normal ml-1">(select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(subj => (
                        <button key={subj} type="button"
                          onClick={() => toggleSubject(subj)}
                          className={`px-3 py-1.5 rounded-full text-[12px]
                            font-semibold border-2 transition-all ${
                            form.subjects.includes(subj)
                              ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                              : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                            }`}>
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>  

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Qualification</label>
                <input type="text"
                  value={form.qualification}
                  onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}
                  placeholder="e.g. B.Ed - Makerere University"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">
                  Login password
                </label>
                <input type="password" required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Set a password for this teacher"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

            </div>

            {/* Classes assigned */}
            <div>
              <label className="block text-[13px] font-semibold
                text-[var(--color-text)] mb-2">
                Assigned classes
                <span className="text-[var(--color-text-muted)]
                  font-normal ml-1">(select all that apply)</span>
              </label>
              {classes.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  No classes found. Make sure students have been enrolled with class names first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {classes.map(cls => (
                    <button key={cls} type="button"
                      onClick={() => toggleClass(cls)}
                      className={`px-3 py-1.5 rounded-full text-[12px]
                        font-semibold border-2 transition-all ${
                        form.classes.includes(cls)
                          ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                        }`}>
                      {cls}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border-2
                  border-[var(--color-border)] text-[13px]
                  font-semibold text-[var(--color-text)]
                  hover:bg-[var(--color-bg)] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#1a6b4a]
                  hover:bg-[#15573c] text-white text-[13px]
                  font-semibold transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? 'Adding...' : 'Add teacher'}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Teachers list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
            border-t-[#1a6b4a] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.length === 0 ? (
            <SectionCard>
              <div className="text-center py-10 text-[var(--color-text-muted)]
                text-[13px]">
                No teachers added yet. Click "Add teacher" to get started.
              </div>
            </SectionCard>
          ) : (
            teachers.map(teacher => (
              <div key={teacher.id}
                className="bg-[var(--color-surface)] rounded-xl
                  border border-[var(--color-border)] p-5"
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start gap-4">

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-[#1a6b4a]/10
                    flex items-center justify-center text-[15px]
                    font-bold text-[#1a6b4a] flex-shrink-0">
                    {teacher.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between
                      gap-3 flex-wrap mb-1">
                      <h3 className="text-[15px] font-semibold
                        text-[var(--color-text)]">
                        {teacher.full_name}
                      </h3>
                      <div className="flex gap-1.5 flex-wrap">
                        {(teacher.subjects || [teacher.subject]).map(s => (
                          <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full
                            bg-[#1a6b4a]/10 text-[#1a6b4a]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                      <span className="flex items-center gap-1.5
                        text-[12px] text-[var(--color-text-muted)]">
                        <Mail size={12} />
                        {teacher.email}
                      </span>
                      {teacher.phone && (
                        <span className="flex items-center gap-1.5
                          text-[12px] text-[var(--color-text-muted)]">
                          <Phone size={12} />
                          {teacher.phone}
                        </span>
                      )}
                      {teacher.qualification && (
                        <span className="flex items-center gap-1.5
                          text-[12px] text-[var(--color-text-muted)]">
                          <GraduationCap size={12} />
                          {teacher.qualification}
                        </span>
                      )}
                    </div>

                    {/* Classes */}
                    {teacher.classes && teacher.classes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {teacher.classes.map(cls => (
                          <span key={cls}
                            className="text-[11px] font-medium px-2 py-0.5
                              rounded-full bg-[var(--color-bg)]
                              border border-[var(--color-border)]
                              text-[var(--color-text-muted)]">
                            {cls}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5
                          rounded-lg border-2 border-[#1a6b4a]/30
                          text-[#1a6b4a] text-[12px] font-semibold
                          hover:bg-[#1a6b4a]/10 transition-colors">
                        <GraduationCap size={13} />
                        View profile
                      </button>
                      <button
                        onClick={() => {
                          setEditTeacher(teacher)
                          setEditForm({
                            phone:         teacher.phone || '',
                            subjects:      teacher.subjects || [teacher.subject],
                            classes:       teacher.classes || [],
                            qualification: teacher.qualification || '',
                          })
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5
                          rounded-lg border-2 border-amber-200
                          text-amber-600 text-[12px] font-semibold
                          hover:bg-amber-50 transition-colors">
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setMsgTeacher(teacher)
                          setMsgSuccess(false)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5
                          rounded-lg border-2 border-[#2563eb]/30
                          text-[#2563eb] text-[12px] font-semibold
                          hover:bg-blue-50 transition-colors">
                        <MessageSquare size={13} />
                        Send message
                      </button>
                      <button
                        onClick={() => handleDeactivate(teacher)}
                        className="flex items-center gap-1.5 px-3 py-1.5
                          rounded-lg border-2 border-red-200
                          text-red-600 text-[12px] font-semibold
                          hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                        Deactivate
                      </button>
                    </div>
                    </div>
                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}  
        {editTeacher && editForm && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
      p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      style={{ boxShadow: 'var(--shadow-md)' }}>

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
          Edit {editTeacher.full_name}
        </h3>
        <button onClick={() => { setEditTeacher(null); setEditForm(null) }}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleEditTeacher} className="space-y-4">
        <div>
          <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
            Phone
          </label>
          <input type="tel"
            value={editForm.phone}
            onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="e.g. 0772-123-456"
            className="w-full px-3.5 py-2.5 rounded-xl border-2
              border-[var(--color-border)] bg-white text-[14px]
              focus:outline-none focus:border-[#1a6b4a] transition-all" />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
            Qualification
          </label>
          <input type="text"
            value={editForm.qualification}
            onChange={e => setEditForm(f => ({ ...f, qualification: e.target.value }))}
            placeholder="e.g. B.Ed - Makerere University"
            className="w-full px-3.5 py-2.5 rounded-xl border-2
              border-[var(--color-border)] bg-white text-[14px]
              focus:outline-none focus:border-[#1a6b4a] transition-all" />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
            Subjects <span className="font-normal text-[var(--color-text-muted)]">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(subj => (
              <button key={subj} type="button"
                onClick={() => setEditForm(f => ({
                  ...f,
                  subjects: f.subjects.includes(subj)
                    ? f.subjects.filter(s => s !== subj)
                    : [...f.subjects, subj]
                }))}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-2 transition-all ${
                  editForm.subjects.includes(subj)
                    ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                {subj}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
            Classes <span className="font-normal text-[var(--color-text-muted)]">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {classes.map(cls => (
              <button key={cls} type="button"
                onClick={() => setEditForm(f => ({
                  ...f,
                  classes: f.classes.includes(cls)
                    ? f.classes.filter(c => c !== cls)
                    : [...f.classes, cls]
                }))}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-2 transition-all ${
                  editForm.classes.includes(cls)
                    ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button"
            onClick={() => { setEditTeacher(null); setEditForm(null) }}
            className="flex-1 py-2.5 rounded-xl border-2
              border-[var(--color-border)] text-[13px] font-semibold
              text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={updating}
            className="flex-1 py-2.5 rounded-xl bg-[#1a6b4a]
              hover:bg-[#15573c] text-white text-[13px] font-semibold
              transition-colors disabled:opacity-60">
            {updating ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}                  

      {/* Message modal */}
      {msgTeacher && (
        <div className="fixed inset-0 bg-black/40 z-50
          flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl
            border border-[var(--color-border)] p-6 w-full max-w-md"
            style={{ boxShadow: 'var(--shadow-md)' }}>

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
                  Message {msgTeacher.full_name}
                </h3>
                <p className="text-[12px] text-[var(--color-text-muted)]
                  mt-0.5">
                  {msgTeacher.email}
                </p>
              </div>
              <button onClick={() => setMsgTeacher(null)}
                className="text-[var(--color-text-muted)]
                  hover:text-[var(--color-text)] transition-colors">
                <X size={18} />
              </button>
            </div>

            {msgSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100
                  flex items-center justify-center">
                  <MessageSquare size={22} className="text-green-600" />
                </div>
                <p className="text-[14px] font-semibold
                  text-[var(--color-text)]">
                  Message sent!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold
                    text-[var(--color-text)] mb-1.5">Subject</label>
                  <input type="text"
                    value={msgSubject}
                    onChange={e => setMsgSubject(e.target.value)}
                    placeholder="e.g. S.4 marks submission"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2
                      border-[var(--color-border)] bg-white text-[14px]
                      focus:outline-none focus:border-[#1a6b4a]
                      focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold
                    text-[var(--color-text)] mb-1.5">Message</label>
                  <textarea required rows={4}
                    value={msgBody}
                    onChange={e => setMsgBody(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2
                      border-[var(--color-border)] bg-white text-[14px]
                      focus:outline-none focus:border-[#1a6b4a]
                      focus:ring-4 focus:ring-[#1a6b4a]/10
                      transition-all resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button"
                    onClick={() => setMsgTeacher(null)}
                    className="flex-1 py-2.5 rounded-xl border-2
                      border-[var(--color-border)] text-[13px]
                      font-semibold text-[var(--color-text)]
                      hover:bg-[var(--color-bg)] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={sendingMsg}
                    className="flex-1 py-2.5 rounded-xl bg-[#1a6b4a]
                      hover:bg-[#15573c] text-white text-[13px]
                      font-semibold transition-colors
                      disabled:opacity-60">
                    {sendingMsg ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </PageShell>
  )
}