import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">מדיניות פרטיות</h1>
      <p className="mt-2 text-sm text-navy/65">עודכן לאפריל 2026 · אתר החזר קליק</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-navy/85">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">1. מבוא</h2>
          <p>
            מסמך זה מסביר כיצד אנו מטפלים במידע האישי שלך בעת שימוש בשירותי מחשבון ההחזר באתר החזר קליק.
            השימוש באתר מהווה הסכמה לעקרונות המפורטים להלן, בכפוף להוראות{' '}
            <strong>חוק הגנת הפרטיות, התשמ&quot;א–1981</strong> ולתיקוניו, ובכלל זה{' '}
            <strong>סעיף 13 לחוק</strong>, הקובע כי בעל מאגר מידע חייב לנהל את המאגר בהתאם להוראות החוק ולמטרות
            שנקבעו.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">2. איזה מידע נאסף?</h2>
          <ul className="list-inside list-disc space-y-2 pe-2">
            <li>
              <strong>פרטים אישיים</strong> שמוזנים בשאלון: שם, טלפון, דוא״ל, שנת מס, מצב משפחתי, מספר ילדים
              ותשובות לשאלות הערכת זכאות.
            </li>
            <li>
              <strong>מסמכים</strong> שמעלים לניתוח (למשל טופס 106) — הקבצים נשלחים לעיבוד טכני לצורך חילוץ
              נתונים מספריים.
            </li>
            <li>
              <strong>מידע טכני</strong> בסיסי הנדרש להפעלת האתר (כגון יומני שרת או אבטחה), לפי הצורך ובהתאם
              למדיניות האחסון.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">3. כיצד משתמשים במידע?</h2>
          <p>המידע משמש אך ורק למטרות הבאות:</p>
          <ul className="list-inside list-disc space-y-2 pe-2">
            <li>הפעלת מחשבון ההחזר והצגת הערכה משוערת על בסיס הנתונים שהוזנו.</li>
            <li>שיפור חוויית המשתמש ואבטחת השירות.</li>
            <li>עמידה בדרישות חוק ככל שנדרש.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">4. שיתוף עם צדדים שלישיים</h2>
          <p>
            אנו <strong>איננו מוכרים</strong> את המידע האישי שלך ואיננו משתפים אותו עם צדדים שלישיים לצורכי
            שיווק. העברת מידע לספקי תשתית (למשל אחסון או עיבוד בינה מלאכותית) תתבצע רק ככל שנדרש להפעלת
            השירות, בכפוף להתחייבויות סודיות ואבטחה, וללא שימוש שלא לצורך מתן השירות.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">5. אבטחת מידע</h2>
          <p>
            ננקטים אמצעים סבירים להגנה על המידע, כולל שימוש בחיבור מוצפן (SSL) בעת העברת נתונים. אין מערכת חסינה
            לחלוטין; אנו משתדלים לצמצם סיכונים.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">6. זכות עיון, תיקון ומחיקה</h2>
          <p>
            בהתאם לחוק הגנת הפרטיות, בכלל זה הוראות המתייחסות למאגרי מידע ולסעיף 13, רשאי כל אדם לבקש{' '}
            <strong>עיון</strong> במידע עליו המוחזר במאגר, <strong>תיקון</strong> אם המידע שגוי, וכן מחיקה או
            הפסקת שימוש — ככל שהדבר חל על השירות ועל החוק. ניתן לפנות אלינו בפרטים להלן; נטפל בבקשה בהתאם
            לדין ובמסגרת יכולותינו הטכניות.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">7. שינויים במדיניות</h2>
          <p>ייתכן שעדכון מדיניות זו מעת לעת. תאריך העדכון יופיע בראש העמוד.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">8. יצירת קשר</h2>
          <p>
            לשאלות בנוגע לפרטיות, לזכויותיך לפי חוק הגנת הפרטיות או לבקשות מחיקה/תיקון, ניתן לפנות בדוא״ל ל:{' '}
            <a
              href="mailto:privacy@hezherclick.co.il"
              className="font-semibold text-navy underline decoration-gold underline-offset-2 hover:text-gold"
            >
              privacy@hezherclick.co.il
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
