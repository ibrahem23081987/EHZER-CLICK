import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6 px-4">
        <div className="text-center">
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-white/75">
            המחשבון מספק הערכה משוערת בלבד על בסיס הנתונים שהוזנו. אין בכך ייעוץ מס מקצועי.
            הסכום הסופי ייקבע על ידי רשות המסים.
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80"
          aria-label="קישורים משפטיים ונגישות"
        >
          <Link to="/privacy" className="font-medium underline-offset-2 hover:text-gold hover:underline">
            מדיניות פרטיות
          </Link>
          <span className="text-white/30" aria-hidden>
            |
          </span>
          <Link
            to="/accessibility"
            className="font-medium underline-offset-2 hover:text-gold hover:underline"
          >
            הצהרת נגישות
          </Link>
        </nav>
        <p className="text-center text-xs text-white/50">© 2026 כל הזכויות שמורות · החזר קליק</p>
      </div>
    </footer>
  )
}
