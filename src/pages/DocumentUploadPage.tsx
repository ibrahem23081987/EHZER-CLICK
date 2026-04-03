import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  childrenUnder18BandToCount,
  childrenUnder18BandLabel,
  maritalStatusLabelHe,
  type AnnualIncomeBracket,
  type PersonalDetails,
} from '../types/forms'
import {
  attachmentHintsForSpecialSituations,
  specialSituationsToAdjustments,
  type SpecialSituationsState,
} from '../types/specialSituations'
import { FileDropzone } from '../components/FileDropzone'
import { IconLock } from '../components/icons'
import { SecurityNote } from '../components/SecurityNote'
import { Badge } from '../components/Badge'
import { analyzeForm106WithClaude, type Analyze106Result } from '../services/claude106'
import { generateRefundSummaryHebrew } from '../services/claudeRefundSummary'
import { downloadRefundSummaryPdf } from '../utils/refundSummaryPdf'

export type UploadLocationState = {
  personal?: PersonalDetails
  eligible?: boolean
  yesCount?: number
  estimatedRange?: string
  annualIncome?: AnnualIncomeBracket | null
  specialSituations?: SpecialSituationsState
}

function formatError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (msg === 'claude_insufficient_numbers')
    return 'לא הצלחנו לזהות ברוטו או נתוני מס מספיקים בטופס. ודא שהקובץ קריא או נסה קובץ אחר.'
  if (msg.startsWith('claude_http_'))
    return 'שגיאה בשירות הניתוח. בדוק שהוגדר ANTHROPIC_API_KEY בקובץ .env ושהפרוקסי פעיל (npm run dev).'
  if (msg === 'claude_no_text') return 'המודל לא החזיר תוצאה. נסה שוב.'
  if (msg === 'read_failed') return 'שגיאה בקריאת הקובץ.'
  if (msg.includes('JSON')) return 'לא ניתן לפרש את תשובת המודל. נסה שוב.'
  if (msg === 'font_load_failed') return 'לא ניתן לטעון גופן עברית ל-PDF. בדוק חיבור לאינטרנט.'
  return 'אירעה שגיאה. נסה שוב מאוחר יותר.'
}

export function DocumentUploadPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as UploadLocationState | null) ?? {}

  const [form106, setForm106] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Analyze106Result | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const firstName = state.personal?.firstName?.trim()
  const attachmentHints = state.specialSituations
    ? attachmentHintsForSpecialSituations(state.specialSituations)
    : []

  async function handleAnalyze() {
    setError(null)
    if (!form106) {
      setError('יש להעלות טופס 106')
      return
    }
    setLoading(true)
    try {
      const specialAdj = state.specialSituations
        ? specialSituationsToAdjustments(state.specialSituations)
        : undefined
      const r = await analyzeForm106WithClaude(form106, {
        maritalStatus: state.personal?.maritalStatus ?? 'single',
        childrenCount: childrenUnder18BandToCount(state.personal?.childrenUnder18Count),
        specialAdjustments: specialAdj && Object.keys(specialAdj).length > 0 ? specialAdj : undefined,
      })
      setResult(r)
    } catch (e) {
      setError(formatError(e))
    } finally {
      setLoading(false)
    }
  }

  async function handlePrepareSummary() {
    setSummaryError(null)
    if (!result) return
    const p = state.personal
    const fn = p?.firstName?.trim() || 'מבקש'
    const ln = p?.lastName?.trim() || ''
    const taxYear = p?.taxYear?.trim() || new Date().getFullYear().toString()

    setSummaryLoading(true)
    try {
      const text = await generateRefundSummaryHebrew({
        firstName: fn,
        lastName: ln,
        taxYear,
        maritalStatusHe: maritalStatusLabelHe(p?.maritalStatus),
        maritalStatus: p?.maritalStatus ?? null,
        childrenLabel: childrenUnder18BandLabel(p?.childrenUnder18Count),
        childrenCount: childrenUnder18BandToCount(p?.childrenUnder18Count),
        grossSalary: result.grossSalary ?? 0,
        taxWithheld: result.taxWithheld ?? 0,
        creditPoints: result.creditPoints,
        refundNis: result.refundNis,
        specialSituations: state.specialSituations ?? null,
      })
      await downloadRefundSummaryPdf({
        taxYear,
        firstName: fn,
        bodyText: text,
      })
    } catch (e) {
      setSummaryError(formatError(e))
    } finally {
      setSummaryLoading(false)
    }
  }

  if (result) {
    const amount = result.refundNis.toLocaleString('he-IL')
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-lg shadow-navy/5 sm:p-10">
          <p className="text-sm font-semibold text-emerald-800">תוצאת הניתוח</p>
          <h1 className="mt-4 text-2xl font-extrabold text-navy sm:text-3xl md:text-4xl">
            על בסיס הנתונים שהזנת, ההחזר המשוער שלך: ₪{amount}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-navy/45">
            * הסכום מחושב על בסיס הנתונים שהזנת בלבד ואינו מהווה ייעוץ מס מקצועי. הסכום הסופי ייקבע על ידי רשות המסים.
          </p>

          {summaryError && (
            <p className="mx-auto mt-4 max-w-lg rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
              {summaryError}
            </p>
          )}

          {summaryLoading && (
            <div className="mx-auto mt-6 flex max-w-sm flex-col items-center gap-2" role="status">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy/20 border-t-gold" />
              <p className="text-sm font-medium text-navy">מכין סיכום להגשה...</p>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              onClick={() =>
                navigate('/handoff', {
                  state: {
                    personal: state.personal,
                    refundNis: result.refundNis,
                  },
                })
              }
              disabled={summaryLoading}
              className="rounded-xl bg-navy px-8 py-4 text-sm font-bold text-white shadow-md transition hover:bg-navy-light disabled:opacity-50"
            >
              שלח לרואה חשבון
            </button>
            <button
              type="button"
              onClick={handlePrepareSummary}
              disabled={summaryLoading}
              className="rounded-xl border-2 border-gold bg-gold-muted px-8 py-4 text-sm font-bold text-navy shadow-sm transition hover:bg-gold/40 disabled:opacity-50"
            >
              📝 הכן לי סיכום להגשה
            </button>
            <Link
              to="/"
              className="inline-flex justify-center rounded-xl border-2 border-navy/20 bg-white px-8 py-4 text-sm font-bold text-navy transition hover:bg-navy/5"
            >
              תודה, ידעתי
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="gold">SSL מאובטח</Badge>
        <Badge variant="muted">בדיקה והכנה בחינם</Badge>
      </div>

      <h1 className="text-2xl font-bold text-navy sm:text-3xl">העלאת טופס 106</h1>
      {firstName && (
        <p className="mt-2 text-sm text-navy/70">
          שלום {firstName}, העלה/י את טופס 106 לניתוח.
        </p>
      )}
      {!firstName && (
        <p className="mt-2 text-sm text-navy/70">
          העלה/י טופס 106 (PDF או תמונה). מומלץ להשלים קודם את{' '}
          <Link to="/questionnaire" className="font-semibold text-navy underline underline-offset-2">
            שאלון הבדיקה
          </Link>
          .
        </p>
      )}

      <SecurityNote className="mt-4" />

      {attachmentHints.length > 0 && (
        <div
          className="mt-6 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-4 text-right shadow-sm ring-1 ring-amber-100 sm:px-5 sm:py-5"
          role="note"
        >
          <p className="text-sm font-semibold text-amber-950">
            📎 שים לב — אל תשכח לצרף את האישורים הרלוונטיים!
          </p>
          <p className="mt-2 text-sm text-amber-950/90">
            לפי המצבים שסימנת, תצטרך להעלות באזור האישי במס הכנסה:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-amber-950/85 pe-1">
            {attachmentHints.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
          <IconLock className="h-5 w-5 text-gold" aria-hidden />
          טופס 106
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-navy/60">
          הקובץ נשלח לניתוח מאובטח. בפיתוח מקומי נדרש מפתח API בקובץ .env (ראה הערות בקוד הפרויקט).
        </p>

        <div className="mt-8">
          <FileDropzone
            label="טופס 106"
            description="PDF או תמונה (JPG / PNG) — קובץ קריא"
            required
            value={form106}
            onChange={setForm106}
          />
        </div>

        {loading && (
          <div
            className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-gold/30 bg-gold-muted/50 py-10"
            role="status"
            aria-live="polite"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy/20 border-t-gold" />
            <p className="max-w-sm text-center text-sm font-medium text-navy">
              הבינה המלאכותית מנתחת את הטופס שלך...
            </p>
          </div>
        )}

        {error && !loading && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-200">
            {error}
          </p>
        )}

        {!loading && (
          <button
            type="button"
            onClick={handleAnalyze}
            className="mt-8 w-full rounded-xl bg-gold py-4 text-base font-bold text-navy shadow-md transition hover:bg-gold-light"
          >
            בדוק כמה מגיע לי 🤖
          </button>
        )}
      </div>
    </div>
  )
}
