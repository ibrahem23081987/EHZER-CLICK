import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { PersonalDetails } from '../types/forms'
import { Badge } from '../components/Badge'
import { IconLock } from '../components/icons'
import { SignaturePad } from '../components/SignaturePad'
import { isValidIsraeliId, isValidIsraeliPhone } from '../utils/validation'

type LocationState = {
  personal?: PersonalDetails
  refundNis?: number
}

function isoDateTimeLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function HandoffPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? {}

  const [fullName, setFullName] = useState<string>(() => {
    const p = state.personal
    if (!p) return ''
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  })
  const [idNumber, setIdNumber] = useState<string>('')
  const [phone, setPhone] = useState<string>(() => state.personal?.phone ?? '')
  const [agree, setAgree] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stamp = useMemo(() => isoDateTimeLocal(), [])

  function submit() {
    setError(null)
    if (!fullName.trim()) return setError('נא למלא שם מלא')
    if (!isValidIsraeliId(idNumber)) return setError('תעודת זהות לא תקינה')
    if (!isValidIsraeliPhone(phone)) return setError('טלפון לא תקין')
    if (!agree) return setError('יש לסמן אישור להסכמה לפני המשך')
    if (!signature) return setError('נא לחתום דיגיטלית לפני המשך')

    navigate('/thank-you', {
      state: {
        personal: state.personal,
        uploaded: true,
        handoff: true,
        handoffMeta: {
          fullName: fullName.trim(),
          idNumber: idNumber.replace(/\D/g, ''),
          phone: phone.replace(/\D/g, ''),
          signedAt: stamp,
        },
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="gold">SSL מאובטח</Badge>
        <Badge variant="muted">ללא תשלום מקדמה</Badge>
      </div>

      <h1 className="text-2xl font-bold text-navy sm:text-3xl">העברה לרואה החשבון להגשה</h1>
      {typeof state.refundNis === 'number' && (
        <p className="mt-3 rounded-xl border border-gold/30 bg-gold-muted/50 px-4 py-3 text-sm font-semibold text-navy">
          סכום מהניתוח האוטומטי: ₪{state.refundNis.toLocaleString('he-IL')}
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-navy/70">
        השירות באתר <strong>בחינם</strong> לבדיקת זכאות והכנת התיק. אם אינך יודע/ת להגיש לרשות המסים או מעדיף/ה
        שנבצע את ההגשה עבורך — ניתן לבחור כאן “העברה אלינו”.
      </p>

      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
          <IconLock className="h-5 w-5 text-gold" aria-hidden />
          הסכמה + חתימה דיגיטלית (ייפוי כוח)
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-navy/60">
          חשוב: זהו מסך הדגמה צד־לקוח. בפרודקשן נשלב מסמך ייפוי כוח רשמי, שליחה מאובטחת וארכוב בהתאם למדיניות המשרד.
        </p>

        <div className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 text-sm font-semibold text-navy">שם מלא</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy shadow-sm outline-none ring-gold/40 focus:border-gold focus:ring-2"
                placeholder="שם פרטי + שם משפחה"
              />
            </div>
            <div>
              <label className="mb-1.5 text-sm font-semibold text-navy">תעודת זהות</label>
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                inputMode="numeric"
                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy shadow-sm outline-none ring-gold/40 focus:border-gold focus:ring-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 text-sm font-semibold text-navy">טלפון</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy shadow-sm outline-none ring-gold/40 focus:border-gold focus:ring-2"
                placeholder="05xxxxxxxx"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-gold-muted/40 p-4 text-sm text-navy/85">
            <p className="font-bold text-navy">סיכום ההסכמה</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-navy/80">
              <li>אני מבקש/ת שרואה החשבון יגיש עבורי בקשה להחזר מס ויטפל בהתנהלות מול רשות המסים</li>
              <li>אני מאשר/ת שהשירות באתר (בדיקה/הכנה) ניתן בחינם</li>
              <li>
                במקרה של טיפול בהגשה על ידי המשרד — <strong>לא אשלם מקדמה</strong>, לפי הסכם התקשרות מסודר
              </li>
              <li>ידוע לי שהצלחת ההחזר תלויה באישור רשות המסים ובנתונים המלאים</li>
            </ul>
            <p className="mt-3 text-xs text-navy/60">
              חותמת דיגיטלית: <span className="font-semibold text-navy">{stamp}</span>
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-navy/10 bg-white p-4 ring-1 ring-navy/10">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-5 w-5 accent-[#c9a84c]"
            />
            <span className="text-sm leading-relaxed text-navy/75">
              אני מאשר/ת שקראתי והבנתי, ומסכים/ה לביצוע ההגשה על ידי המשרד בהתאם להסכם.
            </span>
          </label>

          <SignaturePad value={signature} onChange={setSignature} className="mt-2" />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/thank-you"
              className="rounded-xl border border-navy/20 px-6 py-3 text-center text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              כרגע לא — אני אגיש לבד
            </Link>
            <button
              type="button"
              onClick={submit}
              className="rounded-xl bg-navy px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-navy-light"
            >
              העבר לרואה החשבון + חתימה
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

