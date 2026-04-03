import { Link } from 'react-router-dom'
import { IconCheck, IconLock, IconShield } from '../components/icons'
import { Badge } from '../components/Badge'
import { SecurityNote } from '../components/SecurityNote'

const trustCards = [
  {
    title: 'חינם לבדיקה',
    text: 'בדיקת זכאות והכנת התיק בחינם — ללא התחייבות.',
    icon: IconCheck,
  },
  {
    title: 'מאובטח',
    text: 'חיבור מאובטח (SSL) והגנה על המידע הרגיש שלך.',
    icon: IconShield,
  },
  {
    title: 'ללא מקדמה',
    text: 'מי שלא יודע להגיש יכול להעביר אלינו — תשלום עמלה רק אחרי קבלת ההחזר, לפי הסכם.',
    icon: IconLock,
  },
] as const

const steps = [
  {
    n: '1',
    title: 'ממלאים שאלון קצר',
    text: 'פרטים אישיים ומספר שאלות כדי להעריך זכאות אפשרית.',
  },
  {
    n: '2',
    title: 'מעלים מסמכים',
    text: 'טופס 106 ותעודת זהות — בהעלאה מאובטחת.',
  },
  {
    n: '3',
    title: 'מקבלים תוצאה מיידית',
    text: 'הבינה המלאכותית מנתחת את הנתונים ומציגה לך את סכום ההחזר המשוער תוך שניות.',
  },
] as const

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy px-4 pb-16 pt-12 text-white sm:pb-20 sm:pt-16">
        <div
          className="pointer-events-none absolute -start-24 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-16 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-2xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="gold">SSL מאובטח</Badge>
            <Badge variant="muted" className="!bg-white/10 !text-white !ring-white/20">
              בדיקה והכנה בחינם
            </Badge>
            <Badge variant="muted" className="!bg-white/10 !text-white !ring-white/20">
              ללא תשלום
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            <span className="block text-white">מחשבון החזר מס חכם</span>
            <span className="mt-2 block text-gold text-2xl sm:mt-3 sm:text-3xl md:text-4xl md:leading-snug">
              מופעל בבינה מלאכותית
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base sm:mt-6">
            גלה כמה כסף המדינה חייבת לך — בדיוק, לא הערכה
          </p>
          <SecurityNote className="mx-auto mt-6 max-w-xl justify-center text-white/70 [&_svg]:text-gold" />
          <div className="mt-10">
            <Link
              to="/questionnaire"
              className="inline-flex items-center justify-center rounded-xl bg-gold px-8 py-4 text-base font-bold text-navy shadow-lg shadow-black/20 transition hover:bg-gold-light hover:shadow-xl"
            >
              בדוק אם מגיע לי החזר מס
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
        <h2 className="text-center text-2xl font-bold text-navy sm:text-3xl">למה לבחור בנו</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-navy/70">
          שלושה עקרונות שמנחים כל לקוח
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {trustCards.map(({ title, text, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-navy/10 bg-white p-6 shadow-md shadow-navy/5 transition hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-xl bg-gold-muted p-3 text-navy">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/75">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy sm:text-3xl">איך זה עובד</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-navy/70">שלושה שלבים פשוטים</p>
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <li
                key={s.n}
                className="relative rounded-2xl border border-gold/25 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-sm"
              >
                <span className="absolute -top-3 end-4 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy shadow">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/75">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Link
              to="/questionnaire"
              className="inline-flex rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-navy-light"
            >
              התחל בדיקה עכשיו
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
        <h2 className="text-center text-2xl font-bold text-navy sm:text-3xl">מה לקוחות אומרים</h2>
        <p className="mx-auto mt-2 text-center text-sm text-navy/60">
          חוויות אמיתיות מלקוחות שקיבלו ליווי בהחזר מס
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'נועה כהן, תל אביב',
              text: 'חשבתי שלא מגיע לי כלום, ובסוף יצא שכן — ההסבר היה ברור והתהליך הרגיש מקצועי מראש ועד סוף.',
            },
            {
              name: 'יוסי אביב, חיפה',
              text: 'אחרי שנים שדחיתי את זה, סוף סוף הגשתי. קיבלתי החזר משמעותי וחסכתי את הבלגן מול רשות המסים.',
            },
            {
              name: 'מיכל גרציה, באר שבע',
              text: 'שירות אנושי, בלי טריקים. עזרו לי לארגן את טופס 106 ולהבין מה באמת מגיע לי — ממליצה בלב שלם.',
            },
          ].map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl border border-navy/10 bg-white p-6 shadow-md shadow-navy/5"
            >
              <p className="text-sm leading-relaxed text-navy/80">״{t.text}״</p>
              <footer className="mt-4 text-xs font-semibold text-gold">— {t.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  )
}
