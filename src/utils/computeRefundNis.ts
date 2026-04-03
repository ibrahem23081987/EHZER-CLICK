/**
 * הערכת החזר מס תיאורטית בלבד על בסיס ברוטו, ניכוי במקור ונקודות זיכוי.
 * לא מהווה ייעוץ מס — הנתונים מטופס 106 מלאים וכללי המס משתנים משנה לשנה.
 *
 * התאמות "מצבים מיוחדים" (הדגמה): קצבאות/עצמאי/חו"ל מוסיפים להכנסה החייבת,
 * נכות 60%+ מפחיתה בסיס חיוב, שכר לימוד ותרומות כזיכוי מהמס המשוער,
 * חופשת לידה — +0.5 נקודות זיכוי לחודש.
 * פרמיות ביטוח חיים/כושר עבודה — הטבת מס משוערת בדגם (לא ייעוץ).
 */
export type SpecialSituationsAdjustments = {
  bituachLeumiBenefits?: number
  disabilityPercent?: number
  tuitionPaid?: number
  donationsAmount?: number
  lifeInsurancePremiumsPaid?: number
  selfEmployedGross?: number
  foreignIncomeAmount?: number
  foreignIncomeCountry?: string
  maternityMonths?: number
}

export function computeRefundNis(
  grossAnnual: number,
  taxWithheld: number,
  creditPoints: number | null,
  maritalStatus: string = 'single',
  childrenCount: number = 0,
  special?: SpecialSituationsAdjustments,
): number {
  if (
    !Number.isFinite(grossAnnual) ||
    !Number.isFinite(taxWithheld) ||
    grossAnnual < 0 ||
    taxWithheld < 0
  ) {
    return 0
  }

  const s = special ?? {}

  const addToIncome =
    (s.bituachLeumiBenefits ?? 0) + (s.selfEmployedGross ?? 0) + (s.foreignIncomeAmount ?? 0)
  const incomeBase = grossAnnual + addToIncome

  const baseFromForm =
    creditPoints != null && Number.isFinite(creditPoints) ? creditPoints : 2.25
  const maritalBonus = maritalStatus === 'married' ? 0.5 : 0
  const safeChildren = Math.max(
    0,
    Number.isFinite(childrenCount) ? Math.floor(childrenCount) : 0,
  )
  const childrenBonus = safeChildren * 2.5
  const maternityBonus = Math.max(0, Math.min(6, Math.floor(s.maternityMonths ?? 0))) * 0.5

  const points = baseFromForm + maritalBonus + childrenBonus + maternityBonus

  const perPointExemption = 2810
  let taxable = Math.max(0, incomeBase - Math.max(0, points) * perPointExemption)

  const disabilityPct = s.disabilityPercent ?? 0
  if (disabilityPct >= 60) {
    taxable = taxable * 0.75
  }

  let estimatedLiability = marginalTaxIls(taxable)

  const tuition = Math.max(0, s.tuitionPaid ?? 0)
  estimatedLiability -= 0.2 * tuition

  const donations = Math.max(0, s.donationsAmount ?? 0)
  estimatedLiability -= 0.35 * Math.max(0, donations - 190)

  const lifePrem = Math.max(0, s.lifeInsurancePremiumsPaid ?? 0)
  estimatedLiability -= Math.min(0.18 * lifePrem, 15_000)

  estimatedLiability = Math.max(0, estimatedLiability)

  return Math.max(0, Math.round(taxWithheld - estimatedLiability))
}

function marginalTaxIls(taxable: number): number {
  if (taxable <= 0) return 0
  let tax = 0
  let rest = taxable

  const s1 = Math.min(rest, 84_120)
  tax += s1 * 0.1
  rest -= s1
  if (rest <= 0) return tax

  const s2 = Math.min(rest, 120_720 - 84_120)
  tax += s2 * 0.14
  rest -= s2
  if (rest <= 0) return tax

  const s3 = Math.min(rest, 193_800 - 120_720)
  tax += s3 * 0.2
  rest -= s3
  if (rest <= 0) return tax

  tax += rest * 0.31
  return tax
}
