const API_BASE = import.meta.env.VITE_API_URL || 'https://wealthmanagerbackend-5z9f.onrender.com/api/portfolio'

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}

export const api = {
  // GET /api/health
  health: () => fetchApi('/health'),
  
  // GET /api/summary
  summary: () => fetchApi('/summary'),
  
  // GET /api/holdings?q=&sort=&order=&page=&pageSize=
  holdings: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, String(value))
      }
    })
    const endpoint = `/holdings${query.toString() ? `?${query}` : ''}`
    return fetchApi(endpoint)
  },
  
  // GET /api/allocation?groupBy=&topN=
  allocation: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, String(value))
      }
    })
    const endpoint = `/allocation${query.toString() ? `?${query}` : ''}`
    return fetchApi(endpoint)
  },
  
  // GET /api/performance?period=&benchmarks=
  performance: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, String(value))
      }
    })
    const endpoint = `/performance${query.toString() ? `?${query}` : ''}`
    return fetchApi(endpoint)
  },
} 