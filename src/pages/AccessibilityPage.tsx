import { Link } from 'react-router-dom'

export function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">הצהרת נגישות</h1>
      <p className="mt-2 text-sm text-navy/65">החזר קליק</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-navy/85">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">מחויבות לנגישות</h2>
          <p>
            אנו פועלים להנגשת האתר ככל האפשר למשתמשים עם מוגבלויות, בהתאם להנחיות{' '}
            <strong>WCAG 2.1 ברמת AA</strong> (Web Content Accessibility Guidelines), כיעד לעיצוב, פיתוח
            ובדיקות שוטפות.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">מה קיים באתר</h2>
          <ul className="list-inside list-disc space-y-2 pe-2">
            <li>מבנה כותרות וטפסים סביר לקוראי מסך.</li>
            <li>ניגודיות צבעים וגודל טקסט בסיסי המתאימים לרוב התוכן.</li>
            <li>כפתור נגישות צף המאפשר להגדיל/להקטין טקסט, להפעיל מצב ניגודיות מוגברת ולהדגיש קישורים.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">מגבלות ידועות</h2>
          <p>
            ייתכן שחלקים באתר (למשל תוכן מוטמע מצד שלישי או קבצים שהועלו על ידי משתמשים) אינם נגישים במלואם.
            נשמח לקבל פניות ולשפר בהתאם.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">פנייה בנושא נגישות</h2>
          <p>
            אם נתקלת בבעיית נגישות או שאינך מצליח/ה להשתמש בחלק מהשירות, אנא פנה/י אלינו ונשתדל לסייע:{' '}
            <a
              href="mailto:a11y@hezherclick.co.il"
              className="font-semibold text-navy underline decoration-gold underline-offset-2 hover:text-gold"
            >
              a11y@hezherclick.co.il
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-12 text-center">
        <Link to="/" className="text-sm font-semibold text-navy underline underline-offset-2 hover:text-gold">
          חזרה לדף הבית
        </Link>
      </p>
    </div>
  )
}
