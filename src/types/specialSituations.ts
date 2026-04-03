import type { SpecialSituationsAdjustments } from '../utils/computeRefundNis'

export const SPECIAL_OPTION_KEYS = [
  'bituachLeumi',
  'disabilityRecognized',
  'academicDegree',
  'charityDonations',
  'selfEmployedSameYear',
  'foreignIncome',
  'maternityLeave',
  'noneOfAbove',
] as const

export type SpecialSituationKey = (typeof SPECIAL_OPTION_KEYS)[number]

export type SpecialSituationsDetails = {
  bituachLeumiAmount: string
  disabilityPercent: '' | '20' | '40' | '60' | '80' | '100'
  tuitionPaid: string
  donationsAmount: string
  selfEmployedGross: string
  foreignIncomeAmount: string
  foreignIncomeCountry: string
  maternityMonths: '' | '1' | '2' | '3' | '4' | '5' | '6'
}

export type SpecialSituationsState = {
  selected: Record<SpecialSituationKey, boolean>
  details: SpecialSituationsDetails
}

export const SPECIAL_OPTION_LABELS: Record<SpecialSituationKey, string> = {
  bituachLeumi: 'קיבלתי קצבת ביטוח לאומי (אבטלה/נכות/לידה)',
  disabilityRecognized: 'יש לי נכות מוכרת',
  academicDegree: 'למדתי לתואר אקדמי',
  charityDonations: 'תרמתי לעמותות מוכרות',
  selfEmployedSameYear: 'עבדתי גם כעצמאי באותה שנה',
  foreignIncome: 'היו לי הכנסות מחו"ל',
  maternityLeave: 'חזרתי מחופשת לידה',
  noneOfAbove: 'לא, אף אחד מהנ"ל',
}

export function initialSpecialSituationsState(): SpecialSituationsState {
  const selected = {} as Record<SpecialSituationKey, boolean>
  for (const k of SPECIAL_OPTION_KEYS) selected[k] = false
  return {
    selected,
    details: {
      bituachLeumiAmount: '',
      disabilityPercent: '',
      tuitionPaid: '',
      donationsAmount: '',
      selfEmployedGross: '',
      foreignIncomeAmount: '',
      foreignIncomeCountry: '',
      maternityMonths: '',
    },
  }
}

export function setSpecialSelected(
  prev: SpecialSituationsState,
  key: SpecialSituationKey,
  value: boolean,
): SpecialSituationsState {
  const selected = { ...prev.selected }
  if (key === 'noneOfAbove') {
    if (value) {
      for (const k of SPECIAL_OPTION_KEYS) selected[k] = k === 'noneOfAbove'
    } else {
      selected.noneOfAbove = false
    }
    return { ...prev, selected }
  }
  selected[key] = value
  if (value) selected.noneOfAbove = false
  return { ...prev, selected }
}

export function hasAnySpecialExceptNone(s: SpecialSituationsState): boolean {
  return SPECIAL_OPTION_KEYS.some((k) => k !== 'noneOfAbove' && s.selected[k])
}

/** שורות להודעת צירוף מסמכים בהעלאת 106 (לפי מצבים מיוחדים בשאלון). */
const ATTACHMENT_HINTS: Partial<
  Record<Exclude<SpecialSituationKey, 'noneOfAbove'>, string>
> = {
  disabilityRecognized: 'אישור נכות ממשרד הבריאות / ביטוח לאומי',
  charityDonations: 'קבלות תרומה מעמותות מוכרות',
  academicDegree: 'קבלות שכר לימוד',
  bituachLeumi: 'אישור תשלומים מביטוח לאומי',
  foreignIncome: 'אישור מס ממדינת המקור',
  maternityLeave: 'אישור חופשת לידה ממעסיק',
  selfEmployedSameYear: 'אישורים להכנסות מעצמאות (לפי דרישות רשות המסים)',
}

const ATTACHMENT_HINT_ORDER: Exclude<SpecialSituationKey, 'noneOfAbove'>[] = [
  'disabilityRecognized',
  'charityDonations',
  'academicDegree',
  'bituachLeumi',
  'foreignIncome',
  'maternityLeave',
  'selfEmployedSameYear',
]

export function attachmentHintsForSpecialSituations(s: SpecialSituationsState): string[] {
  const out: string[] = []
  for (const k of ATTACHMENT_HINT_ORDER) {
    if (s.selected[k]) {
      const line = ATTACHMENT_HINTS[k]
      if (line) out.push(line)
    }
  }
  return out
}

export function specialSituationsToAdjustments(s: SpecialSituationsState): SpecialSituationsAdjustments {
  const { selected, details } = s
  const n = (x: string) => {
    const v = parseFloat(String(x).replace(/[,₪\s]/g, ''))
    return Number.isFinite(v) && v >= 0 ? v : 0
  }
  const out: SpecialSituationsAdjustments = {}
  if (selected.bituachLeumi) out.bituachLeumiBenefits = n(details.bituachLeumiAmount)
  if (selected.disabilityRecognized && details.disabilityPercent)
    out.disabilityPercent = Number(details.disabilityPercent)
  if (selected.academicDegree) out.tuitionPaid = n(details.tuitionPaid)
  if (selected.charityDonations) out.donationsAmount = n(details.donationsAmount)
  if (selected.selfEmployedSameYear) out.selfEmployedGross = n(details.selfEmployedGross)
  if (selected.foreignIncome) {
    out.foreignIncomeAmount = n(details.foreignIncomeAmount)
    if (details.foreignIncomeCountry.trim()) out.foreignIncomeCountry = details.foreignIncomeCountry.trim()
  }
  if (selected.maternityLeave && details.maternityMonths)
    out.maternityMonths = Number(details.maternityMonths)
  return out
}

export type SpecialFollowUpErrors = Partial<Record<string, string>>

/** מדינות נפוצות לבחירה (הכנסות מחו״ל). */
export const FOREIGN_COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'בחר מדינה' },
  { value: 'ארצות הברית', label: 'ארצות הברית' },
  { value: 'הממלכה המאוחדת', label: 'הממלכה המאוחדת' },
  { value: 'גרמניה', label: 'גרמניה' },
  { value: 'צרפת', label: 'צרפת' },
  { value: 'קנדה', label: 'קנדה' },
  { value: 'אוסטרליה', label: 'אוסטרליה' },
  { value: 'שוויץ', label: 'שוויץ' },
  { value: 'ספרד', label: 'ספרד' },
  { value: 'איטליה', label: 'איטליה' },
  { value: 'איחוד האמירויות', label: 'איחוד האמירויות' },
]

const nis = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString('he-IL', { maximumFractionDigits: 0 }) : ''

export function formatSpecialSituationsForSummary(s: SpecialSituationsState): string {
  if (s.selected.noneOfAbove && !hasAnySpecialExceptNone(s)) {
    return 'מצבים מיוחדים: המשתמש/ת ציין/ה שאף אחד מהמצבים הרשומים אינו רלוונטי.'
  }
  const parts: string[] = []
  const { selected, details } = s
  const parseN = (x: string) => {
    const v = parseFloat(String(x).replace(/[,₪\s]/g, ''))
    return Number.isFinite(v) ? v : 0
  }
  if (selected.bituachLeumi)
    parts.push(`קצבת ביטוח לאומי (סה״כ שנתי משוער): ₪${nis(parseN(details.bituachLeumiAmount))}`)
  if (selected.disabilityRecognized && details.disabilityPercent)
    parts.push(`נכות מוכרת: ${details.disabilityPercent}%`)
  if (selected.academicDegree)
    parts.push(`שכר לימוד לתואר (משוער): ₪${nis(parseN(details.tuitionPaid))}`)
  if (selected.charityDonations)
    parts.push(`תרומות לעמותות (משוער): ₪${nis(parseN(details.donationsAmount))}`)
  if (selected.selfEmployedSameYear)
    parts.push(`הכנסה כעצמאי ברוטו (משוער): ₪${nis(parseN(details.selfEmployedGross))}`)
  if (selected.foreignIncome) {
    const c = details.foreignIncomeCountry.trim() || 'לא צוין'
    parts.push(`הכנסות מחו״ל: ₪${nis(parseN(details.foreignIncomeAmount))}, מדינה: ${c}`)
  }
  if (selected.maternityLeave && details.maternityMonths)
    parts.push(`חופשת לידה: ${details.maternityMonths} חודשים`)
  return parts.length
    ? `מצבים מיוחדים (לפי הצהרת המשתמש/ת):\n${parts.map((p) => `• ${p}`).join('\n')}`
    : 'מצבים מיוחדים: לא צוינו פרטים.'
}

export function validateSpecialFollowUps(s: SpecialSituationsState): SpecialFollowUpErrors {
  const e: SpecialFollowUpErrors = {}
  const reqNum = (val: string, field: string) => {
    const v = parseFloat(String(val).replace(/[,₪\s]/g, ''))
    if (!Number.isFinite(v) || v < 0) e[field] = 'נא להזין סכום תקין (מספר חיובי)'
  }
  const { selected, details } = s
  if (selected.bituachLeumi) reqNum(details.bituachLeumiAmount, 'bituachLeumiAmount')
  if (selected.disabilityRecognized && !details.disabilityPercent)
    e.disabilityPercent = 'נא לבחור אחוז נכות'
  if (selected.academicDegree) reqNum(details.tuitionPaid, 'tuitionPaid')
  if (selected.charityDonations) reqNum(details.donationsAmount, 'donationsAmount')
  if (selected.selfEmployedSameYear) reqNum(details.selfEmployedGross, 'selfEmployedGross')
  if (selected.foreignIncome) {
    reqNum(details.foreignIncomeAmount, 'foreignIncomeAmount')
    if (!details.foreignIncomeCountry.trim()) e.foreignIncomeCountry = 'נא לבחור או להזין מדינה'
  }
  if (selected.maternityLeave && !details.maternityMonths) e.maternityMonths = 'נא לבחור מספר חודשים'
  return e
}
