import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Overview from './pages/Overview'
import Allocation from './pages/Allocation'
import Holdings from './pages/Holdings'
import Performance from './pages/Performance'
import TopPerformers from './pages/TopPerformers'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Overview />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/holdings" element={<Holdings />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/top-performers" element={<TopPerformers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
