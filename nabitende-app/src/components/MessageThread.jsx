import { useState, useEffect, useRef } from 'react'
import {
  Send, Pencil, Trash2, X, Check,
  Copy, Star, Pin, Forward, Eraser, MessageSquare
} from 'lucide-react'
import api from '../api'
import SectionCard from './SectionCard'

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
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function MessageThread({
  selected,
  thread,
  threadLoading,
  onReply,
  onThreadRefresh,
  onClearChat,
  accentColor,
  myRole,
  users,
}) {
  const [reply,           setReply]           = useState('')
  const [sending,         setSending]         = useState(false)
  const [editingId,       setEditingId]       = useState(null)
  const [editBody,        setEditBody]        = useState('')
  const [editSaving,      setEditSaving]      = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting,        setDeleting]        = useState(false)
  const [confirmClear,    setConfirmClear]    = useState(false)
  const [clearing,        setClearing]        = useState(false)
  const [forwardMsg,      setForwardMsg]      = useState(null)
  const [forwardTo,       setForwardTo]       = useState('')
  const [forwarding,      setForwarding]      = useState(false)
  const [copiedId,        setCopiedId]        = useState(null)
  const [pinnedIds,       setPinnedIds]       = useState([])
  const [favouriteIds,    setFavouriteIds]    = useState([])

  const threadEndRef = useRef(null)

  // ✅ FIX: sync pinned/favourited when thread loads
  useEffect(() => {
    setPinnedIds(thread.filter(t => t.pinned).map(t => t.id))
    setFavouriteIds(thread.filter(t => t.favourited).map(t => t.id))
  }, [thread])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  async function handleReply(e) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      await onReply(reply)
      setReply('')
    } finally {
      setSending(false)
    }
  }

  async function handleEdit(msgId) {
    if (!editBody.trim()) return
    setEditSaving(true)
    try {
      await api.patch(`/messages/${msgId}`, { body: editBody })
      setEditingId(null)
      setEditBody('')
      onThreadRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to edit.')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(msgId) {
    setDeleting(true)
    try {
      await api.delete(`/messages/${msgId}`)
      setConfirmDeleteId(null)
      onThreadRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleClearChat() {
    setClearing(true)
    try {
      const otherId = selected.from_id === selected.my_id
        ? selected.to_id : selected.from_id
      await api.delete(`/messages/thread/${otherId}`)
      setConfirmClear(false)
      onClearChat()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear chat.')
    } finally {
      setClearing(false)
    }
  }

  async function handleForward(e) {
    e.preventDefault()
    if (!forwardTo || !forwardMsg) return
    setForwarding(true)
    try {
      await api.post('/messages', {
        to_id:   parseInt(forwardTo),
        subject: `Fwd: ${forwardMsg.subject || 'Message'}`,
        body:    `--- Forwarded message ---\n${forwardMsg.body}`,
      })
      setForwardMsg(null)
      setForwardTo('')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to forward.')
    } finally {
      setForwarding(false)
    }
  }

  async function handleTogglePin(msgId) {
    try {
      await api.patch(`/messages/${msgId}/pin`)
      setPinnedIds(prev =>
        prev.includes(msgId)
          ? prev.filter(id => id !== msgId)
          : [...prev, msgId]
      )
    } catch (err) {
      alert('Failed to pin message.')
    }
  }

  async function handleToggleFavourite(msgId) {
    try {
      await api.patch(`/messages/${msgId}/favourite`)
      setFavouriteIds(prev =>
        prev.includes(msgId)
          ? prev.filter(id => id !== msgId)
          : [...prev, msgId]
      )
    } catch (err) {
      alert('Failed to favourite message.')
    }
  }

  function handleCopy(msgId, body) {
    navigator.clipboard.writeText(body)
    setCopiedId(msgId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const pinnedMessages = thread.filter(t => pinnedIds.includes(t.id))

  if (!selected) {
    return (
      <SectionCard>
        <div className="flex flex-col items-center justify-center
          py-16 gap-3 text-[var(--color-text-muted)]">
          <MessageSquare size={32} className="opacity-30" />
          <p className="text-[13px]">Select a conversation to read</p>
        </div>
      </SectionCard>
    )
  }

  return (
    <>
      {/* Forward modal */}
      {forwardMsg && (
        <div className="fixed inset-0 bg-black/40 z-50
          flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl
            w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold
                text-[var(--color-text)]">
                Forward message
              </h3>
              <button onClick={() => setForwardMsg(null)}
                className="p-1.5 rounded-lg
                  hover:bg-[var(--color-bg)]">
                <X size={16} />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-bg)]
              border border-[var(--color-border)] text-[13px]
              text-[var(--color-text-muted)] mb-4 italic">
              "{forwardMsg.body}"
            </div>
            <form onSubmit={handleForward} className="space-y-3">
              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1">
                  Forward to
                </label>
                <select value={forwardTo}
                  onChange={e => setForwardTo(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[13px]
                    focus:outline-none">
                  <option value="">Select recipient...</option>
                  {(users || []).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button"
                  onClick={() => setForwardMsg(null)}
                  className="px-4 py-2 rounded-xl border
                    border-[var(--color-border)] text-[13px]
                    text-[var(--color-text-muted)]">
                  Cancel
                </button>
                <button type="submit" disabled={forwarding}
                  className="px-4 py-2 rounded-xl text-white
                    text-[13px] font-semibold disabled:opacity-40"
                  style={{ background: accentColor }}>
                  {forwarding ? 'Forwarding...' : 'Forward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionCard
        title={selected.subject || 'Message thread'}
        noPadding
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5
          border-b border-[var(--color-border)]
          bg-[var(--color-bg)] flex-wrap">

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5
                rounded-lg text-[12px] font-medium text-red-600
                hover:bg-red-50 transition-colors border
                border-red-200"
              title="Clear entire chat">
              <Eraser size={13} />
              Clear chat
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5
              rounded-lg bg-red-50 border border-red-200 text-[12px]">
              <span className="text-red-700 font-medium">
                Delete all messages?
              </span>
              <button
                onClick={handleClearChat}
                disabled={clearing}
                className="px-2.5 py-1 rounded-lg bg-red-500
                  text-white font-semibold hover:bg-red-600
                  disabled:opacity-40 text-[11px]">
                {clearing ? '...' : 'Yes, clear'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 rounded-lg border
                  border-red-200 text-red-600 hover:bg-red-100
                  text-[11px]">
                Cancel
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-[var(--color-border)]" />

          {pinnedMessages.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1.5
              rounded-lg bg-yellow-50 border border-yellow-200
              text-[11px] text-yellow-700 font-medium">
              <Pin size={11} />
              {pinnedMessages.length} pinned
            </span>
          )}

          {favouriteIds.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1.5
              rounded-lg bg-amber-50 border border-amber-200
              text-[11px] text-amber-700 font-medium">
              <Star size={11} />
              {favouriteIds.length} starred
            </span>
          )}
        </div>

        {/* Pinned strip */}
        {pinnedMessages.length > 0 && (
          <div className="px-4 py-2 bg-yellow-50 border-b
            border-yellow-100 space-y-1">
            {pinnedMessages.map(pm => (
              <div key={pm.id}
                className="flex items-start gap-2 text-[12px]
                  text-yellow-800">
                <Pin size={11} className="mt-0.5 flex-shrink-0
                  text-yellow-600" />
                <span className="truncate">{pm.body}</span>
              </div>
            ))}
          </div>
        )}

        {/* Thread messages */}
        <div className="p-4 space-y-3 min-h-[300px] max-h-[400px]
          overflow-y-auto">
          {threadLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{
                  borderColor: `${accentColor}20`,
                  borderTopColor: accentColor,
                }} />
            </div>
          ) : thread.length === 0 ? (
            <div className="flex flex-col items-center justify-center
              py-10 gap-2 text-[var(--color-text-muted)]">
              <MessageSquare size={24} className="opacity-30" />
              <p className="text-[13px]">No messages yet</p>
            </div>
          ) : (
            thread.map((t, i) => {
              // ✅ KEY FIX: use my_id from the message itself
              const isMine    = t.from_id === t.my_id
              const isEditing = editingId === t.id
              const isPinned  = pinnedIds.includes(t.id)
              const isFav     = favouriteIds.includes(t.id)
              const rc        = ROLE_COLORS[t.from_role] || ROLE_COLORS.teacher

              return (
                <div key={i}
                  className={`flex gap-2
                    ${isMine ? 'flex-row-reverse' : ''}`}>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center
                    justify-center text-[11px] font-bold flex-shrink-0
                    ${isMine
                      ? `${ROLE_COLORS[myRole]?.bg || 'bg-gray-100'}
                         ${ROLE_COLORS[myRole]?.text || 'text-gray-700'}`
                      : `${rc.bg} ${rc.text}`
                    }`}>
                    {t.from_initials || t.from_name?.[0]}
                  </div>

                  {/* Bubble + actions */}
                  <div className={`max-w-[75%] flex flex-col gap-1
                    ${isMine ? 'items-end' : 'items-start'}`}>

                    {isEditing ? (
                      /* Edit mode */
                      <div className="w-full min-w-[220px]">
                        <textarea rows={3} value={editBody}
                          onChange={e => setEditBody(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl
                            border-2 text-[13px] resize-none
                            focus:outline-none bg-white"
                          style={{ borderColor: accentColor }} />
                        <div className="flex gap-2 mt-1 justify-end">
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditBody('')
                            }}
                            className="flex items-center gap-1 px-3 py-1.5
                              rounded-lg text-[12px] border
                              border-[var(--color-border)]
                              text-[var(--color-text-muted)]
                              hover:bg-[var(--color-bg)]">
                            <X size={12} /> Cancel
                          </button>
                          <button
                            onClick={() => handleEdit(t.id)}
                            disabled={editSaving || !editBody.trim()}
                            className="flex items-center gap-1 px-3 py-1.5
                              rounded-lg text-[12px] text-white
                              disabled:opacity-40"
                            style={{ background: accentColor }}>
                            <Check size={12} />
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal bubble */
                      <div className="relative group">
                        <div className={`px-4 py-3 rounded-2xl
                          text-[13px] leading-relaxed ${
                          isMine
                            ? 'text-white rounded-tr-sm'
                            : 'bg-[var(--color-bg)] text-[var(--color-text)] rounded-tl-sm border border-[var(--color-border)]'
                        }`}
                          style={isMine ? { background: accentColor } : {}}>

                          {/* Pin/Fav icons on bubble */}
                          {(isPinned || isFav) && (
                            <div className="flex gap-1 mb-1">
                              {isPinned && (
                                <Pin size={10} className={
                                  isMine
                                    ? 'text-white/70'
                                    : 'text-yellow-500'
                                } />
                              )}
                              {isFav && (
                                <Star size={10} className={
                                  isMine
                                    ? 'text-white/70'
                                    : 'text-amber-500'
                                } />
                              )}
                            </div>
                          )}

                          <p>{t.body}</p>

                          {t.edited && (
                            <span className={`text-[10px] italic ${
                              isMine
                                ? 'text-white/50'
                                : 'text-[var(--color-text-muted)]'
                            }`}> (edited)</span>
                          )}

                          <p className={`text-[10px] mt-1.5 ${
                            isMine
                              ? 'text-white/60'
                              : 'text-[var(--color-text-muted)]'
                          }`}>
                            {t.from_name} · {timeAgo(t.created_at)}
                          </p>
                        </div>

                        {/* Hover action toolbar */}
                        <div className={`absolute -top-9
                          ${isMine ? 'right-0' : 'left-0'}
                          hidden group-hover:flex gap-0.5
                          bg-white border border-[var(--color-border)]
                          rounded-xl shadow-md px-1.5 py-1 z-10`}>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopy(t.id, t.body)}
                            className="p-1.5 rounded-lg
                              hover:bg-gray-100 transition-colors"
                            title={copiedId === t.id
                              ? 'Copied!' : 'Copy'}>
                            <Copy size={13} className={
                              copiedId === t.id
                                ? 'text-green-500'
                                : 'text-[var(--color-text-muted)]'
                            } />
                          </button>

                          {/* Pin */}
                          <button
                            onClick={() => handleTogglePin(t.id)}
                            className="p-1.5 rounded-lg
                              hover:bg-yellow-50 transition-colors"
                            title={isPinned ? 'Unpin' : 'Pin'}>
                            <Pin size={13} className={
                              isPinned
                                ? 'text-yellow-500'
                                : 'text-[var(--color-text-muted)]'
                            } />
                          </button>

                          {/* Star */}
                          <button
                            onClick={() => handleToggleFavourite(t.id)}
                            className="p-1.5 rounded-lg
                              hover:bg-amber-50 transition-colors"
                            title={isFav ? 'Unstar' : 'Star'}>
                            <Star size={13} className={
                              isFav
                                ? 'text-amber-500'
                                : 'text-[var(--color-text-muted)]'
                            } />
                          </button>

                          {/* Forward */}
                          <button
                            onClick={() => setForwardMsg(t)}
                            className="p-1.5 rounded-lg
                              hover:bg-blue-50 transition-colors"
                            title="Forward">
                            <Forward size={13}
                              className="text-[var(--color-text-muted)]" />
                          </button>

                          {/* Edit — own messages only */}
                          {isMine && (
                            <button
                              onClick={() => {
                                setEditingId(t.id)
                                setEditBody(t.body)
                              }}
                              className="p-1.5 rounded-lg
                                hover:bg-green-50 transition-colors"
                              title="Edit">
                              <Pencil size={13}
                                className="text-green-600" />
                            </button>
                          )}

                          {/* Delete — own messages only */}
                          {isMine && (
                            <button
                              onClick={() => setConfirmDeleteId(t.id)}
                              className="p-1.5 rounded-lg
                                hover:bg-red-50 transition-colors"
                              title="Delete">
                              <Trash2 size={13}
                                className="text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delete confirmation */}
                    {confirmDeleteId === t.id && (
                      <div className="flex items-center gap-2 px-3 py-2
                        rounded-xl bg-red-50 border border-red-200
                        text-[12px]">
                        <span className="text-red-700 font-medium">
                          Delete this message?
                        </span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deleting}
                          className="px-2.5 py-1 rounded-lg bg-red-500
                            text-white font-semibold hover:bg-red-600
                            disabled:opacity-40">
                          {deleting ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg border
                            border-red-200 text-red-600
                            hover:bg-red-100">
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={threadEndRef} />
        </div>

        {/* Reply box */}
        <div className="border-t border-[var(--color-border)] p-4">
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Type a reply..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border-2
                border-[var(--color-border)] bg-white text-[13px]
                focus:outline-none transition-all"
              onFocus={e => e.target.style.borderColor = accentColor}
              onBlur={e => e.target.style.borderColor = ''} />
            <button type="submit"
              disabled={sending || !reply.trim()}
              className="px-4 py-2.5 rounded-xl text-white
                text-[13px] font-semibold transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center gap-2"
              style={{ background: accentColor }}>
              <Send size={14} />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </SectionCard>
    </>
  )
}