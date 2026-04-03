export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export type ChildrenUnder18Band = '0' | '1' | '2' | '3' | '4plus'

export const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'רווק' },
  { value: 'married', label: 'נשוי' },
  { value: 'divorced', label: 'גרוש' },
  { value: 'widowed', label: 'אלמן' },
]

export const CHILDREN_UNDER_18_OPTIONS: { value: ChildrenUnder18Band; label: string }[] = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4plus', label: '4+' },
]

/** מספר ילדים לחישוב נקודות זיכוי (טווח 4+ → 4 לפחות). */
export function childrenUnder18BandToCount(band: ChildrenUnder18Band | null | undefined): number {
  if (band == null) return 0
  if (band === '4plus') return 4
  return Number(band)
}

export function maritalStatusLabelHe(status: MaritalStatus | null | undefined): string {
  if (status == null) return 'לא צוין'
  const o = MARITAL_STATUS_OPTIONS.find((x) => x.value === status)
  return o?.label ?? 'לא צוין'
}

export function childrenUnder18BandLabel(band: ChildrenUnder18Band | null | undefined): string {
  if (band == null) return 'לא צוין'
  const o = CHILDREN_UNDER_18_OPTIONS.find((x) => x.value === band)
  return o?.label ?? String(childrenUnder18BandToCount(band))
}

export type PersonalDetails = {

  firstName: string

  lastName: string

  phone: string

  email: string

  taxYear: string

  maritalStatus: MaritalStatus | null

  childrenUnder18Count: ChildrenUnder18Band | null

}



export type YesNo = 'yes' | 'no' | null



/** טווחי הכנסה שנתית לשאלון (לפני שאלות כן/לא). */

export type AnnualIncomeBracket = 'under60' | '60to120' | '120to200' | 'above200'



export const ANNUAL_INCOME_OPTIONS: { value: AnnualIncomeBracket; label: string }[] = [

  { value: 'under60', label: 'עד ₪60,000' },

  { value: '60to120', label: '₪60,000-120,000' },

  { value: '120to200', label: '₪120,000-200,000' },

  { value: 'above200', label: 'מעל ₪200,000' },

]



export type CriticalAnswers = {

  annualIncome: AnnualIncomeBracket | null

  multiEmployer: YesNo

  pensionWithdrawal: YesNo

  unemployment: YesNo

  lifeInsurance: YesNo

  childrenUnder18: YesNo

  academicStudies: YesNo

  charity: YesNo

  rentalIncome: YesNo

}



export const initialCriticalAnswers: CriticalAnswers = {

  annualIncome: null,

  multiEmployer: null,

  pensionWithdrawal: null,

  unemployment: null,

  lifeInsurance: null,

  childrenUnder18: null,

  academicStudies: null,

  charity: null,

  rentalIncome: null,

}



const YES_NO_KEYS = [

  'multiEmployer',

  'pensionWithdrawal',

  'unemployment',

  'lifeInsurance',

  'childrenUnder18',

  'academicStudies',

  'charity',

  'rentalIncome',

] as const satisfies readonly Exclude<keyof CriticalAnswers, 'annualIncome'>[]



export function countYesAnswers(a: CriticalAnswers): number {

  return YES_NO_KEYS.filter((k) => a[k] === 'yes').length

}



export function isLikelyEligible(a: CriticalAnswers): boolean {

  return countYesAnswers(a) >= 2

}



export function estimatedRefundRange(yesCount: number, annualIncome: string): string {

  let base = 800

  if (annualIncome === 'under60') base = 800

  else if (annualIncome === '60to120') base = 1500

  else if (annualIncome === '120to200') base = 2500

  else if (annualIncome === 'above200') base = 3500



  const bonus = yesCount * 400

  const low = base + bonus

  const high = low * 2.8



  return `₪${low.toLocaleString('he-IL')} – ₪${Math.round(high).toLocaleString('he-IL')}`

}

