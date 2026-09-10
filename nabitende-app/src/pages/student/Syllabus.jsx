import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react'
import api from '../../api'

const STATUS_CONFIG = {
  not_started: { label: 'Not started', icon: Circle,       bg: 'bg-gray-50',   text: 'text-gray-600'   },
  in_progress: { label: 'In progress', icon: Clock,        bg: 'bg-amber-50',  text: 'text-amber-700'  },
  completed:   { label: 'Completed',   icon: CheckCircle2, bg: 'bg-green-50',  text: 'text-green-700'  },
}

export default function StudentSyllabus() {
  const [topics, setTopics] = useState([])
  const [targets, setTargets] = useState([])
  const [termInfo, setTermInfo] = useState({ term: '', academic_year: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/students/me/syllabus')
      setTopics(res.data.topics || [])
      setTargets(res.data.targets || [])
      setTermInfo({ term: res.data.term, academic_year: res.data.academic_year })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load syllabus.')
    } finally {
      setLoading(false)
    }
  }

  // Group topics by subject
  const bySubject = {}
  topics.forEach(t => {
    if (!bySubject[t.subject]) bySubject[t.subject] = []
    bySubject[t.subject].push(t)
  })

  function targetFor(subject) {
    return targets.find(t => t.subject === subject)?.target_topics ?? null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">My Syllabus</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {termInfo.term && termInfo.academic_year
            ? `${termInfo.term}, ${termInfo.academic_year} · topic coverage by subject`
            : 'Topic coverage by subject'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#7c3aed]/20
            border-t-[#7c3aed] rounded-full animate-spin" />
        </div>
      ) : Object.keys(bySubject).length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
          p-10 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="text-[13px] text-[var(--color-text-muted)]">
            No syllabus topics have been added for your class this term yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(bySubject).map(([subject, subjectTopics]) => {
            const target = targetFor(subject)
            const completed = subjectTopics.filter(t => t.status === 'completed').length
            const pct = target ? Math.min(100, Math.round((completed / target) * 100)) : null

            return (
              <div key={subject}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden"
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="px-5 py-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-[15px] font-semibold text-[var(--color-text)]">{subject}</h2>
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {completed}{target ? ` / ${target}` : ''} topics completed
                    </span>
                  </div>
                  {target && (
                    <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden mt-2.5">
                      <div className="h-full bg-[#7c3aed] rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {subjectTopics.map(t => {
                    const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.not_started
                    const Icon = cfg.icon
                    return (
                      <div key={t.id} className="px-5 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13.5px] font-semibold text-[var(--color-text)]">
                              {t.topic}
                            </div>
                            {t.subtopics?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {t.subtopics.map(st => (
                                  <span key={st} className="text-[11px] px-2 py-0.5 rounded-full
                                    bg-[var(--color-bg)] border border-[var(--color-border)]
                                    text-[var(--color-text-muted)]">
                                    {st}
                                  </span>
                                ))}
                              </div>
                            )}
                            {t.notes && (
                              <p className="text-[12px] text-[var(--color-text-muted)] mt-1.5">
                                {t.notes}
                              </p>
                            )}
                          </div>
                          <span className={`flex items-center gap-1.5 text-[11px] font-semibold
                            px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                            <Icon size={12} />
                            {cfg.label}
                          </span>
                        </div>
                        {t.date_taught && (
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
                            Taught {new Date(t.date_taught).toLocaleDateString('en-UG', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}