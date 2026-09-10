import { useState, useEffect } from 'react'
import { Pin, Users, Calendar, Megaphone } from 'lucide-react'
import api from '../api'
import PageShell from '../components/PageShell'
import SectionCard from '../components/SectionCard'

const categoryStyle = {
  Academic: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Finance:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  Event:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Staff:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  Students: { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200'   },
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function Announcements({ role }) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    setLoading(true)
    try {
      const res = await api.get('/announcements')
      setItems(res.data.announcements || [])
    } catch (err) {
      console.error('Failed to load announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Announcements"
      subtitle="School notices and updates"
    >
      <SectionCard noPadding>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-border)]
              flex items-center justify-center">
              <Megaphone size={24} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[15px] font-semibold text-[var(--color-text)]">
              No announcements yet
            </p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              Check back later for school updates
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {items.map(a => {
              const cs = categoryStyle[a.category] || categoryStyle.Academic
              return (
                <div key={a.id} className="px-4 py-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {a.pinned && (
                      <Pin size={13} className="text-[#1a6b4a] flex-shrink-0" />
                    )}
                    <h3 className="text-[14px] font-semibold text-[var(--color-text)]">
                      {a.title}
                    </h3>
                  </div>
                  <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
                    {a.body}
                  </p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className={`text-[11px] font-medium px-2.5 py-1
                      rounded-full border ${cs.bg} ${cs.text} ${cs.border}`}>
                      {a.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                      <Users size={11} /> {capitalize(a.audience)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                      <Calendar size={11} /> {new Date(a.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      by {a.author_name || 'School Admin'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}