import { Link, useLocation } from 'react-router-dom'
import type { PersonalDetails } from '../types/forms'
import { IconCheck } from '../components/icons'
import { Badge } from '../components/Badge'

type State = {
  personal?: PersonalDetails
  uploaded?: boolean
  handoff?: boolean
}

export function ThankYouPage() {
  const location = useLocation()
  const state = (location.state as State | null) ?? {}
  const name = state.personal?.firstName?.trim()

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-xl shadow-navy/10 sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <IconCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">תודה רבה!</h1>
        <p className="mt-2 text-lg font-medium text-navy/80">
          {name ? `${name}, ` : ''}קיבלנו את המסמכים שלך.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-navy/70">
          קיבלנו את הפנייה שלך. רואה החשבון יצור איתך קשר תוך{' '}
          <strong className="text-navy">24–48 שעות</strong> לבדיקה מקצועית והמשך תהליך.
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-6 text-start ring-1 ring-navy/10">
          <h2 className="text-sm font-bold text-navy">מה קורה הלאה?</h2>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-navy/75">
            <li>בודקים את המסמכים מול נתוני המס הרלוונטיים</li>
            <li>מחזירים אליך הערכה או בקשה למסמכים נוספים במידת הצורך</li>
            <li>מתאמים איתך את דרך ההגשה — עצמית או דרך המשרד</li>
          </ol>
        </div>

        <div className="mt-8 space-y-4 text-start">
          <div className="rounded-xl border border-gold/30 bg-gold-muted/50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">אפשרות 1</Badge>
              <span className="text-sm font-bold text-navy">הגשה עצמית באזור האישי (בחינם)</span>
            </div>
            <p className="mt-2 text-sm text-navy/75">
              ניתן להגיש בקשה להחזר באופן עצמי דרך{' '}
              <a
                href="https://www.misim.gov.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy underline underline-offset-2 hover:text-gold"
              >
                אזור האישי של רשות המסים (מיסים)
              </a>
              . המשרד יספק הנחיות מדויקות לאחר הבדיקה.
            </p>
          </div>
          <div className="rounded-xl border border-navy/15 bg-white p-4 ring-1 ring-navy/10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">אפשרות 2</Badge>
              <span className="text-sm font-bold text-navy">הגשה על ידי רואה החשבון (לבחירה)</span>
            </div>
            <p className="mt-2 text-sm text-navy/75">
              אם אינך יודע/ת להגיש — ניתן להעביר לרואה החשבון. <strong>ללא מקדמה</strong> ועם{' '}
              טיפול לפי תנאי הסכם מסודר.
            </p>
            {!state.handoff && (
              <div className="mt-4">
                <Link
                  to="/handoff"
                  state={{ personal: state.personal }}
                  className="inline-flex w-full justify-center rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-navy-light sm:w-auto"
                >
                  אני לא יודע/ת להגיש — העבר אליכם (הסכמה + חתימה)
                </Link>
              </div>
            )}
            {state.handoff && (
              <p className="mt-4 text-sm font-semibold text-emerald-700">
                בחרת העברה לרואה החשבון — ההסכמה והחתימה נקלטו.
              </p>
            )}
          </div>
        </div>

        <Link
          to="/"
          className="mt-10 inline-flex rounded-xl bg-gold px-8 py-3 text-sm font-bold text-navy shadow-md transition hover:bg-gold-light"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
}
