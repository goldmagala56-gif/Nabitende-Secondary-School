import { useState, useEffect } from 'react'
import { Download, Printer, FileBarChart, Lock } from 'lucide-react'
import api from '../../api'

export default function AdminReports() {
  const [types, setTypes] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [classes, setClasses] = useState([])

  const [filters, setFilters] = useState({
    from: '', to: '', class_name: '', term: '', academic_year: '',
  })

  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ran, setRan] = useState(false)

  useEffect(() => {
    api.get('/reports/types')
      .then(res => setTypes(res.data.types || []))
      .catch(err => console.error(err))
    api.get('/students/classes')
      .then(res => setClasses(res.data.classes || []))
      .catch(err => console.error(err))
  }, [])

  function selectType(type) {
    if (type.comingSoon) return
    setSelectedType(type)
    setRan(false)
    setRows([])
    setColumns([])
    setError('')
  }

  async function runReport() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/reports/run/${selectedType.id}`, {
        params: Object.fromEntries(
          selectedType.filters
            .filter(f => filters[f])
            .map(f => [f, filters[f]])
        ),
      })
      setColumns(res.data.columns || [])
      setRows(res.data.rows || [])
      setRan(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run report.')
      setRan(false)
    } finally {
      setLoading(false)
    }
  }

  function downloadCsv() {
    const params = new URLSearchParams(
      Object.fromEntries(
        selectedType.filters.filter(f => filters[f]).map(f => [f, filters[f]])
      )
    )
    const base = api.defaults.baseURL?.replace(/\/$/, '') || ''
    const token = localStorage.getItem('educonnect_token')
    // Use a temporary link so the browser handles the download + auth header via fetch
    fetch(`${base}/reports/run/${selectedType.id}/csv?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedType.id}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(() => alert('Failed to download CSV.'))
  }

  const groupedTypes = types.reduce((acc, t) => {
    acc[t.category] = acc[t.category] || []
    acc[t.category].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header — hidden when printing */}
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Reports</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Generate and export reports across the school
          </p>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Report picker */}
        <div className="lg:w-64 flex-shrink-0 space-y-4 print:hidden">
          {Object.entries(groupedTypes).map(([category, list]) => (
            <div key={category}>
              <div className="text-[11px] font-semibold uppercase tracking-wide
                text-[var(--color-text-muted)] mb-1.5 px-1">
                {category}
              </div>
              <div className="space-y-1">
                {list.map(t => (
                  <button key={t.id}
                    onClick={() => selectType(t)}
                    disabled={t.comingSoon}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-medium
                      flex items-center justify-between gap-2 transition-colors ${
                      selectedType?.id === t.id
                        ? 'bg-[#ea580c] text-white'
                        : t.comingSoon
                          ? 'text-[var(--color-text-muted)] cursor-not-allowed opacity-60'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-bg)] border border-[var(--color-border)]'
                    }`}>
                    {t.label}
                    {t.comingSoon && <Lock size={12} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Report panel */}
        <div className="flex-1 min-w-0">
          {!selectedType ? (
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
              p-12 text-center">
              <FileBarChart size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" />
              <p className="text-[13px] text-[var(--color-text-muted)]">
                Pick a report from the left to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="print:block">
                <h2 className="text-[16px] font-semibold text-[var(--color-text)]">
                  {selectedType.label}
                </h2>
                <p className="text-[12px] text-[var(--color-text-muted)]">
                  {selectedType.description}
                </p>
              </div>

              {/* Filters */}
              {selectedType.filters.length > 0 && (
                <div className="flex flex-wrap gap-3 items-end print:hidden">
                  {selectedType.filters.includes('from') && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-[var(--color-text-muted)]">From</label>
                      <input type="date" value={filters.from}
                        onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
                        className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                          bg-white text-[13px] focus:outline-none focus:border-[#ea580c]" />
                    </div>
                  )}
                  {selectedType.filters.includes('to') && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-[var(--color-text-muted)]">To</label>
                      <input type="date" value={filters.to}
                        onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
                        className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                          bg-white text-[13px] focus:outline-none focus:border-[#ea580c]" />
                    </div>
                  )}
                  {selectedType.filters.includes('term') && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-[var(--color-text-muted)]">Term</label>
                      <input type="text" placeholder="e.g. Term 2" value={filters.term}
                        onChange={e => setFilters(f => ({ ...f, term: e.target.value }))}
                        className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                          bg-white text-[13px] focus:outline-none focus:border-[#ea580c] w-32" />
                    </div>
                  )}
                  {selectedType.filters.includes('academic_year') && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-[var(--color-text-muted)]">Year</label>
                      <input type="text" placeholder="e.g. 2026" value={filters.academic_year}
                        onChange={e => setFilters(f => ({ ...f, academic_year: e.target.value }))}
                        className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                          bg-white text-[13px] focus:outline-none focus:border-[#ea580c] w-28" />
                    </div>
                  )}
                  {selectedType.filters.includes('class_name') && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-[var(--color-text-muted)]">Class</label>
                      <select value={filters.class_name}
                        onChange={e => setFilters(f => ({ ...f, class_name: e.target.value }))}
                        className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-border)]
                          bg-white text-[13px] focus:outline-none focus:border-[#ea580c]">
                        <option value="">All classes</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <button onClick={runReport} disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c]
                      text-white text-[13px] font-semibold disabled:opacity-60">
                    {loading ? 'Running...' : 'Run report'}
                  </button>
                </div>
              )}

              {selectedType.filters.length === 0 && !ran && (
                <button onClick={runReport} disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c]
                    text-white text-[13px] font-semibold disabled:opacity-60 print:hidden">
                  {loading ? 'Running...' : 'Run report'}
                </button>
              )}

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200
                  text-[13px] text-red-700 print:hidden">
                  {error}
                </div>
              )}

              {/* Results */}
              {ran && (
                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
                  overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3
                    border-b border-[var(--color-border)] print:hidden">
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {rows.length} row{rows.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={downloadCsv}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                          border-2 border-[var(--color-border)] text-[12px] font-semibold
                          hover:bg-[var(--color-bg)] transition-colors">
                        <Download size={13} /> CSV
                      </button>
                      <button onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                          border-2 border-[var(--color-border)] text-[12px] font-semibold
                          hover:bg-[var(--color-bg)] transition-colors">
                        <Printer size={13} /> Print / PDF
                      </button>
                    </div>
                  </div>

                  {rows.length === 0 ? (
                    <div className="p-8 text-center text-[13px] text-[var(--color-text-muted)]">
                      No data found for the selected filters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                            {columns.map(c => (
                              <th key={c} className="text-left px-4 py-2.5 font-semibold
                                text-[var(--color-text-muted)] whitespace-nowrap">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                          {rows.map((row, i) => (
                            <tr key={i}>
                              {columns.map(c => (
                                <td key={c} className="px-4 py-2.5 text-[var(--color-text)]
                                  whitespace-nowrap">{row[c]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}