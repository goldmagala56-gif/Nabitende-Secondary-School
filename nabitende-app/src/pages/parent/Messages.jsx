import { useState, useEffect } from 'react'
import { Send, MessageSquare, ChevronDown, ChevronLeft } from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import MessageThread from '../../components/MessageThread'

const ROLE_COLORS = {
  admin:   { bg: 'bg-orange-100', text: 'text-orange-700' },
  teacher: { bg: 'bg-green-100',  text: 'text-green-700'  },
  parent:  { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function ParentMessages() {
  const [messages,       setMessages]       = useState([])
  const [teachers,       setTeachers]       = useState([])
  const [selected,       setSelected]       = useState(null)
  const [thread,         setThread]         = useState([])
  const [loading,        setLoading]        = useState(true)
  const [threadLoading,  setThreadLoading]  = useState(false)
  const [tab,            setTab]            = useState('inbox')
  const [composeTo,      setComposeTo]      = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody,    setComposeBody]    = useState('')
  const [composing,      setComposing]      = useState(false)

  useEffect(() => {
    fetchMessages()
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (selected) fetchThread(selected)
  }, [selected])

  async function fetchMessages() {
    setLoading(true)
    try {
      const res = await api.get('/messages')
      setMessages(res.data.messages || [])
    } catch (err) {
      console.error(err)
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
    setThreadLoading(true)
    try {
      const otherId = msg.from_id === msg.my_id
        ? msg.to_id : msg.from_id
      const res = await api.get(`/messages/thread/${otherId}`)
      setThread(res.data.messages || [])
      fetchMessages()
    } catch (err) {
      console.error(err)
    } finally {
      setThreadLoading(false)
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
    if (!acc[key]) acc[key] = { ...msg, unread: 0 }
    if (!msg.is_read && msg.to_id === msg.my_id) acc[key].unread++
    return acc
  }, {})

  const convList = Object.values(conversations)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const unreadCount = messages.filter(m =>
    !m.is_read && m.to_id === m.my_id
  ).length

  return (
    <PageShell
      title={selected ? selected.from_name : 'Messages'}
      subtitle={selected ? '' : `${unreadCount} unread`}
    >
      {/* Tabs — hidden while viewing a thread */}
      {!selected && (
        <div className="flex gap-2">
          {[
            { key: 'inbox',   label: 'Inbox',      icon: MessageSquare },
            { key: 'compose', label: 'New message', icon: Send          },
          ].map(t => {
            const Icon = t.icon
            return (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2
                  rounded-xl text-[13px] font-semibold border-2
                  transition-colors ${
                  tab === t.key
                    ? 'bg-[#0891b2] text-white border-[#0891b2]'
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
      )}

      {/* ── THREAD VIEW (full width, WhatsApp-style) ── */}
      {selected ? (
        <div className="space-y-3">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-[13px] font-medium
              text-[var(--color-text-muted)] hover:text-[var(--color-text)]
              transition-colors">
            <ChevronLeft size={16} />
            Back to conversations
          </button>
          <MessageThread
            selected={selected}
            thread={thread}
            threadLoading={threadLoading}
            accentColor="#0891b2"
            myRole="parent"
            users={teachers}
            onReply={async (body) => {
              const otherId = selected.from_id === selected.my_id
                ? selected.to_id : selected.from_id
              await api.post('/messages', {
                to_id:   otherId,
                subject: selected.subject,
                body,
              })
              fetchThread(selected)
            }}
            onThreadRefresh={() => fetchThread(selected)}
            onClearChat={() => {
              setSelected(null)
              fetchMessages()
            }}
          />
        </div>
      ) : (
        <>
          {/* ── INBOX TAB (conversation list, full width) ── */}
          {tab === 'inbox' && (
            <SectionCard title="Conversations" noPadding>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#0891b2]/20
                    border-t-[#0891b2] rounded-full animate-spin" />
                </div>
              ) : convList.length === 0 ? (
                <div className="p-8 text-center text-[13px]
                  text-[var(--color-text-muted)]">
                  No messages yet.
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {convList.map((msg, i) => {
                    const rc = ROLE_COLORS[msg.from_role] || ROLE_COLORS.teacher
                    return (
                      <div key={i} onClick={() => setSelected(msg)}
                        className="px-4 py-3.5 cursor-pointer
                          transition-colors hover:bg-[var(--color-bg)]
                          flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full
                          flex items-center justify-center
                          text-[13px] font-bold flex-shrink-0
                          ${rc.bg} ${rc.text}`}>
                          {msg.from_initials || msg.from_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[14px] truncate ${
                              msg.unread > 0
                                ? 'font-bold text-[var(--color-text)]'
                                : 'font-medium text-[var(--color-text)]'
                              }`}>
                              {msg.from_name}
                            </span>
                            <span className="text-[11px]
                              text-[var(--color-text-muted)] flex-shrink-0">
                              {timeAgo(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-[var(--color-text-muted)]
                            truncate mt-0.5">
                            {msg.subject || msg.body}
                          </p>
                        </div>
                        {msg.unread > 0 && (
                          <span className="bg-[#0891b2] text-white text-[10px]
                            font-bold w-5 h-5 rounded-full flex items-center
                            justify-center flex-shrink-0">
                            {msg.unread}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>
          )}

          {/* ── COMPOSE TAB ── */}
          {tab === 'compose' && (
            <SectionCard title="Message a teacher">
              <form onSubmit={handleCompose} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold
                    text-[var(--color-text)] mb-1.5">
                    Send to
                  </label>
                  <div className="relative">
                    <select value={composeTo}
                      onChange={e => setComposeTo(e.target.value)}
                      required
                      className="w-full appearance-none px-3.5 py-2.5
                        rounded-xl border-2 border-[var(--color-border)]
                        bg-white text-[14px] focus:outline-none
                        focus:border-[#0891b2] transition-all">
                      <option value="">Select teacher or admin...</option>
                      {teachers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.role})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3
                      top-1/2 -translate-y-1/2
                      text-[var(--color-text-muted)]
                      pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold
                    text-[var(--color-text)] mb-1.5">
                    Subject
                  </label>
                  <input type="text"
                    value={composeSubject}
                    onChange={e => setComposeSubject(e.target.value)}
                    placeholder="e.g. My child's progress"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2
                      border-[var(--color-border)] bg-white text-[14px]
                      focus:outline-none focus:border-[#0891b2]
                      transition-all" />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold
                    text-[var(--color-text)] mb-1.5">
                    Message
                  </label>
                  <textarea required rows={5}
                    value={composeBody}
                    onChange={e => setComposeBody(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2
                      border-[var(--color-border)] bg-white text-[14px]
                      focus:outline-none focus:border-[#0891b2]
                      transition-all resize-none" />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={composing}
                    className="flex items-center gap-2 px-6 py-2.5
                      rounded-xl bg-[#0891b2] hover:bg-[#0670a0]
                      text-white text-[14px] font-semibold
                      transition-colors disabled:opacity-60">
                    <Send size={16} />
                    {composing ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            </SectionCard>
          )}
        </>
      )}
    </PageShell>
  )
}