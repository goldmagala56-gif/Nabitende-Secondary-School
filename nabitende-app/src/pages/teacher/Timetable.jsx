import { useState, useEffect } from 'react'
import { MapPin, Users } from 'lucide-react'
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

export default function TeacherTimetable() {
  const today = DAYS[new Date().getDay() - 1] || 'Monday'
  const [selectedDay, setSelectedDay] = useState(today)
  const [entries, setEntries] = useState([])
  const [teacherInfo, setTeacherInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/teachers/me/timetable')
      .then(res => {
        setEntries(res.data.entries || [])
        setTeacherInfo(res.data.teacher || null)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Group entries by day
  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter(e => e.day_of_week === day)
    return acc
  }, {})

  const daySchedule = byDay[selectedDay] || []
  const totalWeeklyPeriods = entries.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
          border-t-[#1a6b4a] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">My Timetable</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            {teacherInfo?.full_name || 'My schedule'}
            {teacherInfo?.subjects?.length ? ` · ${teacherInfo.subjects.join(', ')}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg
          bg-[#1a6b4a]/10 border border-[#1a6b4a]/20">
          <span className="text-[13px] font-semibold text-[#1a6b4a]">
            {totalWeeklyPeriods} periods/week
          </span>
        </div>
      </div>

      {totalWeeklyPeriods === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
          p-10 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            You don't have any timetable slots assigned yet. Ask an admin to
            allocate you to classes and periods on the Timetable page.
          </p>
        </div>
      ) : (
        <>
          {/* Weekly summary pills */}
          <div className="grid grid-cols-5 gap-2">
            {DAYS.map(day => {
              const count = (byDay[day] || []).length
              return (
                <button key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    selectedDay === day
                      ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                  }`}>
                  <div className={`text-[11px] font-medium ${
                    selectedDay === day ? 'text-white/70' : 'text-[var(--color-text-muted)]'
                  }`}>{day.slice(0, 3)}</div>
                  <div className={`text-[20px] font-bold mt-0.5 ${
                    selectedDay === day ? 'text-white' : 'text-[var(--color-text)]'
                  }`}>{count}</div>
                  <div className={`text-[10px] ${
                    selectedDay === day ? 'text-white/70' : 'text-[var(--color-text-muted)]'
                  }`}>periods</div>
                </button>
              )
            })}
          </div>

          {/* Schedule for selected day */}
          <div className="space-y-2">
            {daySchedule.length === 0 ? (
              <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
                p-8 text-center">
                <p className="text-[13px] text-[var(--color-text-muted)]">
                  No periods scheduled for {selectedDay}.
                </p>
              </div>
            ) : (
              daySchedule.map((entry, i) => {
                const colors = colorsFor(entry.subject)
                return (
                  <div key={i}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg border
                      transition-all ${colors.bg} ${colors.border}`}>
                    <div className="min-w-[110px]">
                      <div className="text-[11px] font-semibold text-[var(--color-text-muted)]
                        uppercase tracking-wide">{entry.label}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{entry.time_range}</div>
                    </div>
                    <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className={`text-[14px] font-semibold ${colors.text}`}>
                          {entry.subject} — {entry.class_name}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-[11px]
                            text-[var(--color-text-muted)]">
                            <Users size={11} /> {entry.class_name}
                          </span>
                          {entry.room && (
                            <span className="flex items-center gap-1 text-[11px]
                              text-[var(--color-text-muted)]">
                              <MapPin size={11} /> {entry.room}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}