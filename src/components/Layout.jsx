import NavBar from './NavBar'

export default function Layout({ children }) {
  return (
    <div className="min-h-full">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-amber-500/20 py-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} WealthManager. All rights reserved.
      </footer>
    </div>
  )
} 