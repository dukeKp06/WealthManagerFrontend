import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from 'recharts'
import { api } from '../services/api'

const COLORS = ['#f59e0b', '#d97706', '#a16207', '#92400e', '#fbbf24', '#fcd34d', '#fde68a'] // amber/gold spectrum

const groupOptions = [
  { value: 'assetClass', label: 'Asset Class' },
  { value: 'sector', label: 'Sector' },
  { value: 'type', label: 'Market Cap' },
]

// Custom tooltip component for pie chart
function PieTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded border border-amber-500/30 bg-neutral-900 p-3 shadow-lg">
        <p className="font-medium text-amber-300">{data.label}</p>
        <p className="text-sm text-neutral-200">Value: ₹{data.value?.toLocaleString()}</p>
        <p className="text-sm text-neutral-200">Percentage: {data.percent?.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export default function Allocation() {
  const [groupBy, setGroupBy] = useState('sector')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await api.allocation({ groupBy, topN: 10 })
        setData(result)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [groupBy])

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Asset Allocation</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-700 mb-4"></div>
              <div className="h-72 animate-pulse rounded bg-neutral-800"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold text-amber-400">Asset Allocation</h1>
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
          <p className="text-rose-400">Error loading data: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-amber-400">Asset Allocation</h1>
        <div className="flex gap-2">
          {groupOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                groupBy === opt.value
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {data?.totalValue && (
        <div className="text-sm text-neutral-400">
          Total Portfolio Value: ₹{data.totalValue.toLocaleString()}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-2 text-sm font-medium text-neutral-300">
            By {groupOptions.find((o) => o.value === groupBy)?.label} (Pie Chart)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data?.items || []} 
                  dataKey="value" 
                  nameKey="label" 
                  innerRadius={60} 
                  outerRadius={100}
                  cx="50%"
                  cy="50%"
                >
                  {(data?.items || []).map((_, i) => (
                    <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h2 className="mb-2 text-sm font-medium text-neutral-300">
            By {groupOptions.find((o) => o.value === groupBy)?.label} (Bar Chart)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.items || []}>
                <XAxis dataKey="label" stroke="#d1d5db" />
                <YAxis 
                  stroke="#d1d5db" 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#171717', 
                    border: '1px solid rgba(245, 158, 11, 0.3)', 
                    color: '#fbbf24',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${Number(value).toFixed(2)}%`, 'Percentage']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="percent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {data?.items && data.items.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-300">Allocation Breakdown</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
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
    </section>
  )
} 