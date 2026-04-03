import { CLAUDE_DEMO_MODE } from '../config/claude'
import type { MaritalStatus } from '../types/forms'
import {
  SPECIAL_OPTION_LABELS,
  attachmentHintsForSpecialSituations,
  hasAnySpecialExceptNone,
  specialSituationsToAdjustments,
  type SpecialSituationsState,
} from '../types/specialSituations'

export type RefundSummaryInput = {
  firstName: string
  lastName: string
  taxYear: string
  maritalStatusHe: string
  /** לחישוב נקודות (+0.5 לנשוי) */
  maritalStatus: MaritalStatus | null
  childrenLabel: string
  childrenCount: number
  grossSalary: number
  taxWithheld: number
  creditPoints: number | null
  refundNis: number
  specialSituations?: SpecialSituationsState | null
}

const SEP = '─────────────────────────────────'

/** ערך נקודת זיכוי לתצוגה במסמך — לשנת 2024 לפי תבנית המשתמש. */
function creditPointShekelForYear(taxYear: string): number {
  if (taxYear.trim() === '2024') return 2904
  return 2810
}

function fmtNis(n: number): string {
  return n.toLocaleString('he-IL', { maximumFractionDigits: 0 })
}

function fmtPoints(n: number): string {
  return n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function parseAmt(t: string): number {
  const v = parseFloat(String(t).replace(/[,₪\s]/g, ''))
  return Number.isFinite(v) ? v : 0
}

function extraCreditPointsLines(
  maritalStatus: MaritalStatus | null,
  childrenCount: number,
  special: SpecialSituationsState | null | undefined,
): string[] {
  const out: string[] = []
  if (maritalStatus === 'married') out.push('- נשוי: +0.5 נקודות')

  const safeChild = Math.max(0, Math.floor(Number.isFinite(childrenCount) ? childrenCount : 0))
  if (safeChild > 0) {
    const pts = safeChild * 2.5
    out.push(`- ילדים (${safeChild} × 2.5): +${fmtPoints(pts)} נקודות`)
  }

  let matM = 0
  if (special?.selected.maternityLeave && special.details.maternityMonths)
    matM = Math.max(0, Math.min(6, Math.floor(Number(special.details.maternityMonths))))

  if (matM > 0) {
    const pts = matM * 0.5
    out.push(`- חופשת לידה: +0.5 × ${matM} חודשים = +${fmtPoints(pts)} נקודות`)
  }

  if (special && hasAnySpecialExceptNone(special)) {
    const names = SPECIAL_LINE_ORDER.filter((k) => special.selected[k]).map(
      (k) => SPECIAL_OPTION_LABELS[k],
    )
    if (names.length)
      out.push(
        `- מצבים מיוחדים (פירוט סכומים וזיכויים משוערים בסעיף „מצבים מיוחדים שדווחו”): ${names.join('؛ ')}`,
      )
  }

  if (out.length === 0) out.push('- לא חלו נקודות זיכוי נוספות מנישואין/ילדים/חופשת לידה בדגם זה.')

  return out
}

function totalCreditPoints(
  creditPoints: number | null,
  maritalStatus: MaritalStatus | null,
  childrenCount: number,
  special: SpecialSituationsState | null | undefined,
): number {
  const baseFromForm =
    creditPoints != null && Number.isFinite(creditPoints) ? creditPoints : 2.25
  const maritalBonus = maritalStatus === 'married' ? 0.5 : 0
  const safeChildren = Math.max(
    0,
    Math.floor(Number.isFinite(childrenCount) ? childrenCount : 0),
  )
  const childrenBonus = safeChildren * 2.5
  const adj = special ? specialSituationsToAdjustments(special) : {}
  const matM = Math.max(0, Math.min(6, Math.floor(adj.maternityMonths ?? 0)))
  const maternityBonus = matM * 0.5
  return baseFromForm + maritalBonus + childrenBonus + maternityBonus
}

const SPECIAL_LINE_ORDER = [
  'bituachLeumi',
  'disabilityRecognized',
  'academicDegree',
  'charityDonations',
  'lifeInsurancePremiums',
  'selfEmployedSameYear',
  'foreignIncome',
  'maternityLeave',
] as const

function reportedSpecialSituationsLines(
  s: SpecialSituationsState | null | undefined,
  pointValueNis: number,
): string[] {
  if (!s) return ['- לא הוזנו נתוני מצבים מיוחדים דרך השאלון.']

  if (s.selected.noneOfAbove && !hasAnySpecialExceptNone(s))
    return ['- לא דווחו מצבים מיוחדים (נבחר „לא אף אחד מהנ״ל”).']

  const lines: string[] = []

  for (const key of SPECIAL_LINE_ORDER) {
    if (!s.selected[key]) continue
    const lbl = SPECIAL_OPTION_LABELS[key]

    switch (key) {
      case 'bituachLeumi': {
        const a = parseAmt(s.details.bituachLeumiAmount)
        lines.push(
          `- ${lbl}: סכום שהוזן ₪${fmtNis(a)} — נכלל באומדן בהרחבת בסיס ההכנסה החייבת (ללא זיכוי מס נפרד בדגם זה)`,
        )
        break
      }
      case 'disabilityRecognized': {
        const p = Number(s.details.disabilityPercent) || 0
        if (p >= 60)
          lines.push(
            `- ${lbl}: ${p}% — הפחתת בסיס חיוב של 25% בדגם המערכת (השפעה על גובה המס המשוער)`,
          )
        else
          lines.push(
            `- ${lbl}: ${p}% — ללא הפחתת בסיס חיוב בדגם זה (מתחת ל-60%)`,
          )
        break
      }
      case 'academicDegree': {
        const a = parseAmt(s.details.tuitionPaid)
        const cred = Math.round(a * 0.2)
        lines.push(`- ${lbl}: שכ״ל ₪${fmtNis(a)} — זיכוי משוער מהמס (20%): ₪${fmtNis(cred)}`)
        break
      }
      case 'charityDonations': {
        const a = parseAmt(s.details.donationsAmount)
        const cred = Math.round(0.35 * Math.max(0, a - 190))
        lines.push(
          `- ${lbl}: תרומות ₪${fmtNis(a)} — זיכוי משוער (35% מסכום מעל ₪190): ₪${fmtNis(cred)}`,
        )
        break
      }
      case 'lifeInsurancePremiums': {
        const a = parseAmt(s.details.lifeInsuranceAnnualPaid)
        const cred = Math.round(Math.min(0.18 * a, 15_000))
        lines.push(
          `- ${lbl}: פרמיות ₪${fmtNis(a)} — הטבת מס משוערת בדגם (עד ₪${fmtNis(cred)}): ₪${fmtNis(cred)}`,
        )
        break
      }
      case 'selfEmployedSameYear': {
        const a = parseAmt(s.details.selfEmployedGross)
        lines.push(
          `- ${lbl}: הכנסה ברוטו ₪${fmtNis(a)} — נכלל באומדן בהרחבת בסיס ההכנסה החייבת`,
        )
        break
      }
      case 'foreignIncome': {
        const a = parseAmt(s.details.foreignIncomeAmount)
        const c = s.details.foreignIncomeCountry.trim() || 'לא צוין'
        lines.push(
          `- ${lbl}: סכום ₪${fmtNis(a)}, מדינה: ${c} — נכלל באומדן בהרחבת בסיס ההכנסה החייבת`,
        )
        break
      }
      case 'maternityLeave': {
        const m = Math.max(0, Math.min(6, Math.floor(Number(s.details.maternityMonths) || 0)))
        const pts = m * 0.5
        const cred = Math.round(pts * pointValueNis)
        lines.push(
          `- ${lbl}: ${m} חודשים — +${fmtPoints(pts)} נקודות זיכוי — שווי נק׳ משוער: ₪${fmtNis(cred)}`,
        )
        break
      }
    }
  }

  if (lines.length === 0) lines.push('- לא דווחו מצבים מיוחדים.')
  return lines
}

function documentsSection(s: SpecialSituationsState | null | undefined): string[] {
  const docLines =
    s && hasAnySpecialExceptNone(s)
      ? attachmentHintsForSpecialSituations(s).map((d) => `- ${d}`)
      : []
  const with106 = [...docLines, '- טופס 106 ממעסיק']
  return with106
}

function buildStructuredRefundSummary(input: RefundSummaryInput): string {
  const pointVal = creditPointShekelForYear(input.taxYear)
  const totalPts = totalCreditPoints(
    input.creditPoints,
    input.maritalStatus,
    input.childrenCount,
    input.specialSituations,
  )
  const creditFromPointsNis = Math.round(totalPts * pointVal)

  const creditFromFormStr =
    input.creditPoints != null && Number.isFinite(input.creditPoints)
      ? fmtPoints(input.creditPoints)
      : 'לא צוין (בדגם: שימוש ב־2.25)'

  const pointLabelYear =
    input.taxYear.trim() === '2024'
      ? 'ערך נקודת זיכוי 2024'
      : `ערך נקודת זיכוי (הערכה לשנת המס ${input.taxYear})`

  const parts: string[] = []

  parts.push(SEP)
  parts.push('סיכום בקשת החזר מס הכנסה')
  parts.push(`שנת המס: ${input.taxYear}`)
  parts.push(SEP)
  parts.push('')
  parts.push('פרטים אישיים:')
  parts.push(`- שם מלא: ${input.firstName} ${input.lastName}`)
  parts.push(`- מצב משפחתי: ${input.maritalStatusHe}`)
  parts.push(`- מספר ילדים מתחת לגיל 18: ${input.childrenLabel} (${input.childrenCount} לצורך נקודות זיכוי)`)
  parts.push('')
  parts.push('נתוני טופס 106:')
  parts.push(`- שכר ברוטו שנתי: ₪${fmtNis(input.grossSalary)}`)
  parts.push(`- מס הכנסה שנוכה במקור: ₪${fmtNis(input.taxWithheld)}`)
  parts.push(`- נקודות זיכוי מהטופס: ${creditFromFormStr}`)
  parts.push('')
  parts.push('נקודות זיכוי נוספות:')
  parts.push(
    ...extraCreditPointsLines(
      input.maritalStatus,
      input.childrenCount,
      input.specialSituations,
    ),
  )
  parts.push('')
  parts.push('מצבים מיוחדים שדווחו:')
  parts.push(...reportedSpecialSituationsLines(input.specialSituations, pointVal))
  parts.push('')
  parts.push('חישוב ההחזר:')
  parts.push(`- סך נקודות זיכוי (בדגם המערכת): ${fmtPoints(totalPts)}`)
  parts.push(`- ${pointLabelYear}: ₪${fmtNis(pointVal)}`)
  parts.push(`- זיכוי ממס (לפי נקודות × ערך הנקודה בדגם זה): ₪${fmtNis(creditFromPointsNis)}`)
  parts.push(`- מס ששולם (ניכוי במקור מהטופס): ₪${fmtNis(input.taxWithheld)}`)
  parts.push(`- החזר משוער: ₪${fmtNis(input.refundNis)}`)
  parts.push('')
  parts.push('מסמכים לצירוף:')
  parts.push(...documentsSection(input.specialSituations))
  parts.push('')
  parts.push(SEP)
  parts.push('* מסמך זה הוכן על בסיס הנתונים שהוזנו בלבד')
  parts.push('* ואינו מהווה ייעוץ מס מקצועי')
  parts.push('* הסכום הסופי ייקבע על ידי רשות המסים')
  parts.push(SEP)

  return parts.join('\n')
}

/**
 * יוצר טקסט סיכום ל-PDF בעברית — פורמט קבוע עם כל הנתונים (דמו וייצור).
 */
export async function generateRefundSummaryHebrew(input: RefundSummaryInput): Promise<string> {
  if (CLAUDE_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1200))
  }
  return buildStructuredRefundSummary(input)
}
