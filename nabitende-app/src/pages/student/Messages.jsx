import { useState, useEffect } from 'react'
import { MessageSquare, Send, ChevronDown } from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import MessageThread from '../../components/MessageThread'

const ROLE_COLORS = {
  admin:      { bg: 'bg-orange-100', text: 'text-orange-700' },
  teacher:    { bg: 'bg-green-100',  text: 'text-green-700'  },
  parent:     { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
  student:    { bg: 'bg-purple-100', text: 'text-purple-700' },
  government: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function StudentMessages() {
  const [messages, setMessages]   = useState([])
  const [teachers, setTeachers]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [thread, setThread]       = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [tab, setTab]             = useState('inbox')
  const [composeTo, setComposeTo]         = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody]     = useState('')
  const [composing, setComposing]         = useState(false)

  useEffect(() => {
    fetchMessages()
    fetchTeachers()
  }, [])

  async function fetchMessages() {
    try {
      setLoading(true)
      const res = await api.get('/messages')
      setMessages(res.data.messages || [])
    } catch (err) {
      console.error('Failed to load messages', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTeachers() {
    try {
      const res = await api.get('/messages/users')
      setTeachers((res.data.users || []).filter(u =>
        ['teacher', 'admin'].includes(u.role)
      ))
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchThread(msg) {
    if (!msg) return
    try {
      setThreadLoading(true)
      const otherId = msg.from_id === msg.my_id ? msg.to_id : msg.from_id
      const res = await api.get(`/messages/thread/${otherId}`)
      setThread(res.data.messages || [])
      await fetchMessages() // refreshes unread count immediately
    } catch (err) {
      console.error('Failed to load thread', err)
    } finally {
      setThreadLoading(false)
    }
  }

  async function handleReply(body) {
    if (!body.trim() || !selected) return
    try {
      const otherId =
        selected.from_id === selected.my_id
          ? selected.to_id
          : selected.from_id

      await api.post('/messages', {
        to_id: otherId,
        subject: selected.subject,
        body,
      })

      await fetchThread(selected)
      await fetchMessages()
    } catch (err) {
      console.error('Failed to send reply', err)
    }
  }

  async function handleCompose(e) {
    e.preventDefault()
    setComposing(true)
    try {
      await api.post('/messages', {
        to_id:   parseInt(composeTo),
        subject: composeSubject,
        body:    composeBody,
      })
      setComposeTo('')
      setComposeSubject('')
      setComposeBody('')
      setTab('inbox')
      fetchMessages()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send.')
    } finally {
      setComposing(false)
    }
  }

  const conversations = messages.reduce((acc, msg) => {
    const key = `${Math.min(msg.from_id, msg.to_id)}_${Math.max(msg.from_id, msg.to_id)}`

    if (!acc[key]) {
      acc[key] = { ...msg, unread: 0 }
    } else if (new Date(msg.created_at) > new Date(acc[key].created_at)) {
      acc[key] = { ...msg, unread: acc[key].unread }
    }

    if (!msg.is_read && msg.to_id === msg.my_id) {
      acc[key].unread++
    }

    return acc
  }, {})

  const convList = Object.values(conversations)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const unreadCount = messages.filter(m =>
    !m.is_read && m.to_id === m.my_id
  ).length
  const [view, setView] = useState('list') // 'list' or 'thread'
  return (
    <PageShell title="My Messages" subtitle={`${unreadCount} unread`}>
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'inbox',   label: 'Inbox',       icon: MessageSquare },
          { key: 'compose', label: 'New message', icon: Send          },
        ].map(t => {
          const Icon = t.icon
          return (
            <button key={t.key}
              onClick={() => { setTab(t.key); setSelected(null); setView('list') }}
              className={`flex items-center gap-2 px-4 py-2
                rounded-xl text-[13px] font-semibold border-2
                transition-colors ${
                tab === t.key
                  ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
              <Icon size={15} />
              {t.label}
              {t.key === 'inbox' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px]
                  font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* INBOX TAB */}
      {tab === 'inbox' && view === 'list' && (
        <SectionCard title="Inbox" noPadding>
            {loading ? (
              <Loader />
            ) : convList.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y">
                {convList.map((msg) => {
                  const senderRole = msg.from_id === msg.my_id ? msg.to_role : msg.from_role
                  const senderName = msg.from_id === msg.my_id ? msg.to_name : msg.from_name
                  const rc = ROLE_COLORS[senderRole] || ROLE_COLORS.teacher
                  const isSelected = selected && selected.id === msg.id

                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelected(msg)
                        fetchThread(msg)
                        setView('thread')
                      }}
                      className={`px-4 py-3 cursor-pointer hover:bg-[var(--color-bg)] ${
                        isSelected ? 'bg-[#7c3aed]/5 border-l-2 border-l-[#7c3aed]' : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-[13px] font-medium text-[var(--color-text)]">
                          {senderName}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {timeAgo(msg.created_at)}
                        </span>
                      </div>

                      <p className="text-[12px] text-[var(--color-text-muted)] truncate">
                        {msg.subject || msg.body}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${rc.bg} ${rc.text}`}>
                          {senderRole}
                        </span>
                        {msg.unread > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600">
                            {msg.unread} new
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
      )}
          
           { tab === 'inbox' && view === 'thread' && selected &&(
            <div>
              {/* Back button */}
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-2 mb-4 px-3 py-2
                  rounded-xl border-2 border-[var(--color-border)]
                  text-[13px] font-semibold text-[var(--color-text-muted)]
                  hover:bg-[var(--color-bg)] transition-colors">
                ← Back to inbox
              </button>
              <MessageThread
                selected={selected}
                thread={thread}
                threadLoading={threadLoading}
                accentColor="#7c3aed"
                myRole="student"
                users={teachers}
                onReply={handleReply}
                onThreadRefresh={() => fetchThread(selected)}
                onClearChat={() => {
                  setSelected(null)
                  setView('list')
                  fetchMessages()
                }}
              />
            </div>
          
          )}

      {/* COMPOSE TAB */}
      {tab === 'compose' && (
        <SectionCard title="Message a teacher or admin">
          <form onSubmit={handleCompose} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                Send to
              </label>
              <div className="relative">
                <select value={composeTo}
                  onChange={e => setComposeTo(e.target.value)}
                  required
                  className="w-full appearance-none px-3.5 py-2.5
                    rounded-xl border-2 border-[var(--color-border)]
                    bg-white text-[14px] focus:outline-none
                    focus:border-[#7c3aed] transition-all">
                  <option value="">Select teacher or admin...</option>
                  {teachers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3
                  top-1/2 -translate-y-1/2
                  text-[var(--color-text-muted)] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                Subject
              </label>
              <input type="text"
                value={composeSubject}
                onChange={e => setComposeSubject(e.target.value)}
                placeholder="e.g. Question about homework"
                className="w-full px-3.5 py-2.5 rounded-xl border-2
                  border-[var(--color-border)] bg-white text-[14px]
                  focus:outline-none focus:border-[#7c3aed] transition-all" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
                Message
              </label>
              <textarea required rows={5}
                value={composeBody}
                onChange={e => setComposeBody(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2
                  border-[var(--color-border)] bg-white text-[14px]
                  focus:outline-none focus:border-[#7c3aed]
                  transition-all resize-none" />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={composing}
                className="flex items-center gap-2 px-6 py-2.5
                  rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9]
                  text-white text-[14px] font-semibold
                  transition-colors disabled:opacity-60">
                <Send size={16} />
                {composing ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </form>
        </SectionCard>
      )}
    </PageShell>
  )
}

function Loader() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-6 h-6 border-2 border-[#7c3aed]/20 border-t-[#7c3aed] rounded-full animate-spin" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-[var(--color-text-muted)] text-[13px]">
      No messages yet.
    </div>
  )
}