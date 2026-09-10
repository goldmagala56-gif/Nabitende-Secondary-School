import { useState, useEffect } from 'react'
import { Users, Search, ChevronDown, User } from 'lucide-react'
import api from '../../api'

function attendanceColor(pct) {
  if (pct === null || pct === undefined) return '#6b7280'
  if (pct >= 90) return '#16a34a'
  if (pct >= 75) return '#f59e0b'
  return '#dc2626'
}

function AttendanceBadge({ pct }) {
  const color = attendanceColor(pct)
  return (
    <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color + '18', color }}>
      {pct !== null && pct !== undefined ? `${pct}%` : 'No data'}
    </span>
  )
}

function GenderBadge({ gender }) {
  const male   = { bg: '#2563eb12', color: '#2563eb' }
  const female = { bg: '#db277712', color: '#db2777' }
  const style  = gender?.toLowerCase() === 'female' ? female : male
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: style.bg, color: style.color }}>
      {gender || 'N/A'}
    </span>
  )
}

export default function TeacherClassList() {
  const [students, setStudents]       = useState([])
  const [classes, setClasses]         = useState([])
  const [selectedClass, setSelected]  = useState('')
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [expanded, setExpanded]       = useState(null)

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (selectedClass) loadClass(selectedClass)
  }, [selectedClass])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/teachers/me/students')
      setClasses(res.data.classes || [])
      setStudents(res.data.students || [])
      if (res.data.classes?.length) setSelected(res.data.classes[0])
    } catch {
      setError('Failed to load class list.')
    } finally {
      setLoading(false)
    }
  }

  async function loadClass(className) {
    setLoading(true)
    setSearch('')
    setExpanded(null)
    try {
      const res = await api.get(`/teachers/me/students?class=${encodeURIComponent(className)}`)
      setStudents(res.data.students || [])
    } catch {
      setError('Failed to load class.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(search.toLowerCase())
  )

  const present  = students.filter(s => parseFloat(s.attendance_pct) >= 75).length
  const at_risk  = students.filter(s => s.attendance_pct !== null && parseFloat(s.attendance_pct) < 75).length
  const no_data  = students.filter(s => s.attendance_pct === null).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Class List</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          Students in your assigned classes
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {/* Class selector + search */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Class dropdown */}
        <div className="relative">
          <select
            value={selectedClass}
            onChange={e => setSelected(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-[var(--color-border)]
              bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] font-medium
              cursor-pointer focus:outline-none"
            style={{ minWidth: 140 }}>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2
              text-[var(--color-text-muted)] pointer-events-none" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg
          border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Search size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-[13px] text-[var(--color-text)]
              placeholder:text-[var(--color-text-muted)] outline-none"
            placeholder="Search by name or admission no…"
            value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Count badge */}
        <div className="px-3 py-2 rounded-lg bg-[#1a6b4a12] border border-[#1a6b4a20]">
          <span className="text-[13px] font-semibold text-[#1a6b4a]">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Attendance summary cards */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
            <div className="text-[22px] font-bold text-[#16a34a]">{present}</div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Good attendance</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">≥ 75%</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
            <div className="text-[22px] font-bold text-[#dc2626]">{at_risk}</div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">At risk</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Below 75%</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
            <div className="text-[22px] font-bold text-[#6b7280]">{no_data}</div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">No records</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Not yet marked</div>
          </div>
        </div>
      )}

      {/* Student list */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
        style={{ boxShadow: 'var(--shadow-sm)' }}>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {search ? 'No students match your search.' : 'No students in this class yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[40px_1fr_140px_80px_100px_120px]
              gap-3 px-5 py-3 border-b border-[var(--color-border)]">
              <div />
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Name
              </div>
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Admission No.
              </div>
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Gender
              </div>
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Attendance
              </div>
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Days Present
              </div>
            </div>

            {/* Student rows */}
            <div className="divide-y divide-[var(--color-border)]">
              {filtered.map((s, i) => {
                const initials = s.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                const isOpen   = expanded === s.id
                const pct      = s.attendance_pct !== null ? parseFloat(s.attendance_pct) : null

                return (
                  <div key={s.id}>
                    {/* Main row */}
                    <div
                      onClick={() => setExpanded(isOpen ? null : s.id)}
                      className="grid grid-cols-[40px_1fr_auto] lg:grid-cols-[40px_1fr_140px_80px_100px_120px]
                        gap-3 px-5 py-3.5 items-center cursor-pointer
                        hover:bg-[var(--color-bg)] transition-colors">

                      {/* Avatar */}
                      <div>
                        {s.photo_url ? (
                          <img src={s.photo_url} alt={s.full_name}
                            className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center
                            text-[12px] font-bold text-white"
                            style={{ background: '#1a6b4a' }}>
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div>
                        <div className="text-[13px] font-semibold text-[var(--color-text)]">
                          {i + 1}. {s.full_name}
                        </div>
                        {/* Mobile only — show admission + attendance inline */}
                        <div className="lg:hidden flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            {s.admission_number}
                          </span>
                          <AttendanceBadge pct={pct} />
                        </div>
                      </div>

                      {/* Desktop only columns */}
                      <div className="hidden lg:block text-[13px] text-[var(--color-text-muted)]">
                        {s.admission_number}
                      </div>
                      <div className="hidden lg:block">
                        <GenderBadge gender={s.gender} />
                      </div>
                      <div className="hidden lg:block">
                        <AttendanceBadge pct={pct} />
                      </div>
                      <div className="hidden lg:block text-[13px] text-[var(--color-text-muted)]">
                        {s.days_present || 0}/{s.total_days || 0} days
                      </div>

                      {/* Expand arrow — mobile */}
                      <div className="lg:hidden text-[var(--color-text-muted)]">
                        <ChevronDown size={16}
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s' }} />
                      </div>
                    </div>

                    {/* Expanded detail — mobile only */}
                    {isOpen && (
                      <div className="lg:hidden px-5 pb-4 pt-2 bg-[var(--color-bg)]
                        border-t border-[var(--color-border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[var(--color-text-muted)]">Gender</span>
                          <GenderBadge gender={s.gender} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[var(--color-text-muted)]">Days Present</span>
                          <span className="text-[12px] text-[var(--color-text)]">
                            {s.days_present || 0} / {s.total_days || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[var(--color-text-muted)]">Days Absent</span>
                          <span className="text-[12px] text-[var(--color-text)]">
                            {s.days_absent || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[var(--color-text-muted)]">Late Arrivals</span>
                          <span className="text-[12px] text-[var(--color-text)]">
                            {s.days_late || 0}
                          </span>
                        </div>
                        {s.subjects?.length > 0 && (
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[12px] text-[var(--color-text-muted)]">Subjects</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {s.subjects.map(sub => (
                                <span key={sub}
                                  className="text-[11px] px-2 py-0.5 rounded-full
                                    bg-[#1a6b4a12] text-[#1a6b4a]">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}