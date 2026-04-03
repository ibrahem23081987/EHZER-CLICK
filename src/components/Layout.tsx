import { Link, Outlet } from 'react-router-dom'
import { TrustStrip } from './TrustStrip'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-navy">
      <header className="sticky top-0 z-50 border-b border-navy/10 bg-navy shadow-md">
        <TrustStrip />
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="group flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
            <img
              src="/logo.svg"
              alt="החזר קליק"
              className="h-8 w-auto sm:h-9"
              width={180}
              height={31}
              decoding="async"
            />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="ניווט ראשי">
            <Link
              to="/"
              className="rounded-lg px-2 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white sm:px-3"
            >
              דף הבית
            </Link>
            <Link
              to="/questionnaire"
              className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-navy shadow-sm transition hover:bg-gold-light"
            >
              בדיקת זכאות
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
