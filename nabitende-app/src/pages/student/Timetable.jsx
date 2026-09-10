import { useState, useEffect } from 'react'
import { MapPin, User } from 'lucide-react'
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

export default function StudentTimetable() {
  const today = DAYS[new Date().getDay() - 1] || 'Monday'
  const [selectedDay, setSelectedDay] = useState(today)
  const [className, setClassName] = useState('')
  const [periods, setPeriods] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadClassAndPeriods()
  }, [])

  useEffect(() => {
    if (className) loadSlots()
  }, [className, selectedDay])

  async function loadClassAndPeriods() {
    setLoading(true)
    setError('')
    try {
      const meRes = await api.get('/students/me')
      const cls = meRes.data.student.class_name
      setClassName(cls)

      const periodsRes = await api.get('/timetable/periods', { params: { class_name: cls } })
      setPeriods(periodsRes.data.periods || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load timetable.')
    } finally {
      setLoading(false)
    }
  }

  async function loadSlots() {
    try {
      const res = await api.get('/timetable/slots', {
        params: { class_name: className, day: selectedDay },
      })
      setSlots(res.data.slots || [])
    } catch (err) {
      console.error(err)
    }
  }

  function getSlot(periodId) {
    return slots.find(s => s.period_id === periodId)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">My Timetable</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {className || '—'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#7c3aed]/20
            border-t-[#7c3aed] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 text-[13px]">{error}</div>
      ) : periods.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
          p-10 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Your class doesn't have a timetable structure set up yet. Check back once
            the school admin has built it.
          </p>
        </div>
      ) : (
        <>
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map(day => (
              <button key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium
                  border whitespace-nowrap transition-colors ${
                  selectedDay === day
                    ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                }`}>
                {day}
                {day === today && (
                  <span className="ml-1.5 text-[10px] opacity-70">today</span>
                )}
              </button>
            ))}
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            {periods.map(period => {
              const entry = getSlot(period.id)
              const colors = entry ? colorsFor(entry.subject) : null

              if (period.is_break) {
                return (
                  <div key={period.id}
                    className="flex items-center gap-4 px-4 py-2.5 rounded-lg
                      bg-[var(--color-bg)] border border-dashed border-[var(--color-border)]">
                    <div className="min-w-[110px]">
                      <div className="text-[11px] font-semibold text-[var(--color-text-muted)]
                        uppercase tracking-wide">{period.label}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{period.time_range}</div>
                    </div>
                    <div className="text-[12px] text-[var(--color-text-muted)] italic">
                      {period.label.toLowerCase().includes('lunch') ? '🍽 Lunch break' : '☕ Short break'}
                    </div>
                  </div>
                )
              }

              return (
                <div key={period.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg border
                    transition-all ${entry
                      ? `${colors.bg} ${colors.border}`
                      : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                    }`}>
                  <div className="min-w-[110px]">
                    <div className="text-[11px] font-semibold text-[var(--color-text-muted)]
                      uppercase tracking-wide">{period.label}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{period.time_range}</div>
                  </div>
                  {entry?.subject ? (
                    <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className={`text-[14px] font-semibold ${colors.text}`}>
                          {entry.subject}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {entry.teacher_name && (
                            <span className="flex items-center gap-1 text-[11px]
                              text-[var(--color-text-muted)]">
                              <User size={11} /> {entry.teacher_name}
                            </span>
                          )}
                          {entry.room && (
                            <span className="flex items-center gap-1 text-[11px]
                              text-[var(--color-text-muted)]">
                              <MapPin size={11} /> {entry.room}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-[var(--color-text-muted)] italic">
                      Free period
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}