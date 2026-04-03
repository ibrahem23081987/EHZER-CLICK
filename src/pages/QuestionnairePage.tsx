import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ANNUAL_INCOME_OPTIONS,
  CHILDREN_UNDER_18_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  type CriticalAnswers,
  type PersonalDetails,
  countYesAnswers,
  estimatedRefundRange,
  initialCriticalAnswers,
  isLikelyEligible,
} from '../types/forms'
import { isValidEmail, isValidIsraeliPhone } from '../utils/validation'
import { IconLock } from '../components/icons'
import { SecurityNote } from '../components/SecurityNote'
import { Badge } from '../components/Badge'
import {
  FOREIGN_COUNTRY_OPTIONS,
  SPECIAL_OPTION_KEYS,
  SPECIAL_OPTION_LABELS,
  type SpecialFollowUpErrors,
  type SpecialSituationsState,
  hasAnySpecialExceptNone,
  initialSpecialSituationsState,
  setSpecialSelected,
  validateSpecialFollowUps,
} from '../types/specialSituations'

const TAX_YEARS = ['2024', '2023', '2022', '2021', '2020'] as const

const CRITICAL_Q: { key: Exclude<keyof CriticalAnswers, 'annualIncome'>; label: string }[] = [
  { key: 'multiEmployer', label: 'האם עבדת אצל יותר ממעסיק אחד בשנה זו?' },
  { key: 'pensionWithdrawal', label: 'האם משכת כספי פנסיה/תגמולים ושילמת מס?' },
  { key: 'unemployment', label: 'האם היית בחל״ת או פוטרת?' },
  { key: 'lifeInsurance', label: 'האם שילמת ביטוח חיים או אובדן כושר עבודה?' },
  { key: 'childrenUnder18', label: 'האם יש לך ילדים מתחת לגיל 18?' },
  { key: 'academicStudies', label: 'האם סיימת לימודים אקדמיים בשנים האחרונות?' },
  { key: 'charity', label: 'האם תרמת לעמותות מוכרות?' },
  { key: 'rentalIncome', label: 'האם יש לך הכנסות מדמי שכירות?' },
]

type Errors = Partial<Record<keyof PersonalDetails, string>>

const emptyPersonal: PersonalDetails = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  taxYear: TAX_YEARS[0],
  maritalStatus: null,
  childrenUnder18Count: null,
}

const TOTAL_STEPS = 4

export function QuestionnairePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [personal, setPersonal] = useState<PersonalDetails>(emptyPersonal)
  const [answers, setAnswers] = useState<CriticalAnswers>(initialCriticalAnswers)
  const [errors, setErrors] = useState<Errors>({})
  const [showCriticalHint, setShowCriticalHint] = useState(false)
  const [special, setSpecial] = useState<SpecialSituationsState>(initialSpecialSituationsState)
  const [specialPhase, setSpecialPhase] = useState<'pick' | 'followup'>('pick')
  const [specialFollowErrors, setSpecialFollowErrors] = useState<SpecialFollowUpErrors>({})
  const [specialPickHint, setSpecialPickHint] = useState(false)

  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step])
  const yesCount = countYesAnswers(answers)
  const eligible = isLikelyEligible(answers)
  const range = estimatedRefundRange(
    yesCount,
    answers.annualIncome ?? 'under60',
  )

  function validatePersonal(): boolean {
    const e: Errors = {}
    if (!personal.firstName.trim()) e.firstName = 'שדה חובה'
    if (!personal.lastName.trim()) e.lastName = 'שדה חובה'
    if (!isValidIsraeliPhone(personal.phone)) e.phone = 'מספר טלפון לא תקין'
    if (!isValidEmail(personal.email)) e.email = 'כתובת אימייל לא תקינה'
    if (!personal.taxYear) e.taxYear = 'נא לבחור שנת מס'
    if (personal.maritalStatus === null) e.maritalStatus = 'נא לבחור מצב משפחתי'
    if (personal.childrenUnder18Count === null)
      e.childrenUnder18Count = 'נא לבחור מספר ילדים מתחת לגיל 18'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateCritical(): boolean {
    if (answers.annualIncome === null) return false
    const missing = CRITICAL_Q.some(({ key }) => answers[key] === null)
    return !missing
  }

  function uploadStateBase() {
    return {
      personal,
      yesCount,
      estimatedRange: range,
      annualIncome: answers.annualIncome,
      specialSituations: special,
    }
  }

  function goNext() {
    if (step === 1) {
      if (!validatePersonal()) return
    }
    if (step === 2) {
      if (!validateCritical()) {
        setShowCriticalHint(true)
        return
      }
      setSpecial(initialSpecialSituationsState())
      setSpecialPhase('pick')
      setSpecialFollowErrors({})
      setSpecialPickHint(false)
    }
    if (step === 3) {
      if (specialPhase === 'pick') {
        const anySpecial = hasAnySpecialExceptNone(special)
        const onlyNone = special.selected.noneOfAbove && !anySpecial
        const nothingSelected = !special.selected.noneOfAbove && !anySpecial
        if (nothingSelected) {
          setSpecialPickHint(true)
          return
        }
        setSpecialPickHint(false)
        if (onlyNone) {
          navigate('/upload', {
            state: {
              ...uploadStateBase(),
              eligible: eligible,
            },
          })
          return
        }
        setSpecialPhase('followup')
        return
      }
      const fe = validateSpecialFollowUps(special)
      if (Object.keys(fe).length > 0) {
        setSpecialFollowErrors(fe)
        return
      }
      setSpecialFollowErrors({})
      setStep(4)
      return
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  function goBack() {
    if (step === 4) {
      setStep(3)
      setSpecialPhase('followup')
      return
    }
    if (step === 3 && specialPhase === 'followup') {
      setSpecialPhase('pick')
      setSpecialFollowErrors({})
      return
    }
    setStep((s) => Math.max(1, s - 1))
  }

  function continueToUpload() {
    navigate('/upload', {
      state: {
        ...uploadStateBase(),
        eligible: true,
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">שאלון ראשוני</h1>
          <p className="mt-1 text-sm text-navy/65">שלב {step} מתוך {TOTAL_STEPS}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="gold">SSL מאובטח</Badge>
          <Badge variant="muted">בדיקה והכנה בחינם</Badge>
        </div>
      </div>

      <div
        className="mb-8 h-2 overflow-hidden rounded-full bg-navy/10"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`התקדמות: שלב ${step} מתוך ${TOTAL_STEPS}`}
      >
        <div
          className="h-full rounded-full bg-gold transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {step === 1 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
          <h2 className="text-lg font-bold text-navy">פרטים אישיים</h2>
          <SecurityNote className="mt-3" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              label="שם פרטי"
              value={personal.firstName}
              onChange={(v) => setPersonal((p) => ({ ...p, firstName: v }))}
              error={errors.firstName}
            />
            <Field
              label="שם משפחה"
              value={personal.lastName}
              onChange={(v) => setPersonal((p) => ({ ...p, lastName: v }))}
              error={errors.lastName}
            />
            <Field
              label="טלפון נייד"
              value={personal.phone}
              onChange={(v) => setPersonal((p) => ({ ...p, phone: v }))}
              error={errors.phone}
              sensitive
              inputMode="tel"
              placeholder="05xxxxxxxx"
            />
            <div className="sm:col-span-2">
              <Field
                label="אימייל"
                type="email"
                value={personal.email}
                onChange={(v) => setPersonal((p) => ({ ...p, email: v }))}
                error={errors.email}
                sensitive
                autoComplete="email"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy">
                <IconLock className="h-3.5 w-3.5 text-gold" aria-hidden />
                שנת מס לבדיקה
              </label>
              <select
                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy shadow-sm outline-none ring-gold/40 focus:border-gold focus:ring-2"
                value={personal.taxYear}
                onChange={(e) => setPersonal((p) => ({ ...p, taxYear: e.target.value }))}
              >
                {TAX_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {errors.taxYear && <p className="mt-1 text-sm text-red-600">{errors.taxYear}</p>}
            </div>

            <div className="sm:col-span-2">
              <p className="mb-3 text-sm font-semibold text-navy">מצב משפחתי</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MARITAL_STATUS_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPersonal((p) => ({ ...p, maritalStatus: value }))}
                    className={`min-h-12 rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${
                      personal.maritalStatus === value
                        ? 'border-gold bg-gold-muted text-navy ring-2 ring-gold/50'
                        : 'border-navy/15 bg-slate-50 text-navy hover:border-gold/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.maritalStatus && (
                <p className="mt-1 text-sm text-red-600">{errors.maritalStatus}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <p className="mb-3 text-sm font-semibold text-navy">מספר ילדים מתחת לגיל 18</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {CHILDREN_UNDER_18_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPersonal((p) => ({ ...p, childrenUnder18Count: value }))}
                    className={`min-h-12 rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${
                      personal.childrenUnder18Count === value
                        ? 'border-gold bg-gold-muted text-navy ring-2 ring-gold/50'
                        : 'border-navy/15 bg-slate-50 text-navy hover:border-gold/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.childrenUnder18Count && (
                <p className="mt-1 text-sm text-red-600">{errors.childrenUnder18Count}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
            <h2 className="text-lg font-bold text-navy">שאלות קריטיות</h2>
            <p className="mt-2 text-sm text-navy/65">
              נא לבחור טווח הכנסה, ואז לענות כן או לא לכל שאלה
            </p>

            <div className="mt-8 border-b border-navy/10 pb-8">
              <p className="text-base font-medium leading-snug text-navy">
                מה הייתה ההכנסה השנתית שלך?
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ANNUAL_INCOME_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, annualIncome: value }))}
                    className={`min-h-14 rounded-xl border-2 px-4 py-4 text-center text-sm font-bold leading-snug transition sm:text-base ${
                      answers.annualIncome === value
                        ? 'border-gold bg-gold-muted text-navy ring-2 ring-gold/50'
                        : 'border-navy/15 bg-slate-50 text-navy hover:border-gold/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <ul className="mt-8 space-y-8">
              {CRITICAL_Q.map(({ key, label }) => (
                <li key={key}>
                  <p className="text-base font-medium leading-snug text-navy">{label}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [key]: 'yes' }))}
                      className={`min-h-14 min-w-[7rem] flex-1 rounded-xl border-2 px-6 py-4 text-base font-bold transition sm:flex-none sm:min-w-[8rem] ${
                        answers[key] === 'yes'
                          ? 'border-gold bg-gold-muted text-navy ring-2 ring-gold/50'
                          : 'border-navy/15 bg-slate-50 text-navy hover:border-gold/40'
                      }`}
                    >
                      כן
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [key]: 'no' }))}
                      className={`min-h-14 min-w-[7rem] flex-1 rounded-xl border-2 px-6 py-4 text-base font-bold transition sm:flex-none sm:min-w-[8rem] ${
                        answers[key] === 'no'
                          ? 'border-navy bg-navy text-white ring-2 ring-navy/30'
                          : 'border-navy/15 bg-slate-50 text-navy hover:border-navy/30'
                      }`}
                    >
                      לא
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {showCriticalHint && !validateCritical() && (
              <p className="mt-6 text-sm text-amber-700">נא לענות על כל השאלות לפני המשך</p>
            )}
          </div>
        </section>
      )}

      {step === 3 && specialPhase === 'pick' && (
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
          <h2 className="text-lg font-bold text-navy">האם אחד מהמצבים הבאים רלוונטי אליך?</h2>
          <p className="mt-2 text-sm text-navy/65">
            סמן הכל שרלוונטי — זה ישפיע על דיוק החישוב
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SPECIAL_OPTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setSpecial((prev) => setSpecialSelected(prev, key, !prev.selected[key]))
                }
                className={`min-h-14 rounded-xl border-2 px-4 py-4 text-right text-sm font-bold leading-snug transition sm:text-base ${
                  special.selected[key]
                    ? 'border-gold bg-gold-muted text-navy ring-2 ring-gold/50'
                    : 'border-navy/15 bg-slate-50 text-navy hover:border-gold/40'
                }`}
              >
                {SPECIAL_OPTION_LABELS[key]}
              </button>
            ))}
          </div>
          {specialPickHint && (
            <p className="mt-6 text-sm text-amber-700">נא לסמן לפחות אפשרות אחת, או &quot;לא, אף אחד מהנ״ל&quot;</p>
          )}
        </section>
      )}

      {step === 3 && specialPhase === 'followup' && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
            <h2 className="text-lg font-bold text-navy">פרטים נוספים</h2>
            <p className="mt-2 text-sm text-navy/65">מלא/י לפי המצבים שסימנת — רק השדות הרלוונטיים מוצגים</p>
            <div className="mt-8 space-y-8">
              {special.selected.bituachLeumi && (
                <div>
                  <Field
                    label="כמה קיבלת סה״כ מביטוח לאומי? (בשקלים)"
                    value={special.details.bituachLeumiAmount}
                    onChange={(v) => {
                      setSpecial((p) => ({ ...p, details: { ...p.details, bituachLeumiAmount: v } }))
                      setSpecialFollowErrors((e) => {
                        const n = { ...e }
                        delete n.bituachLeumiAmount
                        return n
                      })
                    }}
                    inputMode="decimal"
                    error={specialFollowErrors.bituachLeumiAmount}
                  />
                </div>
              )}
              {special.selected.disabilityRecognized && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-navy">כמה אחוז נכות מוכרת?</p>
                  <div className="flex flex-wrap gap-3">
                    {(['20', '40', '60', '80', '100'] as const).map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setSpecial((p) => ({ ...p, details: { ...p.details, disabilityPercent: pct } }))
                          setSpecialFollowErrors((e) => {
                            const n = { ...e }
                            delete n.disabilityPercent
                            return n
                          })
                        }}
                        className={`min-h-12 min-w-[4.5rem] rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                          special.details.disabilityPercent === pct
                            ? 'border-gold bg-gold-muted text-navy ring-2 ring-gold/50'
                            : 'border-navy/15 bg-slate-50 text-navy hover:border-gold/40'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  {specialFollowErrors.disabilityPercent && (
                    <p className="mt-1 text-sm text-red-600">{specialFollowErrors.disabilityPercent}</p>
                  )}
                </div>
              )}
              {special.selected.academicDegree && (
                <Field
                  label="כמה שילמת שכר לימוד באותה שנה? (בשקלים)"
                  value={special.details.tuitionPaid}
                  onChange={(v) => {
                    setSpecial((p) => ({ ...p, details: { ...p.details, tuitionPaid: v } }))
                    setSpecialFollowErrors((e) => {
                      const n = { ...e }
                      delete n.tuitionPaid
                      return n
                    })
                  }}
                  inputMode="decimal"
                  error={specialFollowErrors.tuitionPaid}
                />
              )}
              {special.selected.charityDonations && (
                <Field
                  label="כמה תרמת סה״כ? (בשקלים)"
                  value={special.details.donationsAmount}
                  onChange={(v) => {
                    setSpecial((p) => ({ ...p, details: { ...p.details, donationsAmount: v } }))
                    setSpecialFollowErrors((e) => {
                      const n = { ...e }
                      delete n.donationsAmount
                      return n
                    })
                  }}
                  inputMode="decimal"
                  error={specialFollowErrors.donationsAmount}
                />
              )}
              {special.selected.selfEmployedSameYear && (
                <Field
                  label="כמה הרווחת כעצמאי (הכנסה ברוטו)? (בשקלים)"
                  value={special.details.selfEmployedGross}
                  onChange={(v) => {
                    setSpecial((p) => ({ ...p, details: { ...p.details, selfEmployedGross: v } }))
                    setSpecialFollowErrors((e) => {
                      const n = { ...e }
                      delete n.selfEmployedGross
                      return n
                    })
                  }}
                  inputMode="decimal"
                  error={specialFollowErrors.selfEmployedGross}
                />
              )}
              {special.selected.foreignIncome && (
                <ForeignIncomeCountryFields
                  country={special.details.foreignIncomeCountry}
                  amount={special.details.foreignIncomeAmount}
                  onAmountChange={(v) => {
                    setSpecial((p) => ({ ...p, details: { ...p.details, foreignIncomeAmount: v } }))
                    setSpecialFollowErrors((e) => {
                      const n = { ...e }
                      delete n.foreignIncomeAmount
                      return n
                    })
                  }}
                  onCountryChange={(c) => {
                    setSpecial((p) => ({ ...p, details: { ...p.details, foreignIncomeCountry: c } }))
                    setSpecialFollowErrors((e) => {
                      const n = { ...e }
                      delete n.foreignIncomeCountry
                      return n
                    })
                  }}
                  amountError={specialFollowErrors.foreignIncomeAmount}
                  countryError={specialFollowErrors.foreignIncomeCountry}
                />
              )}
              {special.selected.maternityLeave && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-navy">כמה חודשים חופשת לידה?</p>
                  <div className="flex flex-wrap gap-3">
                    {(['1', '2', '3', '4', '5', '6'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSpecial((p) => ({ ...p, details: { ...p.details, maternityMonths: m } }))
                          setSpecialFollowErrors((e) => {
                            const n = { ...e }
                            delete n.maternityMonths
                            return n
                          })
                        }}
                        className={`min-h-12 min-w-[3.25rem] rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                          special.details.maternityMonths === m
                            ? 'border-gold bg-gold-muted text-navy ring-2 ring-gold/50'
                            : 'border-navy/15 bg-slate-50 text-navy hover:border-gold/40'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {specialFollowErrors.maternityMonths && (
                    <p className="mt-1 text-sm text-red-600">{specialFollowErrors.maternityMonths}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
          {eligible ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                🎉
              </div>
              <h2 className="text-2xl font-extrabold text-emerald-800 sm:text-3xl">
                כנראה מגיע לך החזר מס!
              </h2>
              <p className="mx-auto mt-4 max-w-md text-navy/75">
                לפי התשובות שמילאת, קיימת זכאות אפשרית להחזר. טווח משוער (לפני בדיקת מסמכים):
              </p>
              <p className="mt-4 text-2xl font-bold text-gold">{range}</p>
              <p className="mt-2 text-xs text-navy/50">הסכום הסופי תלוי בנתונים המלאים ובאישור רשויות המס</p>
              <button
                type="button"
                onClick={continueToUpload}
                className="mt-8 w-full rounded-xl bg-navy py-4 text-base font-bold text-white shadow-md transition hover:bg-navy-light sm:w-auto sm:px-10"
              >
                המשך להעלאת מסמכים לבדיקה מדויקת
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-navy">
                ℹ️
              </div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl">לא זיהינו סימנים חזקים להחזר בשלב זה</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-navy/75">
                לעיתים החזר מס נובע מפרטים שלא נכללים בשאלון הקצר, או משנים קודמות. מומלץ להתייעץ עם רואה חשבון
                ולהציג טופס 106 לבדיקה מקצועית — לעיתים נמצא זכאות שלא נראית בשאלון הראשוני.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/upload"
                  state={{
                    personal,
                    eligible: false,
                    yesCount,
                    estimatedRange: range,
                    annualIncome: answers.annualIncome,
                    specialSituations: special,
                  }}
                  className="inline-flex justify-center rounded-xl border-2 border-navy bg-white px-6 py-3 text-sm font-bold text-navy transition hover:bg-navy/5"
                >
                  בכל זאת להעלות מסמכים לבדיקה
                </Link>
                <Link
                  to="/"
                  className="inline-flex justify-center rounded-xl bg-gold px-6 py-3 text-sm font-bold text-navy transition hover:bg-gold-light"
                >
                  חזרה לדף הבית
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {step < 4 && (
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="rounded-xl border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5 disabled:pointer-events-none disabled:opacity-40"
          >
            חזרה
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-gold px-8 py-3 text-sm font-bold text-navy shadow-md transition hover:bg-gold-light"
          >
            המשך
          </button>
        </div>
      )}

      {step === 4 && eligible && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={goBack}
            className="text-sm font-medium text-navy/60 underline-offset-2 hover:text-navy hover:underline"
          >
            חזרה לשאלון
          </button>
        </div>
      )}
    </div>
  )
}

const FOREIGN_LIST_VALUES = new Set(
  FOREIGN_COUNTRY_OPTIONS.map((o) => o.value).filter(Boolean),
)

function ForeignIncomeCountryFields({
  country,
  amount,
  onAmountChange,
  onCountryChange,
  amountError,
  countryError,
}: {
  country: string
  amount: string
  onAmountChange: (v: string) => void
  onCountryChange: (c: string) => void
  amountError?: string
  countryError?: string
}) {
  const inList = (c: string) => Boolean(c && FOREIGN_LIST_VALUES.has(c))
  const [customEntry, setCustomEntry] = useState(() => Boolean(country) && !inList(country))

  const selectValue = inList(country) ? country : customEntry || country ? '__custom__' : ''

  return (
    <div className="space-y-4">
      <Field
        label="סכום הכנסות מחו״ל (בשקלים)"
        value={amount}
        onChange={onAmountChange}
        inputMode="decimal"
        error={amountError}
      />
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-navy">מדינה</label>
        <select
          className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy shadow-sm outline-none ring-gold/40 focus:border-gold focus:ring-2"
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value
            if (v === '__custom__') {
              setCustomEntry(true)
              onCountryChange('')
            } else {
              setCustomEntry(false)
              onCountryChange(v)
            }
          }}
        >
          {FOREIGN_COUNTRY_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>
              {o.label}
            </option>
          ))}
          <option value="__custom__">אחר (הזן ידנית)</option>
        </select>
        {selectValue === '__custom__' && (
          <input
            className="mt-3 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy shadow-sm outline-none ring-gold/40 placeholder:text-navy/35 focus:border-gold focus:ring-2"
            placeholder="הקלד/י שם מדינה"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
          />
        )}
        {countryError && <p className="mt-1 text-sm text-red-600">{countryError}</p>}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  sensitive,
  inputMode,
  placeholder,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
  sensitive?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy">
        {sensitive && <IconLock className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy shadow-sm outline-none ring-gold/40 placeholder:text-navy/35 focus:border-gold focus:ring-2"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
