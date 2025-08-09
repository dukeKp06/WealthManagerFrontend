import { useState, useEffect } from 'react'
import { api } from '../services/api'

function List({ title, items, positive }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
        <h2 className="mb-3 text-sm font-medium text-neutral-300">{title}</h2>
        <p className="text-neutral-400">No data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item.symbol || i} className="flex items-center justify-between rounded bg-neutral-950/60 px-3 py-2">
            <div>
              <span className="font-medium text-amber-300">{item.symbol}</span>
              {item.qty && (
                <span className="ml-2 text-xs text-neutral-400">
                  {item.qty} shares
                </span>
              )}
            </div>
            <div className="text-right">
              <div className={`font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.pnl >= 0 ? '+' : ''}₹{item.pnl?.toLocaleString()}
              </div>
              {item.value && (
                <div className="text-xs text-neutral-400">
                  ₹{item.value?.toLocaleString()}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TopPerformers() {
  const [summaryData, setSummaryData] = useState(null)
  const [holdingsData, setHoldingsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [summary, holdings] = await Promise.all([
          api.summary(),
          api.holdings({ pageSize: 100 }) // Get more holdings for better top/bottom lists
        ])
        setSummaryData(summary)
        setHoldingsData(holdings)
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
        <h1 className="text-2xl font-semibold text-amber-400">Top Performers</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-700 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between rounded bg-neutral-950/60 px-3 py-2">
                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-700"></div>
                    <div className="h-4 w-20 animate-pulse rounded bg-neutral-700"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Top Performers</h1>
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
          <p className="text-rose-400">Error loading data: {error}</p>
        </div>
      </section>
    )
  }

  // Sort holdings by P&L for top gainers and losers
  const sortedHoldings = holdingsData?.items ? [...holdingsData.items].sort((a, b) => b.pnl - a.pnl) : []
  const topGainers = sortedHoldings.filter(h => h.pnl > 0).slice(0, 5)
  const topLosers = sortedHoldings.filter(h => h.pnl < 0).slice(-5).reverse()

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-amber-400">Top Performers</h1>

      {summaryData?.best && summaryData?.worst && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
            <h2 className="mb-2 text-sm font-medium text-neutral-300">Best Overall Performer</h2>
            <div className="flex items-center justify-between rounded bg-neutral-950/60 px-3 py-2">
              <div>
                <span className="font-medium text-amber-300">{summaryData.best.symbol}</span>
                <div className="text-xs text-neutral-400">{summaryData.best.qty} shares</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-emerald-400">+₹{summaryData.best.pnl?.toLocaleString()}</div>
                <div className="text-xs text-neutral-400">₹{summaryData.best.value?.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
            <h2 className="mb-2 text-sm font-medium text-neutral-300">Worst Overall Performer</h2>
            <div className="flex items-center justify-between rounded bg-neutral-950/60 px-3 py-2">
              <div>
                <span className="font-medium text-amber-300">{summaryData.worst.symbol}</span>
                <div className="text-xs text-neutral-400">{summaryData.worst.qty} shares</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-rose-400">₹{summaryData.worst.pnl?.toLocaleString()}</div>
                <div className="text-xs text-neutral-400">₹{summaryData.worst.value?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <List title="Top Gainers" items={topGainers} positive />
        <List title="Top Losers" items={topLosers} />
      </div>

      <p className="text-sm text-neutral-400">
        Performance based on unrealized P&L. Positive values indicate gains, negative values indicate losses.
      </p>
    </section>
  )
} 