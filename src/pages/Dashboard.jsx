import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Legend } from 'recharts'
import { api } from '../services/api'

const COLORS = ['#f59e0b', '#d97706', '#a16207', '#92400e', '#fbbf24', '#fcd34d', '#fde68a']

// Custom tooltip for pie chart
function PieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded border border-amber-500/30 bg-neutral-900 p-2 shadow-lg">
        <p className="text-xs font-medium text-amber-300">{data.label}</p>
        <p className="text-xs text-neutral-200">₹{data.value?.toLocaleString()}</p>
        <p className="text-xs text-neutral-200">{data.percent?.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState(null)
  const [allocationData, setAllocationData] = useState(null)
  const [holdingsData, setHoldingsData] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true)
        const [summary, allocation, holdings, performance] = await Promise.all([
          api.summary(),
          api.allocation({ groupBy: 'sector', topN: 6 }),
          api.holdings({ pageSize: 10, sort: 'value', order: 'desc' }),
          api.performance({ period: '6M', benchmarks: 'Nifty 50' })
        ])
        
        setSummaryData(summary)
        setAllocationData(allocation)
        setHoldingsData(holdings)
        setPerformanceData(performance)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Portfolio Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-800"></div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-neutral-800"></div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Portfolio Dashboard</h1>
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
          <p className="text-rose-400">Error loading dashboard: {error}</p>
        </div>
      </section>
    )
  }

  // Prepare KPI data
  const kpis = [
    { label: 'Total Value', value: `₹${summaryData?.totalValue?.toLocaleString() || '0'}` },
    { label: 'Invested Capital', value: `₹${summaryData?.invested?.toLocaleString() || '0'}` },
    { label: 'Unrealized P&L', value: `${summaryData?.pnl >= 0 ? '+' : ''}₹${summaryData?.pnl?.toLocaleString() || '0'}` },
    { label: 'Absolute Return', value: `${summaryData?.absoluteReturnPct >= 0 ? '+' : ''}${summaryData?.absoluteReturnPct?.toFixed(2) || '0'}%` },
  ]

  // Prepare performance chart data
  const chartData = performanceData?.dates?.map((date, i) => {
    const point = { date }
    if (performanceData.portfolio[i]) {
      point.Portfolio = performanceData.portfolio[i].value
    }
    Object.entries(performanceData.benchmarks || {}).forEach(([name, series]) => {
      if (series[i]) {
        point[name] = series[i].value
      }
    })
    return point
  }) || []

  // Top performers
  const sortedHoldings = holdingsData?.items ? [...holdingsData.items].sort((a, b) => b.pnl - a.pnl) : []
  const topGainers = sortedHoldings.filter(h => h.pnl > 0).slice(0, 3)
  const topLosers = sortedHoldings.filter(h => h.pnl < 0).slice(-3).reverse()

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-amber-400">Portfolio Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4 shadow">
            <p className="text-sm text-neutral-400">{k.label}</p>
            <p className={`mt-2 text-xl font-semibold ${i === 2 || i === 3 ? (summaryData?.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-amber-300'}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Allocation Pie Chart */}
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-4 text-lg font-medium text-amber-300">Asset Allocation by Sector</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={allocationData?.items || []} 
                  dataKey="value" 
                  nameKey="label" 
                  innerRadius={50} 
                  outerRadius={90}
                  cx="50%"
                  cy="50%"
                >
                  {(allocationData?.items || []).map((_, i) => (
                    <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-4 text-lg font-medium text-amber-300">Performance vs Benchmark (6M)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#d1d5db"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis 
                  stroke="#d1d5db"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#171717', 
                    border: '1px solid rgba(245, 158, 11, 0.3)', 
                    color: '#fbbf24',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [`${Number(value).toFixed(1)}`, name]}
                />
                <Legend wrapperStyle={{ color: '#fbbf24', fontSize: '12px' }} />
                
                <Line 
                  type="monotone" 
                  dataKey="Portfolio" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={false}
                />
                
                {Object.keys(performanceData?.benchmarks || {}).map((benchName) => (
                  <Line
                    key={benchName}
                    type="monotone"
                    dataKey={benchName}
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings and Performers */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Holdings */}
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-4 text-lg font-medium text-amber-300">Top Holdings</h2>
          <div className="space-y-2">
            {holdingsData?.items?.slice(0, 5).map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between rounded bg-neutral-950/60 px-3 py-2">
                <div>
                  <span className="font-medium text-amber-300">{holding.symbol}</span>
                  <div className="text-xs text-neutral-400">{holding.qty} shares</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-neutral-200">₹{holding.value?.toLocaleString()}</div>
                  <div className={`text-xs ${holding.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Gainers */}
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-4 text-lg font-medium text-amber-300">Top Gainers</h2>
          <div className="space-y-2">
            {topGainers.map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between rounded bg-neutral-950/60 px-3 py-2">
                <span className="font-medium text-amber-300">{holding.symbol}</span>
                <span className="text-sm font-medium text-emerald-400">
                  +₹{holding.pnl?.toLocaleString()}
                </span>
              </div>
            ))}
            {topGainers.length === 0 && (
              <p className="text-sm text-neutral-400">No gainers found</p>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-4 text-lg font-medium text-amber-300">Top Losers</h2>
          <div className="space-y-2">
            {topLosers.map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between rounded bg-neutral-950/60 px-3 py-2">
                <span className="font-medium text-amber-300">{holding.symbol}</span>
                <span className="text-sm font-medium text-rose-400">
                  ₹{holding.pnl?.toLocaleString()}
                </span>
              </div>
            ))}
            {topLosers.length === 0 && (
              <p className="text-sm text-neutral-400">No losers found</p>
            )}
          </div>
        </div>
      </div>

      {/* Allocation Breakdown */}
      {allocationData?.items && allocationData.items.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-4 text-lg font-medium text-amber-300">Sector Allocation Breakdown</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allocationData.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded bg-neutral-950/60 px-3 py-2">
                <span className="text-amber-300">{item.label}</span>
                <div className="text-right text-sm">
                  <div className="text-neutral-200">₹{item.value?.toLocaleString()}</div>
                  <div className="text-neutral-400">{item.percent?.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-400">
        Dashboard shows real-time portfolio data. Navigate to individual pages for detailed analysis and controls.
      </p>
    </section>
  )
} 