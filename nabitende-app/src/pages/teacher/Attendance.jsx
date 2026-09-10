import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Clock, Save, ChevronDown } from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'

const STATUS = ['present', 'absent', 'late']

const statusStyle = {
  present: { bg: 'bg-green-100 border-green-300 text-green-700', icon: CheckCircle2, label: 'Present' },
  absent:  { bg: 'bg-red-100 border-red-300 text-red-700',       icon: XCircle,      label: 'Absent'  },
  late:    { bg: 'bg-amber-100 border-amber-300 text-amber-700', icon: Clock,        label: 'Late'    },
}

export default function TeacherAttendance() {
  const [classes,        setClasses]        = useState([])
  const [classesLoading, setClassesLoading]  = useState(true)
  const [selectedClass,  setSelectedClass]  = useState('')
  const [date,           setDate]           = useState(new Date().toISOString().split('T')[0])
  const [students,       setStudents]       = useState([])
  const [register,       setRegister]       = useState({})
  const [alreadySaved,   setAlreadySaved]   = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [submitted,      setSubmitted]      = useState(false)
  const [saving,         setSaving]         = useState(false)

  // Cache: stores { "S.3A_2026-06-23": { s1: 'present', ... } }
  const cache = useRef({})

  // Load this teacher's assigned classes once on mount
  useEffect(() => {
    api.get('/teachers/me/classes')
      .then(res => {
        const list = res.data.classes || []
        setClasses(list)
        if (list.length) setSelectedClass(list[0])
      })
      .catch(err => console.error(err))
      .finally(() => setClassesLoading(false))
  }, [])

  // Runs every time class OR date changes (skip until a class is selected)
  useEffect(() => {
    if (!selectedClass) return
    loadAttendance()
  }, [selectedClass, date])

  async function loadAttendance() {
    const key = `${selectedClass}_${date}`
    setSubmitted(false)

    // If we already have this in cache, use it instantly
    if (cache.current[key] !== undefined) {
      setRegister(cache.current[key].register)
      setAlreadySaved(cache.current[key].saved)
      return
    }

    // Otherwise fetch students and existing attendance in parallel
    setLoading(true)
    setRegister({})
    setAlreadySaved(false)

    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get('/teachers/me/students', { params: { class: selectedClass } }),
        api.get('/attendance', { params: { class: selectedClass, date } })
      ])

      const fetchedStudents   = studentsRes.data.students    || []
      const fetchedAttendance = attendanceRes.data.attendance || []

      setStudents(fetchedStudents)

      if (fetchedAttendance.length > 0) {
        // Pre-fill register with existing records
        const existing = {}
        fetchedAttendance.forEach(r => {
          existing[r.student_id] = r.status
        })
        setRegister(existing)
        setAlreadySaved(true)
        cache.current[key] = { register: existing, saved: true }
      } else {
        setRegister({})
        setAlreadySaved(false)
        cache.current[key] = { register: {}, saved: false }
      }

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function mark(studentId, status) {
    setRegister(r => {
      const updated = { ...r, [studentId]: status }
      const key = `${selectedClass}_${date}`
      if (cache.current[key]) {
        cache.current[key].register = updated
      }
      return updated
    })
    setSubmitted(false)
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status:     register[s.id] || 'absent',
      }))

      await api.post('/attendance', {
        class_name: selectedClass,
        date,
        records,
      })

      const key = `${selectedClass}_${date}`
      const saved = {}
      records.forEach(r => { saved[r.student_id] = r.status })
      cache.current[key] = { register: saved, saved: true }

      setAlreadySaved(true)
      setSubmitted(true)

    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save attendance.')
    } finally {
      setSaving(false)
    }
  }

  const studentIds   = students.map(s => s.id)
  const markedCount  = studentIds.filter(id => register[id] !== undefined).length
  const presentCount = studentIds.filter(id => register[id] === 'present').length
  const absentCount  = studentIds.filter(id => register[id] === 'absent').length
  const lateCount    = studentIds.filter(id => register[id] === 'late').length

  if (classesLoading) {
    return (
      <PageShell title="Mark Attendance" subtitle="Select a class and mark each student's status">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
            border-t-[#1a6b4a] rounded-full animate-spin" />
        </div>
      </PageShell>
    )
  }

  if (!classes.length) {
    return (
      <PageShell title="Mark Attendance" subtitle="Select a class and mark each student's status">
        <SectionCard title="No classes assigned">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            You don't have any classes allocated yet. Ask an admin to assign
            you to a class before marking attendance.
          </p>
        </SectionCard>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Mark Attendance"
      subtitle="Select a class and mark each student's status"
    >
      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold
            text-[var(--color-text-muted)]">
            Class
          </label>
          <div className="relative">
            <select value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl
                border-2 border-[var(--color-border)] bg-white
                text-[11px] text-[var(--color-text)]
                focus:outline-none focus:border-[#1a6b4a] transition-all">
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={17} className="absolute left-9.5 top-1/2
              -translate-y-1/2 text-[var(--color-text-muted)]
              pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold
            text-[var(--color-text-muted)]">
            Date
          </label>
          <input type="date" value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border-2
              border-[var(--color-border)] bg-white text-[13px]
              text-[var(--color-text)]
              focus:outline-none focus:border-[#1a6b4a] transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold
            text-[var(--color-text-muted)]">
            Quick mark
          </label>
          <button
            onClick={() => {
              const all = {}
              students.forEach(s => { all[s.id] = 'present' })
              setRegister(all)
              setSubmitted(false)
              const key = `${selectedClass}_${date}`
              if (cache.current[key]) {
                cache.current[key].register = all
              }
            }}
            className="px-4 py-2.5 rounded-xl border-2
              border-[var(--color-border)] bg-white text-[13px]
              font-semibold text-[var(--color-text)]
              hover:bg-[var(--color-bg)] transition-colors">
            All present
          </button>
        </div>
      </div>

      {/* Already saved banner */}
      {alreadySaved && !submitted && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl
          bg-blue-50 border border-blue-200">
          <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
          <span className="text-[13px] text-blue-700 font-medium">
            Attendance already submitted for {selectedClass} on {date}.
            You can update it below.
          </span>
        </div>
      )}

      {/* Progress bar */}
      {students.length > 0 && !submitted && (
        <SectionCard title={`${selectedClass} · ${students.length} students`}>
          <div className="flex items-center justify-between mb-2 text-[12px]">
            <span className="text-[var(--color-text-muted)]">Progress</span>
            <span className="font-semibold text-[var(--color-text)]">
              {markedCount}/{students.length} marked
            </span>
          </div>
          <div className="w-full h-2.5 bg-[var(--color-border)]
            rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#1a6b4a] rounded-full transition-all"
              style={{ width: `${students.length
                ? (markedCount / students.length) * 100 : 0}%` }} />
          </div>
          <div className="flex gap-4 text-[12px]">
            <span className="text-green-600 font-medium">
              ✓ {presentCount} present
            </span>
            <span className="text-red-500 font-medium">
              ✗ {absentCount} absent
            </span>
            <span className="text-amber-600 font-medium">
              ◷ {lateCount} late
            </span>
          </div>
        </SectionCard>
      )}

      {/* Student register */}
      <SectionCard title={`Register — ${selectedClass}`} noPadding>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center justify-center
            py-12 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100
              flex items-center justify-center">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h3 className="text-[16px] font-semibold
              text-[var(--color-text)]">
              Attendance submitted!
            </h3>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {selectedClass} · {date} · {presentCount} present,
              {absentCount} absent, {lateCount} late
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
              }}
              className="mt-2 px-5 py-2.5 rounded-xl border-2
                border-[var(--color-border)] text-[13px] font-semibold
                hover:bg-[var(--color-bg)] transition-colors">
              Mark another class
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {students.map((student, i) => {
              const current = register[student.id]
              return (
                <div key={student.id}
                  className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-[#1a6b4a]/10
                    flex items-center justify-center text-[11px]
                    font-bold text-[#1a6b4a] flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold
                      text-[var(--color-text)] truncate">
                      {student.full_name}
                    </div>
                    <div className="text-[11px]
                      text-[var(--color-text-muted)]">
                      {student.admission_number}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {STATUS.map(status => {
                      const s      = statusStyle[status]
                      const Icon   = s.icon
                      const active = current === status
                      return (
                        <button key={status}
                          onClick={() => mark(student.id, status)}
                          className={`flex items-center gap-1.5 px-2.5
                            py-1.5 rounded-lg border-2 text-[11px]
                            font-semibold transition-all ${active
                              ? s.bg
                              : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                            }`}>
                          <Icon size={13} />
                          <span className="hidden sm:inline">
                            {s.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Submit button */}
      {!submitted && !loading && students.length > 0 && (
        <div className="flex justify-end">
          <button onClick={handleSubmit}
            disabled={markedCount < students.length || saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl
              bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[14px]
              font-semibold transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed">
            <Save size={16} />
            {saving
              ? 'Saving...'
              : `${alreadySaved ? 'Update' : 'Submit'} register (${markedCount}/${students.length})`
            }
          </button>
        </div>
      )}
    </PageShell>
  )
}