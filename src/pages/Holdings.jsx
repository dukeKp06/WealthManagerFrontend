import { useMemo, useState, useEffect } from 'react'
import { api } from '../services/api'

const columns = [
  { key: 'symbol', label: 'Symbol', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'qty', label: 'Qty', sortable: true },
  { key: 'avg', label: 'Avg Price', sortable: true, isMoney: true },
  { key: 'ltp', label: 'LTP', sortable: true, isMoney: true },
  { key: 'value', label: 'Value', sortable: true, isMoney: true },
  { key: 'pnl', label: 'P&L', sortable: true, isMoney: true },
]

export default function Holdings() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('symbol')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await api.holdings({
          q: query,
          sort: sortBy,
          order: sortDir,
          page,
          pageSize: 50,
        })
        setData(result)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [query, sortBy, sortDir, page])

  function onSort(colKey) {
    if (sortBy === colKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(colKey)
      setSortDir('asc')
    }
    setPage(1) // Reset to first page
  }

  function SortHeader({ col }) {
    const active = sortBy === col.key
    const arrow = !active ? '' : sortDir === 'asc' ? '↑' : '↓'
    return (
      <button
        type="button"
        onClick={() => col.sortable && onSort(col.key)}
        className={`inline-flex items-center gap-1 ${col.sortable ? 'hover:text-amber-300' : ''}`}
        title={col.sortable ? `Sort by ${col.label}` : undefined}
      >
        {col.label}
        {active && <span className="text-amber-400">{arrow}</span>}
      </button>
    )
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Holdings</h1>
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-700"></div>
        <div className="overflow-x-auto rounded-lg border border-amber-500/20">
          <div className="min-w-[720px] w-full p-8">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <div key={j} className="h-4 w-16 animate-pulse rounded bg-neutral-700"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Holdings</h1>
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
          <p className="text-rose-400">Error loading data: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-amber-400">Holdings</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1) // Reset to first page
            }}
            placeholder="Search symbol or name..."
            className="w-full rounded-md border border-amber-500/30 bg-neutral-950 px-3 py-2 text-sm placeholder-neutral-500 outline-none ring-amber-500/30 focus:ring"
          />
        </div>
        <div className="text-xs text-neutral-400">
          {data?.total || 0} result{data?.total === 1 ? '' : 's'}
          {data?.totals && (
            <span className="ml-4">
              Total Value: ₹{data.totals.totalValue?.toLocaleString() || '0'}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-amber-500/20">
        <table className="min-w-[720px] w-full divide-y divide-amber-500/20">
          <thead className="bg-neutral-900/80">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  <SortHeader col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/10 bg-neutral-950/60">
            {data?.items?.map((row) => (
              <tr key={row.symbol} className="hover:bg-neutral-900/60">
                <td className="px-4 py-3 font-medium text-amber-300">{row.symbol}</td>
                <td className="px-4 py-3 text-neutral-300">{row.name}</td>
                <td className="px-4 py-3">{row.qty}</td>
                <td className="px-4 py-3">₹{row.avg?.toFixed(2)}</td>
                <td className="px-4 py-3">₹{row.ltp?.toFixed(2)}</td>
                <td className="px-4 py-3">₹{row.value?.toLocaleString()}</td>
                <td className={`px-4 py-3 ${row.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {row.pnl >= 0 ? '+' : ''}₹{row.pnl?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.total > 50 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded bg-amber-500/10 px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-neutral-400">
            Page {page} of {Math.ceil(data.total / 50)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 50)}
            className="rounded bg-amber-500/10 px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <p className="text-sm text-neutral-400">
        Search filters by symbol/name. Click column headers to sort. Data refreshes automatically.
      </p>
    </section>
  )
} 