import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Overview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await api.summary()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Portfolio Overview</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4 shadow">
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-700"></div>
              <div className="mt-2 h-6 w-24 animate-pulse rounded bg-neutral-700"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Portfolio Overview</h1>
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
          <p className="text-rose-400">Error loading data: {error}</p>
        </div>
      </section>
    )
  }

  const kpis = [
    { label: 'Total Value', value: `₹${data?.totalValue?.toLocaleString() || '0'}` },
    { label: 'Invested Capital', value: `₹${data?.invested?.toLocaleString() || '0'}` },
    { label: 'Unrealized P&L', value: `${data?.pnl >= 0 ? '+' : ''}₹${data?.pnl?.toLocaleString() || '0'}` },
    { label: 'Absolute Return', value: `${data?.absoluteReturnPct >= 0 ? '+' : ''}${data?.absoluteReturnPct?.toFixed(2) || '0'}%` },
  ]

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-amber-400">Portfolio Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4 shadow">
            <p className="text-sm text-neutral-400">{k.label}</p>
            <p className={`mt-2 text-xl font-semibold ${i === 2 || i === 3 ? (data?.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-amber-300'}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>
      
      {data?.best && data?.worst && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
            <h2 className="mb-2 text-sm font-medium text-neutral-300">Best Performer</h2>
            <p className="font-medium text-amber-300">{data.best.symbol}</p>
            <p className="text-emerald-400">+₹{data.best.pnl?.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
            <h2 className="mb-2 text-sm font-medium text-neutral-300">Worst Performer</h2>
            <p className="font-medium text-amber-300">{data.worst.symbol}</p>
            <p className="text-rose-400">₹{data.worst.pnl?.toLocaleString()}</p>
          </div>
        </div>
      )}
    </section>
  )
} 