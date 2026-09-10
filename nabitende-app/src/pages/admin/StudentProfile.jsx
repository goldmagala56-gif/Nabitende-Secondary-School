import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, GraduationCap, Camera,
  Pencil, Star, Plus, Trash2, X, Briefcase,
  TrendingUp, TrendingDown, CheckCircle, XCircle,
  AlertCircle, DollarSign, BookOpen, Calendar
} from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'

const SUGGESTED_ROLES = [
  'Head Prefect', 'Deputy Head Prefect', 'Class Monitor',
  'Class Captain', 'Games Captain', 'Library Prefect',
  'Dining Hall Prefect', 'Dormitory Prefect', 'Environment Prefect',
  'Chapel Prefect', 'Health Prefect', 'Entertainment Prefect',
]

function gradeFromMark(mark) {
  if (mark >= 80) return { grade: 'D1', color: 'text-green-700', bg: 'bg-green-50 border-green-200' }
  if (mark >= 70) return { grade: 'D2', color: 'text-green-600', bg: 'bg-green-50 border-green-200' }
  if (mark >= 60) return { grade: 'C3', color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200'  }
  if (mark >= 55) return { grade: 'C4', color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200'  }
  if (mark >= 50) return { grade: 'C5', color: 'text-blue-500',  bg: 'bg-blue-50 border-blue-200'  }
  if (mark >= 45) return { grade: 'C6', color: 'text-yellow-700',bg: 'bg-yellow-50 border-yellow-200'}
  if (mark >= 40) return { grade: 'P7', color: 'text-orange-600',bg: 'bg-orange-50 border-orange-200'}
  if (mark >= 35) return { grade: 'P8', color: 'text-orange-700',bg: 'bg-orange-50 border-orange-200'}
  return { grade: 'F9', color: 'text-red-700', bg: 'bg-red-50 border-red-200' }
}

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [student,        setStudent]        = useState(null)
  const [grades,         setGrades]         = useState([])
  const [attendance,     setAttendance]     = useState([])
  const [fees,           setFees]           = useState([])
  const [loading,        setLoading]        = useState(true)
  const [savingProfile,  setSavingProfile]  = useState(false)

  const [editingBio,     setEditingBio]     = useState(false)
  const [bioText,        setBioText]        = useState('')

  const [editingRoles,   setEditingRoles]   = useState(false)
  const [selectedRoles,  setSelectedRoles]  = useState([])
  const [roleInput,      setRoleInput]      = useState('')
  const [savingRoles,    setSavingRoles]    = useState(false)

  const [newAchievement, setNewAchievement] = useState('')
  const [editingPhoto,   setEditingPhoto]   = useState(false)
  const [photoPreview,   setPhotoPreview]   = useState(null)
  const [photoBase64,    setPhotoBase64]    = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

 const [subjectCatalog,   setSubjectCatalog]   = useState([])
const [editingSubjects,  setEditingSubjects]  = useState(false)
const [selectedSubjects, setSelectedSubjects] = useState([])
const [subjectInput,     setSubjectInput]     = useState('')
const [savingSubjects,   setSavingSubjects]   = useState(false)

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
  setLoading(true)
  try {
    const [stuRes, gradesRes, attRes, feesRes, subjRes] = await Promise.all([
      api.get(`/students/${id}`),
      api.get('/grades', { params: { student_id: id } }),
      api.get('/attendance', { params: { student_id: id } }),
      api.get('/fees', { params: { student_id: id } }),
      api.get('/subjects'),
    ])
    const s = stuRes.data.student
    setStudent(s)
    setBioText(s.bio || '')
    setSelectedRoles(s.student_roles || [])
    setSelectedSubjects(s.subjects || [])
    setGrades(gradesRes.data.grades || [])
    setAttendance(attRes.data.attendance || [])
    setFees(feesRes.data.fees || [])
    setSubjectCatalog([...new Set((subjRes.data.subjects || []).map(sub => sub.name))])
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

async function addSubject(val) {
  val = val.trim()
  if (!val || selectedSubjects.includes(val)) return

  setSelectedSubjects(prev => [...prev, val])

  const existsInCatalog = subjectCatalog.some(
    c => c.toLowerCase() === val.toLowerCase()
  )
  if (!existsInCatalog) {
    try {
      await api.post('/subjects', { name: val, category: 'General' })
      setSubjectCatalog(prev => [...prev, val])
    } catch (err) {
      // Non-fatal — subject still applies to this student even if catalog save fails
      console.error('Could not add to subject catalog:', err.response?.data?.error)
    }
  }
}

  async function saveProfileField(fields) {
    setSavingProfile(true)
    try {
      const res = await api.patch(`/students/${id}/profile`, fields)
      setStudent(res.data.student)
      return true
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save.')
      return false
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSaveBio() {
    const ok = await saveProfileField({ bio: bioText })
    if (ok) setEditingBio(false)
  }

  async function handleSaveRoles() {
    setSavingRoles(true)
    try {
      const res = await api.patch(`/students/${id}/profile`, { student_roles: selectedRoles })
      setStudent(res.data.student)
      setEditingRoles(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save roles.')
    } finally {
      setSavingRoles(false)
    }
  }

  async function handleSaveSubjects() {
  setSavingSubjects(true)
  try {
    const res = await api.patch(`/students/${id}/profile`, { subjects: selectedSubjects })
    setStudent(res.data.student)
    setEditingSubjects(false)
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save subjects.')
  } finally {
    setSavingSubjects(false)
  }
}

  async function handleAddAchievement() {
    if (!newAchievement.trim()) return
    const updated = [...(student.achievements || []), newAchievement.trim()]
    const ok = await saveProfileField({ achievements: updated })
    if (ok) setNewAchievement('')
  }

  async function handleRemoveAchievement(index) {
    const updated = (student.achievements || []).filter((_, i) => i !== index)
    await saveProfileField({ achievements: updated })
  }

  function handlePickPhoto(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) { alert('Photo must be under 2MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { setPhotoPreview(reader.result); setPhotoBase64(reader.result) }
    reader.readAsDataURL(f)
  }

  async function handleSavePhoto() {
    if (!photoBase64) return
    setUploadingPhoto(true)
    try {
      const res = await api.patch(`/students/${id}/profile`, { photo_url: photoBase64 })
      setStudent(res.data.student)
      setEditingPhoto(false)
      setPhotoPreview(null)
      setPhotoBase64(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // ── Computed stats ──────────────────────────────────────────
  const avgMark = grades.length
    ? Math.round(grades.reduce((s, g) => s + Number(g.mark), 0) / grades.length)
    : null

  const presentCount = attendance.filter(a => a.status === 'present').length
  const totalDays    = attendance.length
  const attendancePct = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : null

  const latestFee = fees.sort((a, b) =>
    b.academic_year - a.academic_year || b.term?.localeCompare(a.term)
  )[0]

  // Group grades by subject for performance table
  const gradesBySubject = grades.reduce((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = []
    acc[g.subject].push(g)
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#1a6b4a]/20 border-t-[#1a6b4a] rounded-full animate-spin" />
    </div>
  )

  if (!student) return (
    <div className="text-center py-16">
      <p className="text-[15px] font-semibold text-[var(--color-text)]">Student not found</p>
    </div>
  )

  return (
    <PageShell title={student.full_name} subtitle="Student profile">
      <button onClick={() => navigate('/admin/students')}
        className="flex items-center gap-1.5 text-[13px] font-medium
          text-[var(--color-text-muted)] hover:text-[var(--color-text)]
          transition-colors mb-2">
        <ChevronLeft size={16} /> Back to students
      </button>

      {/* ── Header ── */}
      <SectionCard>
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.full_name}
                className="w-28 h-36 rounded-xl object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-28 h-36 rounded-xl bg-[#7c3aed]/10
                flex flex-col items-center justify-center gap-2">
                <span className="text-[22px] font-bold text-[#7c3aed]">
                  {(student.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">No photo</span>
              </div>
            )}
            <button onClick={() => setEditingPhoto(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white
                border border-[var(--color-border)] flex items-center justify-center shadow-sm">
              <Camera size={13} className="text-[var(--color-text-muted)]" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
              {student.full_name}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                <GraduationCap size={13} /> {student.class_name}
              </span>
              <span className="text-[13px] text-[var(--color-text-muted)]">
                Adm: {student.admission_number}
              </span>
              <span className="text-[13px] text-[var(--color-text-muted)]">
                {student.gender}
              </span>
              {student.date_of_birth && (
                <span className="text-[13px] text-[var(--color-text-muted)]">
                  DOB: {new Date(student.date_of_birth).toLocaleDateString()}
                </span>
              )}
            </div>
            <span className={`inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              student.is_active
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {student.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {editingPhoto && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3">
            <input ref={inputRef} type="file" accept="image/*"
              onChange={handlePickPhoto} className="hidden" />
            {photoPreview && (
              <img src={photoPreview} alt="Preview"
                className="w-28 h-36 rounded-xl object-cover border border-[var(--color-border)]" />
            )}
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => inputRef.current.click()}
                className="px-4 py-2 rounded-xl border-2 border-[var(--color-border)]
                  text-[13px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]">
                {photoPreview ? 'Change photo' : 'Choose from device'}
              </button>
              {photoPreview && (
                <button onClick={handleSavePhoto} disabled={uploadingPhoto}
                  className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white
                    text-[13px] font-semibold disabled:opacity-60">
                  {uploadingPhoto ? 'Saving...' : 'Save photo'}
                </button>
              )}
              <button onClick={() => { setEditingPhoto(false); setPhotoPreview(null) }}
                className="px-4 py-2 rounded-xl border-2 border-[var(--color-border)]
                  text-[13px] font-semibold text-[var(--color-text-muted)]">
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickStat
          icon={<BookOpen size={16} />}
          label="Avg mark"
          value={avgMark !== null ? `${avgMark}%` : '—'}
          sub={avgMark !== null ? gradeFromMark(avgMark).grade : 'No grades yet'}
          color="#7c3aed"
        />
        <QuickStat
          icon={<Calendar size={16} />}
          label="Attendance"
          value={attendancePct !== null ? `${attendancePct}%` : '—'}
          sub={`${presentCount}/${totalDays} days`}
          color={attendancePct >= 75 ? '#1a6b4a' : '#dc2626'}
        />
        <QuickStat
          icon={<DollarSign size={16} />}
          label="Fee status"
          value={latestFee?.status ? latestFee.status.toUpperCase() : '—'}
          sub={latestFee ? `Balance: UGX ${Number(latestFee.balance).toLocaleString()}` : 'No record'}
          color={latestFee?.status === 'cleared' ? '#1a6b4a' : '#f59e0b'}
        />
        <QuickStat
          icon={<Star size={16} />}
          label="Achievements"
          value={(student.achievements || []).length}
          sub="recorded"
          color="#f59e0b"
        />
      </div>

      {/* ── Attendance summary ── */}
      <SectionCard title="Attendance record">
        {attendance.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">No attendance records yet.</p>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-3 rounded-full bg-[var(--color-bg)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1a6b4a] transition-all"
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
              <span className="text-[13px] font-semibold text-[var(--color-text)]">
                {attendancePct}%
              </span>
            </div>

            {/* Counts */}
            <div className="flex gap-4 mb-4 flex-wrap">
              {[
                { label: 'Present', status: 'present', icon: <CheckCircle size={13} />, color: 'text-green-600' },
                { label: 'Absent',  status: 'absent',  icon: <XCircle size={13} />,     color: 'text-red-600'   },
                { label: 'Late',    status: 'late',     icon: <AlertCircle size={13} />, color: 'text-yellow-600'},
              ].map(({ label, status, icon, color }) => {
                const count = attendance.filter(a => a.status === status).length
                return (
                  <div key={status} className={`flex items-center gap-1.5 text-[13px] font-semibold ${color}`}>
                    {icon} {label}: {count}
                  </div>
                )
              })}
            </div>

            {/* Warning */}
            {attendancePct < 75 && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                bg-red-50 border border-red-200 text-[12px] text-red-700 font-semibold">
                <AlertCircle size={14} />
                Attendance below 75% — intervention recommended
              </div>
            )}

            {/* Recent 10 records */}
            <div className="mt-4 space-y-1">
              <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                Recent records
              </p>
              {attendance.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center justify-between
                  text-[12px] py-1.5 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-[var(--color-text-muted)]">
                    {new Date(a.date).toLocaleDateString('en-UG', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}
                  </span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] border ${
                    a.status === 'present'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : a.status === 'late'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Academic performance ── */}
      <SectionCard title="Academic performance">
        {grades.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">No grades recorded yet.</p>
        ) : (
          <>
            {/* Overall average */}
            <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/20">
              <div className="text-center">
                <p className="text-[28px] font-bold text-[#7c3aed]">{avgMark}%</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">Overall avg</p>
              </div>
              <div>
                <span className={`text-[13px] font-bold px-3 py-1 rounded-full border ${gradeFromMark(avgMark).bg} ${gradeFromMark(avgMark).color}`}>
                  {gradeFromMark(avgMark).grade}
                </span>
                <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                  {avgMark >= 60 ? 'Performing well' : avgMark >= 45 ? 'Needs improvement' : 'At risk — urgent attention needed'}
                </p>
              </div>
            </div>

            {/* Per subject */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                By subject
              </p>
              {Object.entries(gradesBySubject).map(([subject, subGrades]) => {
                const avg = Math.round(subGrades.reduce((s, g) => s + Number(g.mark), 0) / subGrades.length)
                const { grade, bg, color } = gradeFromMark(avg)
                const best  = Math.max(...subGrades.map(g => Number(g.mark)))
                const worst = Math.min(...subGrades.map(g => Number(g.mark)))
                const trend = subGrades.length > 1
                  ? Number(subGrades[subGrades.length - 1].mark) - Number(subGrades[0].mark)
                  : null

                return (
                  <div key={subject} className="flex items-center gap-3 py-2
                    border-b border-[var(--color-border)] last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-semibold text-[var(--color-text)]">
                          {subject}
                        </span>
                        <div className="flex items-center gap-2">
                          {trend !== null && (
                            trend > 0
                              ? <TrendingUp size={13} className="text-green-500" />
                              : trend < 0
                              ? <TrendingDown size={13} className="text-red-500" />
                              : null
                          )}
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${bg} ${color}`}>
                            {grade}
                          </span>
                          <span className="text-[12px] font-semibold text-[var(--color-text)]">
                            {avg}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${avg}%`,
                            background: avg >= 60 ? '#1a6b4a' : avg >= 45 ? '#f59e0b' : '#dc2626'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Fee status ── */}
      <SectionCard title="Fee payments">
        <FeeSection studentId={id} studentName={student.full_name} />
      </SectionCard>

      {/* ── Leadership roles ── */}
      <SectionCard title="Leadership roles">
        {editingRoles ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" value={roleInput}
                onChange={e => setRoleInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = roleInput.trim()
                    if (val && !selectedRoles.includes(val))
                      setSelectedRoles(prev => [...prev, val])
                    setRoleInput('')
                  }
                }}
                placeholder="Type a role and press Enter..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border-2
                  border-[var(--color-border)] bg-white text-[14px]
                  focus:outline-none focus:border-[#7c3aed] transition-all" />
              <button type="button"
                onClick={() => {
                  const val = roleInput.trim()
                  if (val && !selectedRoles.includes(val))
                    setSelectedRoles(prev => [...prev, val])
                  setRoleInput('')
                }}
                className="px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white text-[13px] font-semibold">
                Add
              </button>
            </div>

            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(r => (
                  <span key={r} className="flex items-center gap-1.5 px-3 py-1.5
                    rounded-full text-[12px] font-semibold bg-[#7c3aed] text-white">
                    {r}
                    <button onClick={() => setSelectedRoles(prev => prev.filter(x => x !== r))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ROLES.filter(r => !selectedRoles.includes(r)).map(r => (
                  <button key={r} type="button"
                    onClick={() => setSelectedRoles(prev => [...prev, r])}
                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold
                      border-2 border-[var(--color-border)] text-[var(--color-text-muted)]
                      hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all">
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSaveRoles} disabled={savingRoles}
                className="px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white
                  text-[13px] font-semibold disabled:opacity-60">
                {savingRoles ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => {
                setEditingRoles(false)
                setSelectedRoles(student.student_roles || [])
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
              {(student.student_roles || []).length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-muted)]">No roles assigned yet.</p>
              ) : (
                student.student_roles.map(r => (
                  <span key={r} className="flex items-center gap-1.5 text-[12px] font-semibold
                    px-3 py-1.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed]">
                    <Briefcase size={13} /> {r}
                  </span>
                ))
              )}
            </div>
            <button onClick={() => setEditingRoles(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold
                text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex-shrink-0">
              <Pencil size={13} /> Edit
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── Subjects offered ── */}
<SectionCard title="Subjects offered">
  {editingSubjects ? (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" value={subjectInput}
          onChange={e => setSubjectInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSubject(subjectInput)
              setSubjectInput('')
            }
          }}
          placeholder="Type a subject and press Enter..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border-2
            border-[var(--color-border)] bg-white text-[14px]
            focus:outline-none focus:border-[#7c3aed] transition-all" />
        <button type="button"
          onClick={() => { addSubject(subjectInput); setSubjectInput('') }}
          className="px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white text-[13px] font-semibold">
          Add
        </button>
      </div>

      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSubjects.map(sub => (
            <span key={sub} className="flex items-center gap-1.5 px-3 py-1.5
              rounded-full text-[12px] font-semibold bg-[#7c3aed] text-white">
              {sub}
              <button onClick={() => setSelectedSubjects(prev => prev.filter(x => x !== sub))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
          Suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {subjectCatalog.filter(sub => !selectedSubjects.includes(sub)).map(sub => (
            <button key={sub} type="button"
              onClick={() => setSelectedSubjects(prev => [...prev, sub])}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold
                border-2 border-[var(--color-border)] text-[var(--color-text-muted)]
                hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all">
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSaveSubjects} disabled={savingSubjects}
          className="px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white
            text-[13px] font-semibold disabled:opacity-60">
          {savingSubjects ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => {
          setEditingSubjects(false)
          setSelectedSubjects(student.subjects || [])
          setSubjectInput('')
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
        {(student.subjects || []).length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">No subjects assigned yet.</p>
        ) : (
          student.subjects.map(sub => (
            <span key={sub} className="flex items-center gap-1.5 text-[12px] font-semibold
              px-3 py-1.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed]">
              <BookOpen size={13} /> {sub}
            </span>
          ))
        )}
      </div>
      <button onClick={() => setEditingSubjects(true)}
        className="flex items-center gap-1.5 text-[12px] font-semibold
          text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex-shrink-0">
        <Pencil size={13} /> Edit
      </button>
    </div>
  )}
</SectionCard>

      {/* ── Bio ── */}
      <SectionCard title="About">
        {editingBio ? (
          <div className="space-y-3">
            <textarea rows={4} value={bioText}
              onChange={e => setBioText(e.target.value)}
              placeholder="A short note about this student..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2
                border-[var(--color-border)] bg-white text-[14px]
                resize-none focus:outline-none focus:border-[#7c3aed]" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingBio(false); setBioText(student.bio || '') }}
                className="px-4 py-2 rounded-xl border-2 border-[var(--color-border)]
                  text-[12px] font-semibold text-[var(--color-text)]">
                Cancel
              </button>
              <button onClick={handleSaveBio} disabled={savingProfile}
                className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white
                  text-[12px] font-semibold disabled:opacity-60">
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed flex-1">
              {student.bio || 'No bio added yet.'}
            </p>
            <button onClick={() => setEditingBio(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold
                text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex-shrink-0">
              <Pencil size={13} /> Edit
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── Achievements ── */}
      <SectionCard title="Merits & achievements">
        <div className="space-y-2 mb-3">
          {(student.achievements || []).length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-muted)]">No achievements recorded yet.</p>
          ) : (
            student.achievements.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2.5
                rounded-xl bg-amber-50 border border-amber-200">
                <span className="flex items-center gap-2 text-[13px] text-amber-800">
                  <Star size={14} className="text-amber-500 flex-shrink-0" /> {a}
                </span>
                <button onClick={() => handleRemoveAchievement(i)}
                  className="text-amber-600 hover:text-red-600">
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
            placeholder="e.g. Best Student 2025"
            className="flex-1 px-3.5 py-2 rounded-xl border-2
              border-[var(--color-border)] bg-white text-[13px] focus:outline-none" />
          <button onClick={handleAddAchievement} disabled={savingProfile}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed]
              text-white text-[12px] font-semibold disabled:opacity-60">
            <Plus size={14} /> Add
          </button>
        </div>
      </SectionCard>
    </PageShell>
  )
}

function FeeSection({ studentId, studentName }) {
  const [fees,         setFees]         = useState([])
  const [history,      setHistory]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [showPay,      setShowPay]      = useState(null)
  const [showDiscount, setShowDiscount] = useState(null)
  const [saving,       setSaving]       = useState(false)

  const [feeForm, setFeeForm] = useState({
    term: 'Term 2', academic_year: '2026', amount: ''
  })
  const [payForm, setPayForm] = useState({
  amount: '', method: 'Cash', reference: '', notes: '', account_detail: ''
})
  const [discForm, setDiscForm] = useState({
    discount: '', discount_reason: ''
  })

  useEffect(() => { loadFees() }, [studentId])

  async function loadFees() {
    setLoading(true)
    try {
      const [feesRes, histRes] = await Promise.all([
        api.get('/fees', { params: { student_id: studentId } }),
        api.get(`/fees/history/${studentId}`),
      ])
      setFees(feesRes.data.fees || [])
      setHistory(histRes.data.payments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveFee(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/fees/student', {
        student_id:    parseInt(studentId),
        term:          feeForm.term,
        academic_year: feeForm.academic_year,
        amount:        Number(feeForm.amount),
      })
      setShowForm(false)
      setFeeForm({ term: 'Term 2', academic_year: '2026', amount: '' })
      loadFees()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save fee.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePay(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/fees/payment', {
        student_id:    parseInt(studentId),
        amount:        Number(payForm.amount),
        method:        payForm.method,
        reference:     payForm.reference,
        notes:         payForm.notes,
        account_detail: payForm.account_detail,
        term:          showPay.term,
        academic_year: showPay.academic_year,
      })
      setShowPay(null)
      setPayForm({ amount: '', method: 'Cash', reference: '', notes: '', account_detail: '' })
      loadFees()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record payment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDiscount(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/fees/${showDiscount.id}/discount`, {
        discount:        Number(discForm.discount),
        discount_reason: discForm.discount_reason,
      })
      setShowDiscount(null)
      setDiscForm({ discount: '', discount_reason: '' })
      loadFees()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply discount.')
    } finally {
      setSaving(false)
    }
  }

  const TERMS   = ['Term 1', 'Term 2', 'Term 3']
  const METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque']

  return (
    <SectionCard title="Fee payments">
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
            bg-[#7c3aed] text-white text-[12px] font-semibold">
          <Plus size={13} />
          {showForm ? 'Cancel' : 'Set / edit fee'}
        </button>
      </div>

      {/* Set fee form */}
      {showForm && (
        <form onSubmit={handleSaveFee}
          className="mb-5 p-4 rounded-xl border-2 border-[#7c3aed]/20 bg-[#7c3aed]/5 space-y-3">
          <p className="text-[12px] font-semibold text-[#7c3aed]">
            Create or update fee record
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">Term</label>
              <select value={feeForm.term}
                onChange={e => setFeeForm(f => ({ ...f, term: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border-2 border-[var(--color-border)]
                  bg-white text-[13px] focus:outline-none focus:border-[#7c3aed]">
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">Year</label>
              <input type="text" value={feeForm.academic_year}
                onChange={e => setFeeForm(f => ({ ...f, academic_year: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border-2 border-[var(--color-border)]
                  bg-white text-[13px] focus:outline-none focus:border-[#7c3aed]" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">Amount (UGX)</label>
              <input type="number" required value={feeForm.amount}
                onChange={e => setFeeForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 850000"
                className="w-full px-3 py-2 rounded-xl border-2 border-[var(--color-border)]
                  bg-white text-[13px] focus:outline-none focus:border-[#7c3aed]" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white
                text-[12px] font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : 'Save fee record'}
            </button>
          </div>
        </form>
      )}

      {/* Fee records */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-[#7c3aed]/20 border-t-[#7c3aed] rounded-full animate-spin" />
        </div>
      ) : fees.filter(f => f.id).length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-muted)] mb-4">
          No fee records yet. Click "Set / edit fee" to create one.
        </p>
      ) : (
        <div className="space-y-3 mb-5">
          {fees.filter(f => f.id).map((f) => (
            <div key={f.id} className="p-4 rounded-xl border border-[var(--color-border)]
              bg-[var(--color-bg)] space-y-2">

              {/* Header row */}
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[var(--color-text)]">
                  {f.term} — {f.academic_year}
                </p>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  f.status === 'cleared'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : f.status === 'partial'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {f.status}
                </span>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                  <p className="text-[11px] text-[var(--color-text-muted)]">Total fee</p>
                  <p className="text-[13px] font-bold text-[var(--color-text)]">
                    UGX {Number(f.amount).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                  <p className="text-[11px] text-[var(--color-text-muted)]">Paid</p>
                  <p className="text-[13px] font-bold text-green-600">
                    UGX {Number(f.paid).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                  <p className="text-[11px] text-[var(--color-text-muted)]">Balance</p>
                  <p className="text-[13px] font-bold text-red-600">
                    UGX {Number(f.balance).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Discount info */}
              {Number(f.discount) > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                  bg-blue-50 border border-blue-200 text-[12px] text-blue-700">
                  <AlertCircle size={13} />
                  Discount: UGX {Number(f.discount).toLocaleString()}
                  {f.discount_reason && ` — ${f.discount_reason}`}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {f.status !== 'cleared' && (
                  <button onClick={() => {
                    setShowPay(f)
                    setPayForm({ amount: '', method: 'Cash', reference: '', notes: '' })
                  }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                      bg-[#1a6b4a] text-white text-[12px] font-semibold">
                    <Plus size={12} /> Record payment
                  </button>
                )}
                <button onClick={() => {
                  setShowDiscount(f)
                  setDiscForm({ discount: '', discount_reason: '' })
                }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                    border-2 border-blue-200 text-blue-600 text-[12px] font-semibold">
                  <Pencil size={12} /> Apply discount
                </button>
                <button onClick={() => {
                  setShowForm(true)
                  setFeeForm({
                    term: f.term,
                    academic_year: f.academic_year,
                    amount: f.amount
                  })
                }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                    border-2 border-[var(--color-border)] text-[var(--color-text-muted)]
                    text-[12px] font-semibold">
                  <Pencil size={12} /> Edit amount
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment history */}
      {history.length > 0 && (
        <div>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-start justify-between gap-3
                py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className="text-[12px] font-semibold text-[var(--color-text)]">
                    UGX {Number(h.amount).toLocaleString()}
                    <span className="text-[var(--color-text-muted)] font-normal ml-2">
                      via {h.method}
                    </span>
                  </p>
                  {h.account_detail && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {h.method}: {h.account_detail}
                    </p>
                  )}
                  {h.reference && (
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Ref: {h.reference}
                    </p>
                  )}
                  {h.notes && (
                    <p className="text-[11px] text-blue-600 mt-0.5">{h.notes}</p>
                  )}
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">
                  {new Date(h.created_at).toLocaleDateString('en-UG', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment modal */}
      {showPay && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
            p-6 w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[var(--color-text)]">Record payment</h3>
              <button onClick={() => setShowPay(null)}>
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-bg)] mb-4 text-[13px]">
              <p className="font-semibold text-[var(--color-text)]">
                {showPay.term} — {showPay.academic_year}
              </p>
              <p className="text-[var(--color-text-muted)]">
                Balance: <span className="text-red-600 font-semibold">
                  UGX {Number(showPay.balance).toLocaleString()}
                </span>
              </p>
            </div>
            <form onSubmit={handlePay} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                  Amount (UGX)
                </label>
                <input type="number" required value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 250000"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#7c3aed]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">Payment method</label>
                <select value={payForm.method}
                  onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#7c3aed]">
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
              <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                {payForm.method === 'Mobile Money' ? 'Mobile Money number'
                  : payForm.method === 'Bank Transfer' ? 'Bank account / branch'
                  : payForm.method === 'Cheque' ? 'Cheque number'
                  : 'Account detail (optional)'}
              </label>
              <input type="text" value={payForm.account_detail}
                onChange={e => setPayForm(f => ({ ...f, account_detail: e.target.value }))}
                placeholder={payForm.method === 'Mobile Money' ? 'e.g. 0772-XXX-XXX' : 'e.g. Stanbic - 01-XXXXXXX'}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                  bg-white text-[14px] focus:outline-none focus:border-[#7c3aed]" />
            </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                  Reference / receipt no.
                </label>
                <input type="text" value={payForm.reference}
                  onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="e.g. MM-TXN-12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#7c3aed]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                  Notes (optional)
                </label>
                <input type="text" value={payForm.notes}
                  onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Paid by father at bursar's office"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#7c3aed]" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowPay(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    text-[13px] font-semibold text-[var(--color-text)]">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a6b4a] text-white
                    text-[13px] font-semibold disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount modal */}
      {showDiscount && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
            p-6 w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[var(--color-text)]">Apply discount</h3>
              <button onClick={() => setShowDiscount(null)}>
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-bg)] mb-4 text-[13px]">
              <p className="font-semibold text-[var(--color-text)]">
                {showDiscount.term} — {showDiscount.academic_year}
              </p>
              <p className="text-[var(--color-text-muted)]">
                Current fee: UGX {Number(showDiscount.amount).toLocaleString()}
              </p>
              {Number(showDiscount.discount) > 0 && (
                <p className="text-blue-600 mt-0.5">
                  Existing discount: UGX {Number(showDiscount.discount).toLocaleString()}
                  {showDiscount.discount_reason && ` — ${showDiscount.discount_reason}`}
                </p>
              )}
            </div>
            <form onSubmit={handleDiscount} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                  Discount amount (UGX)
                </label>
                <input type="number" required value={discForm.discount}
                  onChange={e => setDiscForm(f => ({ ...f, discount: e.target.value }))}
                  placeholder="e.g. 100000"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#7c3aed]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                  Reason
                </label>
                <input type="text" required value={discForm.discount_reason}
                  onChange={e => setDiscForm(f => ({ ...f, discount_reason: e.target.value }))}
                  placeholder="e.g. Academic merit, Bursary, Staff child"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#7c3aed]" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowDiscount(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    text-[13px] font-semibold text-[var(--color-text)]">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#7c3aed] text-white
                    text-[13px] font-semibold disabled:opacity-60">
                  {saving ? 'Saving...' : 'Apply discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function QuickStat({ icon, label, value, sub, color }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border)]
      bg-[var(--color-surface)] flex items-start gap-3"
      style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-[18px] font-bold text-[var(--color-text)]">{value}</p>
        <p className="text-[11px] font-semibold text-[var(--color-text-muted)]">{label}</p>
        <p className="text-[11px] text-[var(--color-text-muted)]">{sub}</p>
      </div>
    </div>
  )
}