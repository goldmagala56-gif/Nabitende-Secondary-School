import { useState, useEffect } from 'react'
import { Users, Search, UserPlus, X, ChevronDown, Plus, Trash2 } from 'lucide-react'
import api from '../../api'
import PageShell from '../../components/PageShell'
import SectionCard from '../../components/SectionCard'
import StatCard from '../../components/StatCard'
import { useNavigate } from 'react-router-dom'

export default function AdminStudents() {
  const [students,     setStudents]     = useState([])
  const [classes,      setClasses]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [filterClass,  setFilterClass]  = useState('All')
  const [filterGender, setFilterGender] = useState('All')
  const [showForm,     setShowForm]     = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const navigate = useNavigate()
  const [showAddClass, setShowAddClass] = useState(false)
  const [form,         setForm]         = useState({
    full_name: '', class_name: '', gender: 'Male', date_of_birth: ''
  })

  useEffect(() => {
    fetchClasses()
    fetchStudents()
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [filterClass])

  async function fetchClasses() {
    try {
      const res = await api.get('/students/classes')
      const fetched = res.data.classes || []
      setClasses(fetched)
      // Set default class for form
      if (fetched.length > 0) {
        setForm(f => ({ ...f, class_name: fetched[0] }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchStudents() {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filterClass !== 'All') params.class = filterClass
      if (search) params.search = search
      const res = await api.get('/students', { params })
      setStudents(res.data.students || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnrol(e) {
    e.preventDefault()
    if (!form.class_name) {
      alert('Please select or add a class first.')
      return
    }
    setSaving(true)
    try {
      const res = await api.post('/students', form)
      setStudents(prev => [res.data.student, ...prev])
      // Add class to list if it's new
      if (!classes.includes(form.class_name)) {
        setClasses(prev => [...prev, form.class_name].sort())
      }
      setShowForm(false)
      setForm(f => ({ ...f, full_name: '', admission_number: '', date_of_birth: '' }))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enrol student.')
    } finally {
      setSaving(false)
    }
  }

  function handleAddClass() {
    const trimmed = newClassName.trim().toUpperCase()
    if (!trimmed) return
    if (classes.includes(trimmed)) {
      alert(`Class ${trimmed} already exists.`)
      return
    }
    setClasses(prev => [...prev, trimmed].sort())
    setForm(f => ({ ...f, class_name: trimmed }))
    setNewClassName('')
    setShowAddClass(false)
  }

  function handleRemoveClass(cls) {
    if (students.some(s => s.class_name === cls)) {
      alert(`Cannot remove ${cls} — it still has enrolled students.`)
      return
    }
    setClasses(prev => prev.filter(c => c !== cls))
    if (filterClass === cls) setFilterClass('All')
    if (form.class_name === cls) {
      setForm(f => ({ ...f, class_name: classes[0] || '' }))
    }
  }

  const filtered = students.filter(s =>
  (s.full_name.toLowerCase().includes(search.toLowerCase()) ||
   s.admission_number.toLowerCase().includes(search.toLowerCase())) &&
  (filterGender === 'All' || s.gender === filterGender)
)

  return (
    <PageShell
      title="Students"
      subtitle={`${students.length} enrolled · Term 2, 2026`}
      actions={
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-[#1a6b4a] hover:bg-[#15573c] text-white text-[13px]
            font-semibold transition-colors">
          <UserPlus size={16} />
          Enrol student
        </button>
      }
    >

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total students" value={students.length}                               color="#1a6b4a" icon={Users} sub="enrolled this term"  />
        <StatCard label="Male"           value={students.filter(s => s.gender === 'Male').length}   color="#2563eb" icon={Users} sub="male students"       />
        <StatCard label="Female"         value={students.filter(s => s.gender === 'Female').length} color="#7c3aed" icon={Users} sub="female students"     />
        <StatCard label="Classes"        value={classes.length}                                color="#f59e0b" icon={Users} sub="active streams"      />
      </div>

      {/* Class manager */}
      <SectionCard title="Class streams">
        <div className="flex flex-wrap gap-2 mb-3">
          {classes.map(cls => (
            <div key={cls}
              className="flex items-center gap-1.5 px-3 py-1.5
                rounded-full bg-[#1a6b4a]/10 border border-[#1a6b4a]/20">
              <span className="text-[12px] font-semibold text-[#1a6b4a]">
                {cls}
              </span>
              <button
                onClick={() => handleRemoveClass(cls)}
                className="text-[#1a6b4a]/50 hover:text-red-500
                  transition-colors">
                <X size={12} />
              </button>
            </div>
          ))}
          {classes.length === 0 && (
            <span className="text-[13px] text-[var(--color-text-muted)]">
              No classes yet. Add one below.
            </span>
          )}
        </div>

        {/* Add new class */}
        {showAddClass ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddClass()}
              placeholder="e.g. S.1A or S.5 Science"
              className="flex-1 px-3.5 py-2 rounded-xl border-2
                border-[var(--color-border)] bg-white text-[13px]
                focus:outline-none focus:border-[#1a6b4a] transition-all"
              autoFocus
            />
            <button onClick={handleAddClass}
              className="px-4 py-2 rounded-xl bg-[#1a6b4a]
                text-white text-[13px] font-semibold
                hover:bg-[#15573c] transition-colors">
              Add
            </button>
            <button onClick={() => setShowAddClass(false)}
              className="px-4 py-2 rounded-xl border-2
                border-[var(--color-border)] text-[13px]
                font-semibold hover:bg-[var(--color-bg)]
                transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddClass(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
              border-2 border-dashed border-[#1a6b4a]/30
              text-[#1a6b4a] text-[13px] font-semibold
              hover:border-[#1a6b4a] hover:bg-[#1a6b4a]/5
              transition-all mt-1">
            <Plus size={15} />
            Add class stream
          </button>
        )}
      </SectionCard>

      {/* Enrol form */}
      {showForm && (
        <SectionCard title="Enrol new student">
          <form onSubmit={handleEnrol} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Full name</label>
                <input type="text" required
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. David Ssemanda"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Admission number</label>
                <input type="text" required
                  value={form.admission_number}
                  onChange={e => setForm(f => ({ ...f, admission_number: e.target.value }))}
                  placeholder="e.g. SMC/2026/0001"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Class</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select value={form.class_name}
                      onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))}
                      className="w-full appearance-none px-3.5 py-2.5
                        rounded-xl border-2 border-[var(--color-border)]
                        bg-white text-[14px]
                        focus:outline-none focus:border-[#1a6b4a]
                        transition-all">
                      <option value="">Select class...</option>
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3
                      top-1/2 -translate-y-1/2
                      text-[var(--color-text-muted)]
                      pointer-events-none" />
                  </div>
                  <button type="button"
                    onClick={() => setShowAddClass(true)}
                    className="px-3 py-2.5 rounded-xl border-2
                      border-[var(--color-border)] text-[#1a6b4a]
                      hover:bg-[#1a6b4a]/5 transition-colors"
                    title="Add new class">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Gender</label>
                <div className="relative">
                  <select value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full appearance-none px-3.5 py-2.5
                      rounded-xl border-2 border-[var(--color-border)]
                      bg-white text-[14px]
                      focus:outline-none focus:border-[#1a6b4a]
                      transition-all">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3
                    top-1/2 -translate-y-1/2
                    text-[var(--color-text-muted)]
                    pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold
                  text-[var(--color-text)] mb-1.5">Date of birth</label>
                <input type="date"
                  value={form.date_of_birth}
                  onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2
                    border-[var(--color-border)] bg-white text-[14px]
                    focus:outline-none focus:border-[#1a6b4a]
                    transition-all" />
              </div>

            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border-2
                  border-[var(--color-border)] text-[13px] font-semibold
                  text-[var(--color-text)]
                  hover:bg-[var(--color-bg)] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#1a6b4a]
                  hover:bg-[#15573c] text-white text-[13px]
                  font-semibold transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Enrol student'}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Search + filter */}
      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search size={25} className="absolute right-5.5 top-1/2
            -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStudents()}
            placeholder="Search by name or admission number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 margin-top-5
              border-[var(--color-border)] bg-white  text-[14px]
              focus:outline-none focus:border-[#1a6b4a]
              focus:ring-4 focus:ring-[#1a6b4a]/10 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterClass('All')}
            className={`px-3 py-1.5 rounded-full text-[12px]
              font-semibold border-2 transition-colors ${
              filterClass === 'All'
                ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}>
            All
          </button>
          {classes.map(c => (
            <button key={c}
              onClick={() => setFilterClass(c)}
              className={`px-3 py-1.5 rounded-full text-[12px]
                font-semibold border-2 transition-colors ${
                filterClass === c
                  ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
              {c}
            </button>
            
          ))}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Male', 'Female'].map(g => (
              <button key={g}
                onClick={() => setFilterGender(g)}
                className={`px-3 py-1.5 rounded-full text-[12px]
                  font-semibold border-2 transition-colors ${
                  filterGender === g
                    ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students table */}
      <SectionCard title={`${filtered.length} students`} noPadding>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#1a6b4a]/20
              border-t-[#1a6b4a] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-[13px]">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[13px]
            text-[var(--color-text-muted)]">
            No students found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]
                  bg-[var(--color-bg)]">
                  {['#', 'Name', 'Adm. No', 'Class', 'Gender', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px]
                      font-semibold text-[var(--color-text-muted)]
                      uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((s, i) => (
                  <tr key={s.id}
                    className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-4 py-3 text-[12px]
                      text-[var(--color-text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-[var(--color-text)] cursor-pointer
                      hover:text-[#1a6b4a] transition-colors"
                      onClick={() => navigate(`/admin/students/${s.id}`)}>
                      {s.full_name}
                    </td>
                    <td className="px-4 py-3 text-[12px]
                      text-[var(--color-text-muted)]">
                      {s.admission_number}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold
                        px-2.5 py-1 rounded-full
                        bg-[#1a6b4a]/10 text-[#1a6b4a]">
                        {s.class_name}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 text-[12px]
                      text-[var(--color-text-muted)]">{s.gender}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold
                        px-2.5 py-1 rounded-full border ${
                        s.is_active
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}