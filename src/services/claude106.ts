import { CLAUDE_DEMO_MODE } from '../config/claude'
import { computeRefundNis, type SpecialSituationsAdjustments } from '../utils/computeRefundNis'

export type Extracted106 = {
  grossSalary: number | null
  taxWithheld: number | null
  creditPoints: number | null
}

export type Analyze106Result = Extracted106 & {
  refundNis: number
}

/** הקשר מהשאלון — משפיע על נקודות זיכוי ב־computeRefundNis */
export type Analyze106Context = {
  maritalStatus?: string
  childrenCount?: number
  specialAdjustments?: SpecialSituationsAdjustments
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const s = r.result as string
      const i = s.indexOf(',')
      resolve(i >= 0 ? s.slice(i + 1) : s)
    }
    r.onerror = () => reject(new Error('read_failed'))
    r.readAsDataURL(file)
  })
}

function mediaBlockForFile(file: File, base64: string): Record<string, unknown> {
  const type = file.type || ''
  const name = file.name.toLowerCase()

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return {
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: base64,
      },
    }
  }

  let mediaType = 'image/jpeg'
  if (type === 'image/png' || name.endsWith('.png')) mediaType = 'image/png'
  else if (type === 'image/webp' || name.endsWith('.webp')) mediaType = 'image/webp'
  else if (type === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg')) mediaType = 'image/jpeg'

  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType,
      data: base64,
    },
  }
}

/** Error code thrown when the model decides the upload is not a valid טופס 106 */
export const CLAUDE_NOT_FORM_106_CODE = 'claude_not_form_106'

/** User-facing Hebrew message for invalid non-106 uploads */
export const CLAUDE_NOT_FORM_106_MESSAGE_HE =
  'הקובץ שהעלית אינו טופס 106 תקין. אנא העלה את טופס 106 שקיבלת מהמעסיק שלך.'

function parse106ModelResponse(text: string): Extracted106 {
  let t = text.trim()
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t)
  if (fence) t = fence[1].trim()

  const obj = JSON.parse(t) as Record<string, unknown>
  const valid = obj.validForm106
  if (valid === false) {
    throw new Error(CLAUDE_NOT_FORM_106_CODE)
  }
  if (valid !== true) {
    throw new Error('claude_invalid_response_shape')
  }

  const num = (v: unknown): number | null => {
    if (v == null) return null
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string') {
      const n = Number(String(v).replace(/[,₪\s]/g, ''))
      return Number.isFinite(n) ? n : null
    }
    return null
  }

  return {
    grossSalary: num(obj.grossSalary),
    taxWithheld: num(obj.taxWithheld),
    creditPoints: num(obj.creditPoints),
  }
}

const EXTRACTION_PROMPT = `You analyze uploaded documents for an Israeli tax refund service.

STEP 1 — VALIDATION
Decide whether the document is a genuine Israeli employer annual tax summary for employees: טופס 106 (שכיר).
It should look like the standard form from an employer or payroll with typical Hebrew labels such as טופס 106, שכר, ניכוי מס במקור, מס הכנסה, נקודות זיכוי, שנת מס, פרטי מעסיק, and annual employment income summaries.

Set validForm106 to false if ANY of these apply:
- The file is not a טופס 106 (e.g. invoice, contract, bank statement, foreign tax form, random letter, screenshot without form structure, another נוסח entirely).
- The image/PDF is illegible, blank, or too incomplete to identify as טופס 106.
- You are not confident it is the Israeli employee טופס 106 from an employer.

STEP 2 — EXTRACTION (only if validForm106 is true)
Extract ONLY these fields as numbers in NIS (no currency symbols in JSON values):
- grossSalary: total annual employment gross / שכר ברוטו שנתי (main employment total from the form)
- taxWithheld: total income tax withheld at source for the year / מס הכנסה שנוכה במקור (annual)
- creditPoints: נקודות זיכוי if explicitly shown (e.g. 2.25). If not visible, null.

If a numeric value cannot be determined, use null for that field.

OUTPUT (return ONLY valid JSON, no markdown, no extra text):
If the document is NOT a valid טופס 106:
{"validForm106":false}

If it IS a valid טופס 106:
{"validForm106":true,"grossSalary":number|null,"taxWithheld":number|null,"creditPoints":number|null}`

/** Same tax year, multiple employers: sum ברוטו וניכוי במקור; נקודות זיכוי — לרוב זהות בין טפסים, לוקחים את המקסימום אם יש כמה ערכים */
function mergeExtracted106FromEmployers(parts: Extracted106[]): Extracted106 {
  if (parts.length === 0) {
    return { grossSalary: null, taxWithheld: null, creditPoints: null }
  }
  const grossSum = parts.reduce((s, p) => s + (p.grossSalary ?? 0), 0)
  const withheldSum = parts.reduce((s, p) => s + (p.taxWithheld ?? 0), 0)
  const creditValues = parts
    .map((p) => p.creditPoints)
    .filter((v): v is number => v != null && Number.isFinite(v))
  const creditPoints = creditValues.length === 0 ? null : Math.max(...creditValues)
  return {
    grossSalary: grossSum > 0 ? grossSum : null,
    taxWithheld: withheldSum > 0 ? withheldSum : null,
    creditPoints,
  }
}

function finalize106Analysis(extracted: Extracted106, context?: Analyze106Context): Analyze106Result {
  const maritalStatus = context?.maritalStatus ?? 'single'
  const childrenCount = context?.childrenCount ?? 0
  const specialAdjustments = context?.specialAdjustments

  const gross = extracted.grossSalary ?? 0
  const withheld = extracted.taxWithheld ?? 0

  if (gross <= 0) {
    throw new Error('claude_insufficient_numbers')
  }

  const refundNis = computeRefundNis(
    gross,
    withheld,
    extracted.creditPoints,
    maritalStatus,
    childrenCount,
    specialAdjustments,
  )

  return { ...extracted, refundNis }
}

async function extract106FromFile(
  file: File,
  options?: { demoEmployerIndex?: number },
): Promise<Extracted106> {
  const demoIdx = options?.demoEmployerIndex

  if (CLAUDE_DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, demoIdx !== undefined ? 1800 : 3000))
    if (demoIdx === 1) {
      return { grossSalary: 95000, taxWithheld: 12000, creditPoints: 2.25 }
    }
    return { grossSalary: 120000, taxWithheld: 18000, creditPoints: 2.25 }
  }

  const model = import.meta.env.VITE_ANTHROPIC_MODEL || DEFAULT_MODEL
  const base64 = await fileToBase64(file)
  const content: unknown[] = [mediaBlockForFile(file, base64), { type: 'text', text: EXTRACTION_PROMPT }]

  const body = {
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content }],
  }

  const res = await fetch('/api/claude/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`claude_http_${res.status}${errText ? `: ${errText.slice(0, 200)}` : ''}`)
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[]
  }
  const textBlock = data.content?.find((c) => c.type === 'text')
  const text = textBlock?.text
  if (!text) throw new Error('claude_no_text')

  return parse106ModelResponse(text)
}

/**
 * ניתוח אחד או שני טפסי 106 (מעסיקים שונים): קריאות API מקבילות ואיחוד ברוטו + ניכוי במקור.
 */
export async function analyzeForm106FilesWithClaude(
  files: File[],
  context?: Analyze106Context,
): Promise<Analyze106Result> {
  if (files.length === 0) {
    throw new Error('no_106_files')
  }
  if (files.length > 2) {
    throw new Error('too_many_106_files')
  }

  const useDemoSplit = CLAUDE_DEMO_MODE && files.length > 1

  const extracts = await Promise.all(
    files.map((f, i) =>
      extract106FromFile(f, useDemoSplit ? { demoEmployerIndex: i } : undefined),
    ),
  )

  const merged = mergeExtracted106FromEmployers(extracts)
  return finalize106Analysis(merged, context)
}

export async function analyzeForm106WithClaude(
  file: File,
  context?: Analyze106Context,
): Promise<Analyze106Result> {
  return analyzeForm106FilesWithClaude([file], context)
}
