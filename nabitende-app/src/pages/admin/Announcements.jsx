import { useState, useEffect } from 'react'
import { categoryStyle } from '../../data/communicationData'
import api from '../../api'
import { Plus, Pin, Users, Calendar, X, Send, Pencil, Trash2 } from 'lucide-react'
const categories = ['Academic', 'Finance', 'Event', 'Staff', 'Students']
const targets    = ['All', 'Teachers', 'Parents', 'Students']

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function AdminAnnouncements() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState('All')
  const [form, setForm]         = useState({
    title: '', body: '', category: 'Academic', target: 'All', pinned: false
  })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', body: '', category: 'Academic', target: 'All', pinned: false })

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

  async function handlePost() {
    if (!form.title.trim() || !form.body.trim()) return
    try {
      await api.post('/announcements', {
        title: form.title,
        body: form.body,
        category: form.category,
        audience: form.target.toLowerCase(),
        pinned: form.pinned,
      })
      setForm({ title: '', body: '', category: 'Academic', target: 'All', pinned: false })
      setShowForm(false)
      loadAnnouncements()
    } catch (err) {
      console.error('Failed to post announcement:', err)
    }
  }
  function startEdit(item) {
  setEditingId(item.id)
  setEditForm({
    title: item.title,
    body: item.body,
    category: item.category,
    target: item.audience.charAt(0).toUpperCase() + item.audience.slice(1),
    pinned: item.pinned,
  })
}

function cancelEdit() {
  setEditingId(null)
}

async function saveEdit(id) {
  if (!editForm.title.trim() || !editForm.body.trim()) return
  try {
    await api.patch(`/announcements/${id}`, {
      title: editForm.title,
      body: editForm.body,
      category: editForm.category,
      audience: editForm.target.toLowerCase(),
      pinned: editForm.pinned,
    })
    setEditingId(null)
    loadAnnouncements()
  } catch (err) {
    console.error('Failed to edit announcement:', err)
    alert(err.response?.data?.error || 'Failed to save changes.')
  }
}

async function handleDelete(id) {
  if (!window.confirm('Delete this announcement? This cannot be undone.')) return
  try {
    await api.delete(`/announcements/${id}`)
    loadAnnouncements()
  } catch (err) {
    console.error('Failed to delete announcement:', err)
    alert(err.response?.data?.error || 'Failed to delete.')
  }
}
  const filtered = filter === 'All'
    ? items
    : items.filter(a => capitalize(a.audience) === filter || a.audience === 'all')

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Announcements</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Post and manage school notices
          </p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg
            bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[13px] font-medium
            transition-colors">
          <Plus size={16} />
          New announcement
        </button>
      </div>

      {/* Compose form */}
      {showForm && (
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[var(--color-text)]">New announcement</h2>
            <button onClick={() => setShowForm(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Announcement title"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)]
                bg-[var(--color-bg)] text-[14px] text-[var(--color-text)]
                placeholder:text-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[#1a6b4a]/30 focus:border-[#1a6b4a]"
            />
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write your announcement here…"
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)]
                bg-[var(--color-bg)] text-[14px] text-[var(--color-text)]
                placeholder:text-[var(--color-text-muted)] resize-none
                focus:outline-none focus:ring-2 focus:ring-[#1a6b4a]/30 focus:border-[#1a6b4a]"
            />
            <div className="flex flex-wrap gap-3">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-surface)] text-[13px] text-[var(--color-text)]
                  focus:outline-none focus:ring-2 focus:ring-[#1a6b4a]/30 focus:border-[#1a6b4a]">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select
                value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-surface)] text-[13px] text-[var(--color-text)]
                  focus:outline-none focus:ring-2 focus:ring-[#1a6b4a]/30 focus:border-[#1a6b4a]">
                {targets.map(t => <option key={t}>{t}</option>)}
              </select>
              <label className="flex items-center gap-2 cursor-pointer text-[13px]
                text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  className="w-4 h-4 accent-[#1a6b4a]"
                />
                Pin to top
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handlePost}
                disabled={!form.title.trim() || !form.body.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                  bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[13px] font-medium
                  transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Send size={15} />
                Post announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...targets.filter(t => t !== 'All')].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium
              border transition-colors ${
              filter === t
                ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Announcements list */}
      {loading ? (
        <p className="text-[13px] text-[var(--color-text-muted)]">Loading announcements…</p>
      ) : filtered.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-muted)]">No announcements yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const cs = categoryStyle[a.category] || categoryStyle.Academic
            return (
              <div key={a.id}
                className={`bg-[var(--color-surface)] rounded-lg border p-5
                  ${a.pinned ? 'border-[#1a6b4a]/30' : 'border-[var(--color-border)]'}`}
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                {editingId === a.id ? (
                  <div className="space-y-3">
                    <input
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)]
                        bg-[var(--color-bg)] text-[14px] text-[var(--color-text)] focus:outline-none"
                    />
                    <textarea
                      value={editForm.body}
                      onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)]
                        bg-[var(--color-bg)] text-[14px] text-[var(--color-text)] resize-none focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={cancelEdit}
                        className="px-4 py-2 rounded-lg text-[13px] text-[var(--color-text-muted)]">
                        Cancel
                      </button>
                      <button onClick={() => saveEdit(a.id)}
                        className="px-4 py-2 rounded-lg bg-[#1a6b4a] text-white text-[13px] font-medium">
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {a.pinned && <Pin size={13} className="text-[#1a6b4a] flex-shrink-0" />}
                        <h3 className="text-[14px] font-semibold text-[var(--color-text)]">{a.title}</h3>
                      </div>
                      <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">{a.body}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${categoryStyle[a.category]?.bg || categoryStyle.Academic.bg} ${categoryStyle[a.category]?.text || categoryStyle.Academic.text} ${categoryStyle[a.category]?.border || categoryStyle.Academic.border}`}>
                          {a.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                          <Users size={11} /> {a.audience.charAt(0).toUpperCase() + a.audience.slice(1)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                          <Calendar size={11} /> {new Date(a.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">by {a.author_name || 'School Admin'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(a)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
            )
          })}
        </div>
      )}
    </div>
  )
}