import { useState, useEffect, useRef } from 'react'
import { Save, CheckCircle2, TrendingUp, ChevronDown } from 'lucide-react'
import api from '../../api'
import { computeGrade, gradeColor } from '../../data/academicsData'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'

const EXAMS = ['Bot 1', 'Bot 2', 'Final Exam']
const CURRENT_TERM = 'Term 2'
const CURRENT_YEAR = '2026'

const COLUMNS = [
  { label: '#',            span: 'col-span-1' },
  { label: 'Student name', span: 'col-span-5' },
  { label: 'Mark /100',    span: 'col-span-3' },
  { label: 'Grade',        span: 'col-span-2' },
  { label: 'Points',       span: 'col-span-1' },
]

function Dropdown({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-[var(--color-text-muted)]">
        {label}
      </label>
      <div className="relative">
        <select value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl
            border-2 border-[var(--color-border)] bg-white
            text-[13px] text-[var(--color-text)] min-w-[180px]
            focus:outline-none focus:border-[#1a6b4a] transition-all">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2
          -translate-y-1/2 text-[var(--color-text-muted)]
          pointer-events-none" />
      </div>
    </div>
  )
}

function PillGroup({ label, value, options, onChange, activeColor = '#1a6b4a' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} type="button"
            onClick={() => onChange(o)}
            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium
              border-2 transition-colors"
            style={value === o
              ? { background: activeColor, borderColor: activeColor, color: '#fff' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TeacherGrades() {
  const [classes,        setClasses]        = useState([])
  const [subjectCatalog, setSubjectCatalog]  = useState([])
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedExam,    setSelectedExam]    = useState(EXAMS[0])
  const [selectedSubject, setSelectedSubject] = useState('')

  const [students,  setStudents]  = useState([])
  const [marks,     setMarks]     = useState({})
  const [loading,   setLoading]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const inputRefs = useRef({})

  useEffect(() => { loadOptions() }, [])

  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedExam) return
    loadStudentsAndExistingMarks()
    setSubmitted(false)
  }, [selectedClass, selectedSubject, selectedExam])

  async function loadOptions() {
    try {
      const [classRes, subjRes] = await Promise.all([
        api.get('/students/classes'),
        api.get('/subjects'),
      ])
      const classList = classRes.data.classes || []
      const subjectList = [...new Set((subjRes.data.subjects || []).map(s => s.name))]

      setClasses(classList)
      setSubjectCatalog(subjectList)
      if (classList.length > 0) setSelectedClass(classList[0])
      if (subjectList.length > 0) setSelectedSubject(subjectList[0])
    } catch (err) {
      console.error(err)
    }
  }

  // Loads the class roster AND any marks already recorded for this exact
  // class + subject + exam + term, so re-opening the page doesn't wipe prior entries.
  async function loadStudentsAndExistingMarks() {
    setLoading(true)
    try {
      const [studentsRes, gradesRes] = await Promise.all([
        api.get('/students', { params: { class: selectedClass } }),
        api.get('/grades', {
          params: {
            class_name:    selectedClass,
            subject:       selectedSubject,
            exam_type:     selectedExam,
            term:          CURRENT_TERM,
            academic_year: CURRENT_YEAR,
          },
        }),
      ])

      const roster = studentsRes.data.students || []
      const existing = gradesRes.data.grades || []

      const prefilled = {}
      existing.forEach(g => { prefilled[g.student_id] = Number(g.mark) })

      setStudents(roster)
      setMarks(prefilled)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleMark(id, val) {
    const num = val === '' ? '' : Math.min(100, Math.max(0, Number(val)))
    setMarks(m => ({ ...m, [id]: num }))
    setSubmitted(false)
  }

  function handleKeyDown(e, index) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const next = students[index + 1]
    if (next) inputRefs.current[next.id]?.focus()
  }

  async function handleSave() {
    setSaving(true)
    try {
      const records = students
        .filter(s => marks[s.id] !== '' && marks[s.id] !== undefined)
        .map(s => ({ student_id: s.id, mark: marks[s.id] }))

      await api.post('/grades', {
        class_name:    selectedClass,
        subject:       selectedSubject,
        exam_type:     selectedExam,
        term:          CURRENT_TERM,
        academic_year: CURRENT_YEAR,
        records,
      })
      setSubmitted(true)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save grades.')
    } finally {
      setSaving(false)
    }
  }

  const filledMarks = students
    .map(s => marks[s.id])
    .filter(v => v !== '' && v !== undefined)

  const filledCount = filledMarks.length
  const classAverage = filledCount > 0
    ? Math.round(filledMarks.reduce((a, b) => a + Number(b), 0) / filledCount)
    : null

  if (classes.length === 0) {
    return (
      <PageShell title="Enter Grades" subtitle="Select class, subject and exam then enter marks out of 100">
        <SectionCard>
          <p className="text-[13px] text-[var(--color-text-muted)] text-center py-6">
            No classes found yet. Add students to a class before entering grades.
          </p>
        </SectionCard>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Enter Grades"
      subtitle="Select class, subject and exam then enter marks out of 100"
    >
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <Dropdown label="Class"   value={selectedClass}   options={classes}        onChange={setSelectedClass} />
        <Dropdown label="Subject" value={selectedSubject} options={subjectCatalog} onChange={setSelectedSubject} />
        <PillGroup label="Exam" value={selectedExam} options={EXAMS} onChange={setSelectedExam} />
      </div>

      {/* Subject + progress + average tags */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[12px] font-semibold px-3 py-1.5
          rounded-full bg-[#1a6b4a]/10 text-[#1a6b4a]">
          {selectedSubject} · {selectedClass} · {selectedExam}
        </span>
        <span className="text-[12px] text-[var(--color-text-muted)]">
          {filledCount}/{students.length} marks entered
        </span>
        {classAverage !== null && (
          <span className="flex items-center gap-1.5 text-[12px] font-semibold
            px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <TrendingUp size={13} /> Class average: {classAverage}%
          </span>
        )}
      </div>

      {/* Marks table */}
      {submitted ? (
        <SectionCard>
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100
              flex items-center justify-center">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--color-text)]">
              Marks saved!
            </h3>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {selectedClass} · {selectedSubject} · {selectedExam}
            </p>
            <button onClick={() => setSubmitted(false)}
              className="mt-2 px-5 py-2.5 rounded-xl border-2
                border-[var(--color-border)] text-[13px] font-semibold
                hover:bg-[var(--color-bg)] transition-colors">
              Back to marks
            </button>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title={`${selectedClass} — ${students.length} students`}
          noPadding
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
                border-t-[#1a6b4a] rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-muted)] text-center py-10">
              No students found in {selectedClass}.
            </p>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 px-5 py-3
                border-b border-[var(--color-border)]
                bg-[var(--color-bg)]">
                {COLUMNS.map(col => (
                  <div key={col.label} className={`text-[11px] font-semibold
                    text-[var(--color-text-muted)] uppercase tracking-wide ${col.span}`}>
                    {col.label}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-[var(--color-border)]">
                {students.map((s, i) => {
                  const val      = marks[s.id] ?? ''
                  const computed = val !== '' ? computeGrade(Number(val)) : null
                  const gc       = computed ? gradeColor(computed.grade) : null
                  return (
                    <div key={s.id}
                      className="grid grid-cols-12 items-center
                        px-5 py-3 hover:bg-[var(--color-bg)]
                        transition-colors">
                      <span className={`${COLUMNS[0].span} text-[12px] text-[var(--color-text-muted)]`}>
                        {i + 1}
                      </span>
                      <div className={COLUMNS[1].span}>
                        <div className="text-[13px] font-semibold text-[var(--color-text)]">
                          {s.full_name}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          {s.admission_number}
                        </div>
                      </div>
                      <div className={COLUMNS[2].span}>
                        <input
                          ref={el => { inputRefs.current[s.id] = el }}
                          type="number" min="0" max="100"
                          value={val}
                          onChange={e => handleMark(s.id, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, i)}
                          placeholder="—"
                          className="w-20 px-3 py-1.5 rounded-lg border-2
                            border-[var(--color-border)] bg-[var(--color-bg)]
                            text-[13px] text-[var(--color-text)]
                            focus:outline-none focus:border-[#1a6b4a]
                            transition-all"
                        />
                      </div>
                      <div className={COLUMNS[3].span}>
                        {computed && (
                          <span className={`text-[12px] font-bold
                            px-2.5 py-1 rounded-lg ${gc.bg} ${gc.text}`}>
                            {computed.grade}
                          </span>
                        )}
                      </div>
                      <div className={COLUMNS[4].span}>
                        {computed && (
                          <span className="text-[12px] text-[var(--color-text-muted)]">
                            {computed.points}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </SectionCard>
      )}

      {/* Save button */}
      {!submitted && !loading && students.length > 0 && (
        <div className="flex justify-end">
          <button onClick={handleSave}
            disabled={filledCount === 0 || saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl
              bg-[#1a6b4a] hover:bg-[#15573c] text-white
              text-[14px] font-semibold transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed">
            <Save size={16} />
            {saving ? 'Saving...' : `Save marks (${filledCount}/${students.length})`}
          </button>
        </div>
      )}
    </PageShell>
  )
}