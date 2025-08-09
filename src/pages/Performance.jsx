import { useState, useEffect } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { api } from '../services/api'

const periodOptions = [
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: 'MAX', label: 'Max' },
]

const benchmarkOptions = [
  { value: 'Nifty 50', label: 'Nifty 50' },
  { value: 'Gold', label: 'Gold' },
]

export default function Performance() {
  const [period, setPeriod] = useState('6M')
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(['Nifty 50'])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await api.performance({
          period,
          benchmarks: selectedBenchmarks.join(','),
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
  }, [period, selectedBenchmarks])

  const toggleBenchmark = (benchmark) => {
    setSelectedBenchmarks((prev) =>
      prev.includes(benchmark)
        ? prev.filter((b) => b !== benchmark)
        : [...prev, benchmark]
    )
  }

  // Combine portfolio and benchmark data for chart
  const chartData = data?.dates?.map((date, i) => {
    const point = { date }
    if (data.portfolio[i]) {
      point.Portfolio = data.portfolio[i].value
    }
    Object.entries(data.benchmarks || {}).forEach(([name, series]) => {
      if (series[i]) {
        point[name] = series[i].value
      }
    })
    return point
  }) || []

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Performance Comparison</h1>
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-700 mb-4"></div>
          <div className="h-80 animate-pulse rounded bg-neutral-800"></div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Performance Comparison</h1>
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
          <p className="text-rose-400">Error loading data: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-amber-400">Performance Comparison</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <span className="text-sm text-neutral-400">Period:</span>
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                period === opt.value
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-neutral-400">Benchmarks:</span>
          {benchmarkOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleBenchmark(opt.value)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                selectedBenchmarks.includes(opt.value)
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                stroke="#d1d5db"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#d1d5db"
                tickFormatter={(value) => `${value.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#111', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  color: '#fbbf24' 
                }}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value, name) => [`${Number(value).toFixed(2)}`, name]}
              />
              <Legend wrapperStyle={{ color: '#fbbf24' }} />
              
              <Line 
                type="monotone" 
                dataKey="Portfolio" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                dot={false}
                name="Portfolio"
              />
              
              {Object.keys(data?.benchmarks || {}).map((benchName, i) => (
                <Line
                  key={benchName}
                  type="monotone"
                  dataKey={benchName}
                  stroke={i === 0 ? '#eab308' : '#84cc16'}
                  strokeWidth={2}
                  dot={false}
                  name={benchName}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-300">Performance Summary</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded bg-neutral-950/60 p-3">
              <div className="text-sm text-neutral-400">Portfolio</div>
              <div className="text-lg font-semibold text-amber-300">
                {chartData.length > 1 && chartData[0]?.Portfolio && chartData[chartData.length - 1]?.Portfolio
                  ? `${((chartData[chartData.length - 1].Portfolio / chartData[0].Portfolio - 1) * 100).toFixed(2)}%`
                  : 'N/A'}
              </div>
            </div>
            
            {Object.keys(data?.benchmarks || {}).map((benchName) => {
              const firstValue = chartData[0]?.[benchName]
              const lastValue = chartData[chartData.length - 1]?.[benchName]
              const returnPct = firstValue && lastValue ? ((lastValue / firstValue - 1) * 100).toFixed(2) : 'N/A'
              
              return (
                <div key={benchName} className="rounded bg-neutral-950/60 p-3">
                  <div className="text-sm text-neutral-400">{benchName}</div>
                  <div className="text-lg font-semibold text-neutral-200">{returnPct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-400">
        All values normalized to 100 at the start of the period. Select period and benchmarks to compare performance.
      </p>
    </section>
  )
} 