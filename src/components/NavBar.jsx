import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/', label: 'Overview' },
  { to: '/allocation', label: 'Allocation' },
  { to: '/holdings', label: 'Holdings' },
  { to: '/performance', label: 'Performance' },
  { to: '/top-performers', label: 'Top Performers' },
]

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/40 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-500"></div>
          <span className="text-lg font-semibold text-amber-400">WealthManager</span>
        </div>
        <nav className="hidden gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-neutral-300 hover:text-amber-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
} 