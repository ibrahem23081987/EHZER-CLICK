export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6 px-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-gold">הבהרה משפטית</p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/75">
            הבדיקה והכנת התיק באתר ניתנות בחינם וללא התחייבות. אין בהצגת טווח משוער
            התחייבות לסכום החזר בפועל. קבלת החזר מס כפופה לחוקי מס הכנסה, לנתונים
            המלאים ולאישור רשויות המס. במקרה של בחירה בליווי והגשה על ידי המשרד —
            ההתקשרות תתבצע לפי הסכם מסודר, ללא תשלום מקדמה, ותשלום עמלה רק לאחר
            קבלת ההחזר בפועל.
          </p>
        </div>
        <p className="text-center text-xs text-white/50">
          © {new Date().getFullYear()} כל הזכויות שמורות · משרד רואה חשבון
        </p>
      </div>
    </footer>
  )
}
