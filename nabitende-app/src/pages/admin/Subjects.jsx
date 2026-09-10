import { useState, useEffect } from 'react'
import {
  BookOpen, Plus, X, Pencil, Trash2,
  CheckCircle2, ChevronDown
} from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import StatCard from '../../components/StatCard'

const CATEGORIES = ['Sciences', 'Languages', 'Humanities', 'Technical', 'Arts']
const LEVELS     = ['O-Level', 'A-Level', 'Both']

const categoryColors = {
  Sciences:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Languages:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  Humanities: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  Technical:  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Arts:       { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200'   },
}

export default function AdminSubjects() {
  const [subjects,     setSubjects]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [editSubject,  setEditSubject]  = useState(null)
  const [filterCat,    setFilterCat]    = useState('All')
  const [filterLevel,  setFilterLevel]  = useState('All')
  const [form,         setForm]         = useState({
    name: '', code: '', category: CATEGORIES[0], level: LEVELS[0]
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  async function fetchSubjects() {
    setLoading(true)
    try {
      const res = await api.get('/subjects')
      setSubjects(res.data.subjects || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editSubject) {
        const res = await api.put(`/subjects/${editSubject.id}`, form)
        setSubjects(prev => prev.map(s =>
          s.id === editSubject.id ? res.data.subject : s
        ))
        setEditSubject(null)
      } else {
        const res = await api.post('/subjects', form)
        setSubjects(prev => [...prev, res.data.subject])
      }
      setShowForm(false)
      setForm({ name: '', code: '', category: CATEGORIES[0], level: LEVELS[0] })
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save subject.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(subject) {
    if (!confirm(`Remove "${subject.name}" from the subject list?`)) return
    try {
      await api.delete(`/subjects/${subject.id}`)
      setSubjects(prev => prev.filter(s => s.id !== subject.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove subject.')
    }
  }

  function handleEdit(subject) {
    setEditSubject(subject)
    setForm({
      name:     subject.name,
      code:     subject.code     || '',
      category: subject.category || CATEGORIES[0],
      level:    subject.level    || LEVELS[0],
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setShowForm(false)
    setEditSubject(null)
    setForm({ name: '', code: '', category: CATEGORIES[0], level: LEVELS[0] })
  }

  // Filter subjects
  const filtered = subjects.filter(s => {
    const matchCat   = filterCat   === 'All' || s.category === filterCat
    const matchLevel = filterLevel === 'All' || s.level    === filterLevel
    return matchCat && matchLevel
  })

  // Group by category for display
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(s => s.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <PageShell
      title="Subjects"
      subtitle={`${subjects.length} subjects offered · Term 2, 2026`}
      actions={
        <button
          onClick={() => { setShowForm(s => !s); setEditSubject(null) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-[#1a6b4a] hover:bg-[#15573c] text-white
            text-[13px] font-semibold transition-colors">
          <Plus size={16} />
          Add subject
        </button>
      }
    >

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total subjects"
          value={subjects.length}
          color="#1a6b4a"
          icon={BookOpen}
          sub="offered this term"
        />
        <StatCard
          label="O-Level"
          value={subjects.filter(s => s.level === 'O-Level').length}
          color="#2563eb"
          icon={BookOpen}
          sub="ordinary level"
        />
        <StatCard
          label="A-Level"
          value={subjects.filter(s => s.level === 'A-Level').length}
          color="#7c3aed"
          icon={BookOpen}
          sub="advanced level"
        />
        <StatCard
          label="Categories"
          value={new Set(subjects.map(s => s.category)).size}
          color="#f59e0b"
          icon={BookOpen}
          sub="subject groups"
        />
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <SectionCard
          title={editSubject ? `Edit — ${editSubject.name}` : 'Add new subject'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">
                  Subject name
                </label>
                <input type="text" required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">
                  Subject code
                  <span className="text-[var(--color-text-muted)]
                    font-normal ml-1">(optional)</span>
                </label>
                <input type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({
                    ...f, code: e.target.value.toUpperCase()
                  }))}
                  placeholder="e.g. MTH"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select value={form.category}
                    onChange={e => setForm(f => ({
                      ...f, category: e.target.value
                    }))}
                    className="w-full appearance-none px-3.5 py-2.5
                      rounded-xl border-2 border-[var(--color-border)]
                      bg-white text-[14px]
                      focus:outline-none focus:border-[#1a6b4a]
                      transition-all">
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
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
                  Level
                </label>
                <div className="relative">
                  <select value={form.level}
                    onChange={e => setForm(f => ({
                      ...f, level: e.target.value
                    }))}
                    className="w-full appearance-none px-3.5 py-2.5
                      rounded-xl border-2 border-[var(--color-border)]
                      bg-white text-[14px]
                      focus:outline-none focus:border-[#1a6b4a]
                      transition-all">
                    {LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3
                    top-1/2 -translate-y-1/2
                    text-[var(--color-text-muted)]
                    pointer-events-none" />
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border-2
                  border-[var(--color-border)] text-[13px]
                  font-semibold text-[var(--color-text)]
                  hover:bg-[var(--color-bg)] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#1a6b4a]
                  hover:bg-[#15573c] text-white text-[13px]
                  font-semibold transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed">
                {saving
                  ? 'Saving...'
                  : editSubject ? 'Update subject' : 'Add subject'
                }
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('All')}
          className={`px-3 py-1.5 rounded-full text-[12px]
            font-semibold border-2 transition-colors ${
            filterCat === 'All'
              ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}>
          All categories
        </button>
        {CATEGORIES.map(cat => {
          const c = categoryColors[cat]
          return (
            <button key={cat}
              onClick={() => setFilterCat(cat === filterCat ? 'All' : cat)}
              className={`px-3 py-1.5 rounded-full text-[12px]
                font-semibold border-2 transition-colors ${
                filterCat === cat
                  ? `${c.bg} ${c.text} ${c.border}`
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
              {cat}
            </button>
          )
        })}
        <div className="ml-auto flex gap-2">
          {['All', 'O-Level', 'A-Level', 'Both'].map(lvl => (
            <button key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-full text-[12px]
                font-semibold border-2 transition-colors ${
                filterLevel === lvl
                  ? 'bg-[#2563eb] text-white border-[#2563eb]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects grouped by category */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
            border-t-[#1a6b4a] rounded-full animate-spin" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <SectionCard>
          <div className="text-center py-10 text-[13px]
            text-[var(--color-text-muted)]">
            No subjects found. Click "Add subject" to get started.
          </div>
        </SectionCard>
      ) : (
        Object.entries(grouped).map(([category, items]) => {
          const c = categoryColors[category] || categoryColors.Sciences
          return (
            <SectionCard
              key={category}
              title={
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1
                    rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                    {category}
                  </span>
                  <span className="text-[13px] font-semibold
                    text-[var(--color-text)]">
                    {items.length} subject{items.length > 1 ? 's' : ''}
                  </span>
                </div>
              }
              noPadding
            >
              <div className="divide-y divide-[var(--color-border)]">
                {items.map(subject => (
                  <div key={subject.id}
                    className="flex items-center gap-4 px-5 py-3
                      hover:bg-[var(--color-bg)] transition-colors">

                    {/* Code badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center
                      justify-center text-[12px] font-bold
                      flex-shrink-0 ${c.bg} ${c.text}`}>
                      {subject.code || subject.name.slice(0, 3).toUpperCase()}
                    </div>

                    {/* Name + level */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold
                        text-[var(--color-text)]">
                        {subject.name}
                      </div>
                      <div className="text-[11px]
                        text-[var(--color-text-muted)] mt-0.5">
                        {subject.level}
                        {subject.code && ` · Code: ${subject.code}`}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-2 rounded-lg border-2
                          border-[var(--color-border)]
                          text-[var(--color-text-muted)]
                          hover:text-[#2563eb] hover:border-blue-200
                          hover:bg-blue-50 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="p-2 rounded-lg border-2
                          border-[var(--color-border)]
                          text-[var(--color-text-muted)]
                          hover:text-red-600 hover:border-red-200
                          hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )
        })
      )}
    </PageShell>
  )
}