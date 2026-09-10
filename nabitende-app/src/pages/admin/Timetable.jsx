import { useState, useEffect } from 'react'
import { MapPin, User, Pencil, X, Trash2, Settings, Plus, GripVertical, Users, LayoutGrid } from 'lucide-react'
import api from '../../api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const SUBJECT_COLORS = {
  Mathematics: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  English:     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Physics:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Chemistry:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
  Biology:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  default:     { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200' },
}

function colorsFor(subject) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default
}

export default function AdminTimetable() {
  const [viewMode, setViewMode] = useState('class') // 'class' | 'teacher'

  // ── Class view state ─────────────────────────────────────────
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDay,   setSelectedDay]   = useState('Monday')
  const [periods, setPeriods] = useState([])
  const [slots,   setSlots]   = useState([])
  const [loading, setLoading] = useState(true)

  // ── Teacher view state ───────────────────────────────────────
  const [teachers, setTeachers] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [teacherDay, setTeacherDay] = useState('Monday')
  const [teacherEntries, setTeacherEntries] = useState([])
  const [teacherLoading, setTeacherLoading] = useState(false)

  // Slot edit modal — works from either view. class_name/day_of_week
  // are captured at open-time so the same modal works regardless of
  // which view triggered it.
  const [editSlot, setEditSlot] = useState(null)
  const [slotForm, setSlotForm] = useState({ subject: '', teacher_id: '', room: '' })
  const [saving, setSaving] = useState(false)

  // Structure builder modal
  const [structureModal, setStructureModal] = useState(false)
  const [periodForm, setPeriodForm] = useState({ label: '', time_range: '', is_break: false })
  const [savingPeriod, setSavingPeriod] = useState(false)

  useEffect(() => { loadClasses() }, [])
  useEffect(() => { if (selectedClass) loadPeriods() }, [selectedClass])
  useEffect(() => { if (selectedClass) loadSlots() }, [selectedClass, selectedDay])
  useEffect(() => { loadTeachers() }, [])
  useEffect(() => {
    if (viewMode === 'teacher' && selectedTeacherId) loadTeacherSchedule()
  }, [viewMode, selectedTeacherId])

  async function loadClasses() {
    try {
      const res = await api.get('/students/classes')
      const list = res.data.classes || []
      setClasses(list)
      if (list.length > 0) setSelectedClass(list[0])
      else setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  async function loadPeriods() {
    setLoading(true)
    try {
      const res = await api.get('/timetable/periods', { params: { class_name: selectedClass } })
      setPeriods(res.data.periods || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSlots() {
    try {
      const res = await api.get('/timetable/slots', {
        params: { class_name: selectedClass, day: selectedDay },
      })
      setSlots(res.data.slots || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function loadTeachers() {
    try {
      const res = await api.get('/teachers')
      const list = res.data.teachers || []
      setTeachers(list)
      if (list.length > 0 && !selectedTeacherId) setSelectedTeacherId(list[0].id)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadTeacherSchedule() {
    setTeacherLoading(true)
    try {
      const res = await api.get(`/timetable/teacher/${selectedTeacherId}`)
      setTeacherEntries(res.data.entries || [])
    } catch (err) {
      console.error(err)
      setTeacherEntries([])
    } finally {
      setTeacherLoading(false)
    }
  }

  function getSlot(periodId) {
    return slots.find(s => s.period_id === periodId)
  }

  // ── Slot editing (shared between both views) ────────────────
  function openEdit(period, ctx) {
    // ctx = { class_name, day_of_week, entry } — from teacher view.
    // From class view, ctx is omitted and we fall back to selectedClass/selectedDay.
    const class_name  = ctx?.class_name  ?? selectedClass
    const day_of_week = ctx?.day_of_week ?? selectedDay
    const entry = ctx ? ctx.entry : getSlot(period.id)

    setEditSlot({ period, entry, class_name, day_of_week })
    setSlotForm({
      subject:    entry?.subject    || '',
      teacher_id: entry?.teacher_id || (viewMode === 'teacher' ? selectedTeacherId : ''),
      room:       entry?.room       || '',
    })
  }

  function refreshAfterSlotChange() {
    if (viewMode === 'class') loadSlots()
    if (viewMode === 'teacher') loadTeacherSchedule()
  }

  async function handleSaveSlot(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/timetable/slots', {
        class_name:  editSlot.class_name,
        day_of_week: editSlot.day_of_week,
        period_id:   editSlot.period.id,
        subject:     slotForm.subject || null,
        teacher_id:  slotForm.teacher_id || null,
        room:        slotForm.room || null,
      })
      setEditSlot(null)
      refreshAfterSlotChange()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save slot.')
    } finally {
      setSaving(false)
    }
  }

  async function handleClearSlot() {
    if (!editSlot.entry) { setEditSlot(null); return }
    setSaving(true)
    try {
      await api.delete(`/timetable/slots/${editSlot.entry.id}`)
      setEditSlot(null)
      refreshAfterSlotChange()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear slot.')
    } finally {
      setSaving(false)
    }
  }

  // ── Structure (periods) builder ──────────────────────────────
  async function handleAddPeriod(e) {
    e.preventDefault()
    if (!periodForm.label.trim() || !periodForm.time_range.trim()) return
    setSavingPeriod(true)
    try {
      const nextOrder = periods.length > 0
        ? Math.max(...periods.map(p => p.sort_order)) + 1
        : 1
      await api.post('/timetable/periods', {
        class_name: selectedClass,
        label:      periodForm.label.trim(),
        time_range: periodForm.time_range.trim(),
        is_break:   periodForm.is_break,
        sort_order: nextOrder,
      })
      setPeriodForm({ label: '', time_range: '', is_break: false })
      loadPeriods()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add period.')
    } finally {
      setSavingPeriod(false)
    }
  }

  async function handleDeletePeriod(id) {
    if (!confirm('Remove this period? Any subject assigned to it across all days will be cleared too.')) return
    try {
      await api.delete(`/timetable/periods/${id}`)
      loadPeriods()
      loadSlots()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove period.')
    }
  }

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId)
  const teacherDaySchedule = teacherEntries.filter(e => e.day_of_week === teacherDay)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Timetable</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Class schedules and teacher assignments · Term 2, 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          {viewMode === 'class' && selectedClass && (
            <button onClick={() => setStructureModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                border-2 border-[#ea580c] text-[#ea580c] text-[13px]
                font-semibold hover:bg-[#ea580c]/5 transition-colors">
              <Settings size={15} />
              Manage structure for {selectedClass}
            </button>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="inline-flex rounded-xl border-2 border-[var(--color-border)] p-1 bg-[var(--color-surface)]">
        <button onClick={() => setViewMode('class')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold
            transition-colors ${viewMode === 'class'
              ? 'bg-[#ea580c] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'}`}>
          <LayoutGrid size={14} /> By Class
        </button>
        <button onClick={() => setViewMode('teacher')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold
            transition-colors ${viewMode === 'teacher'
              ? 'bg-[#ea580c] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'}`}>
          <Users size={14} /> By Teacher
        </button>
      </div>

      {/* ══════════════════ CLASS VIEW ══════════════════ */}
      {viewMode === 'class' && (
        classes.length === 0 && !loading ? (
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
            p-10 text-center">
            <p className="text-[13px] text-[var(--color-text-muted)]">
              No classes found yet. Add students to a class first, then come back here to build its timetable.
            </p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {classes.map(c => (
                  <button key={c}
                    onClick={() => setSelectedClass(c)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium
                      border transition-colors ${
                      selectedClass === c
                        ? 'bg-[#ea580c] text-white border-[#ea580c]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap ml-auto">
                {DAYS.map(d => (
                  <button key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-2 rounded-full text-[12px] font-medium
                      border transition-colors ${
                      selectedDay === d
                        ? 'bg-[#1e293b] text-white border-[#1e293b]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                    }`}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Timetable grid */}
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="px-5 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                  {selectedClass} · {selectedDay}
                </h2>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-7 h-7 border-2 border-[#ea580c]/20 border-t-[#ea580c] rounded-full animate-spin" />
                </div>
              ) : periods.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <p className="text-[13px] text-[var(--color-text-muted)]">
                    {selectedClass} doesn't have a timetable structure yet.
                  </p>
                  <button onClick={() => setStructureModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                      bg-[#ea580c] hover:bg-[#c2410c] text-white text-[13px] font-semibold">
                    <Plus size={15} /> Build the structure
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {periods.map(period => {
                    const entry = getSlot(period.id)
                    const colors = entry ? colorsFor(entry.subject) : null

                    if (period.is_break) {
                      return (
                        <div key={period.id}
                          className="flex items-center gap-6 px-5 py-3 bg-[var(--color-bg)]">
                          <div className="w-40 text-[12px] text-[var(--color-text-muted)]">
                            <div className="font-medium">{period.label}</div>
                            <div>{period.time_range}</div>
                          </div>
                          <div className="text-[12px] text-[var(--color-text-muted)] italic">
                            {period.label.toLowerCase().includes('lunch') ? '🍽 Lunch' : '☕ Break'}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={period.id}
                        className="flex items-center gap-6 px-5 py-3 group
                          hover:bg-[var(--color-bg)] transition-colors">
                        <div className="w-40 flex-shrink-0">
                          <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">
                            {period.label}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">{period.time_range}</div>
                        </div>

                        {entry?.subject ? (
                          <div className="flex items-center gap-4 flex-1 flex-wrap">
                            <span className={`text-[12px] font-bold px-3 py-1 rounded-full border
                              ${colors.bg} ${colors.text} ${colors.border}`}>
                              {entry.subject}
                            </span>
                            {entry.teacher_name && (
                              <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                                <User size={12} /> {entry.teacher_name}
                              </span>
                            )}
                            {entry.room && (
                              <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                                <MapPin size={12} /> {entry.room}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[13px] text-[var(--color-text-muted)] italic flex-1">
                            Free period
                          </span>
                        )}

                        <button onClick={() => openEdit(period)}
                          className="flex items-center gap-1.5 text-[12px] font-semibold
                            text-[var(--color-text-muted)] hover:text-[#ea580c]
                            opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Pencil size={13} /> Edit
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )
      )}

      {/* ══════════════════ TEACHER VIEW ══════════════════ */}
      {viewMode === 'teacher' && (
        teachers.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
            p-10 text-center">
            <p className="text-[13px] text-[var(--color-text-muted)]">
              No teachers found yet. Add a teacher first, then come back here to view their schedule.
            </p>
          </div>
        ) : (
          <>
            {/* Teacher + day controls */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--color-text-muted)]">
                  Teacher
                </label>
                <select value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[13px] text-[var(--color-text)]
                    focus:outline-none focus:border-[#ea580c] transition-all min-w-[220px]">
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 flex-wrap ml-auto">
                {DAYS.map(d => (
                  <button key={d}
                    onClick={() => setTeacherDay(d)}
                    className={`px-3 py-2 rounded-full text-[12px] font-medium
                      border transition-colors ${
                      teacherDay === d
                        ? 'bg-[#1e293b] text-white border-[#1e293b]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                    }`}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly summary pills */}
            <div className="grid grid-cols-5 gap-2">
              {DAYS.map(day => {
                const count = teacherEntries.filter(e => e.day_of_week === day).length
                return (
                  <button key={day}
                    onClick={() => setTeacherDay(day)}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      teacherDay === day
                        ? 'bg-[#ea580c] text-white border-[#ea580c]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                    }`}>
                    <div className={`text-[11px] font-medium ${
                      teacherDay === day ? 'text-white/70' : 'text-[var(--color-text-muted)]'
                    }`}>{day.slice(0, 3)}</div>
                    <div className={`text-[20px] font-bold mt-0.5 ${
                      teacherDay === day ? 'text-white' : 'text-[var(--color-text)]'
                    }`}>{count}</div>
                    <div className={`text-[10px] ${
                      teacherDay === day ? 'text-white/70' : 'text-[var(--color-text-muted)]'
                    }`}>periods</div>
                  </button>
                )
              })}
            </div>

            {/* Teacher's schedule for selected day */}
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="px-5 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
                  {selectedTeacher?.full_name} · {teacherDay}
                </h2>
              </div>

              {teacherLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-7 h-7 border-2 border-[#ea580c]/20 border-t-[#ea580c] rounded-full animate-spin" />
                </div>
              ) : teacherDaySchedule.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-[13px] text-[var(--color-text-muted)]">
                    No periods scheduled for {selectedTeacher?.full_name} on {teacherDay}.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {teacherDaySchedule.map(entry => {
                    const colors = colorsFor(entry.subject)
                    return (
                      <div key={entry.id}
                        className="flex items-center gap-6 px-5 py-3 group
                          hover:bg-[var(--color-bg)] transition-colors">
                        <div className="w-40 flex-shrink-0">
                          <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">
                            {entry.label}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">{entry.time_range}</div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 flex-wrap">
                          <span className={`text-[12px] font-bold px-3 py-1 rounded-full border
                            ${colors.bg} ${colors.text} ${colors.border}`}>
                            {entry.subject}
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                            <Users size={12} /> {entry.class_name}
                          </span>
                          {entry.room && (
                            <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                              <MapPin size={12} /> {entry.room}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => openEdit(
                            { id: entry.period_id, label: entry.label },
                            { class_name: entry.class_name, day_of_week: entry.day_of_week, entry }
                          )}
                          className="flex items-center gap-1.5 text-[12px] font-semibold
                            text-[var(--color-text-muted)] hover:text-[#ea580c]
                            opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Pencil size={13} /> Edit
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <p className="text-[12px] text-[var(--color-text-muted)] italic">
              To assign this teacher to a new class/period, switch to "By Class",
              pick the class and period, then choose them from the teacher dropdown.
            </p>
          </>
        )
      )}

      {/* Slot edit modal */}
      {editSlot && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
            p-6 w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
                {editSlot.period.label} · {editSlot.class_name} · {editSlot.day_of_week}
              </h3>
              <button onClick={() => setEditSlot(null)}>
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                  Subject
                </label>
                <input type="text" value={slotForm.subject}
                  onChange={e => setSlotForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#ea580c] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                  Teacher
                </label>
                <select value={slotForm.teacher_id}
                  onChange={e => setSlotForm(f => ({ ...f, teacher_id: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#ea580c] transition-all">
                  <option value="">Unassigned</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                  Room
                </label>
                <input type="text" value={slotForm.room}
                  onChange={e => setSlotForm(f => ({ ...f, room: e.target.value }))}
                  placeholder="e.g. Lab 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none focus:border-[#ea580c] transition-all" />
              </div>
              <div className="flex gap-2 pt-1">
                {editSlot.entry && (
                  <button type="button" onClick={handleClearSlot} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                      border-2 border-red-200 text-red-600 text-[13px] font-semibold
                      disabled:opacity-60">
                    <Trash2 size={14} /> Clear
                  </button>
                )}
                <div className="flex-1 flex gap-2">
                  <button type="button" onClick={() => setEditSlot(null)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                      text-[13px] font-semibold text-[var(--color-text)]">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c]
                      text-white text-[13px] font-semibold disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structure builder modal */}
      {structureModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]
            p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
                Timetable structure — {selectedClass}
              </h3>
              <button onClick={() => setStructureModal(false)}>
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
            <p className="text-[12px] text-[var(--color-text-muted)] mb-4">
              Build the day for this class: add each block or break in the order it happens.
              This structure applies across all days for {selectedClass} — assign subjects per day from the main page.
            </p>

            {/* Existing periods list */}
            {periods.length > 0 && (
              <div className="space-y-1.5 mb-5">
                {periods.map(p => (
                  <div key={p.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg
                      bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <GripVertical size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--color-text)]">
                        {p.label}
                        {p.is_break && (
                          <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded
                            bg-amber-100 text-amber-700">BREAK</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{p.time_range}</div>
                    </div>
                    <button onClick={() => handleDeletePeriod(p.id)}
                      className="text-[var(--color-text-muted)] hover:text-red-600 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add period form */}
            <form onSubmit={handleAddPeriod}
              className="p-4 rounded-xl border-2 border-[#ea580c]/20 bg-[#ea580c]/5 space-y-3">
              <p className="text-[12px] font-semibold text-[#ea580c]">Add to the day</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                    Label
                  </label>
                  <input type="text" required value={periodForm.label}
                    onChange={e => setPeriodForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Block 1, Assembly, Lunch"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[var(--color-border)]
                      bg-white text-[13px] focus:outline-none focus:border-[#ea580c]" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1">
                    Time range
                  </label>
                  <input type="text" required value={periodForm.time_range}
                    onChange={e => setPeriodForm(f => ({ ...f, time_range: e.target.value }))}
                    placeholder="e.g. 08:20 - 09:40"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[var(--color-border)]
                      bg-white text-[13px] focus:outline-none focus:border-[#ea580c]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-[var(--color-text)] cursor-pointer">
                <input type="checkbox" checked={periodForm.is_break}
                  onChange={e => setPeriodForm(f => ({ ...f, is_break: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#ea580c]" />
                This is a break, not a teaching block
              </label>
              <div className="flex justify-end">
                <button type="submit" disabled={savingPeriod}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                    bg-[#ea580c] text-white text-[12px] font-semibold disabled:opacity-60">
                  <Plus size={13} /> {savingPeriod ? 'Adding...' : 'Add to structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}