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

function parseExtractedJson(text: string): Extracted106 {
  let t = text.trim()
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t)
  if (fence) t = fence[1].trim()

  const obj = JSON.parse(t) as Record<string, unknown>
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

const EXTRACTION_PROMPT = `You are reading an Israeli employee annual tax summary form (טופס / טופס 106).

Extract ONLY these fields as numbers in NIS (no symbols in JSON values):
- grossSalary: total annual employment / שכר ברוטו שנתי (or main employment income total from the form)
- taxWithheld: total income tax withheld at source / מס הכנסה שנוכה במקור (annual)
- creditPoints: נקודות זיכוי if explicitly shown as a count (e.g. 2.25). If not visible, use null.

If a value cannot be determined, use null for that field.

Return ONLY valid JSON with this exact shape (no markdown):
{"grossSalary":number|null,"taxWithheld":number|null,"creditPoints":number|null}`

export async function analyzeForm106WithClaude(
  file: File,
  context?: Analyze106Context,
): Promise<Analyze106Result> {
  const maritalStatus = context?.maritalStatus ?? 'single'
  const childrenCount = context?.childrenCount ?? 0
  const specialAdjustments = context?.specialAdjustments

  if (CLAUDE_DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const gross = 120000
    const withheld = 18000
    const creditPoints = 2.25
    const refundNis = computeRefundNis(
      gross,
      withheld,
      creditPoints,
      maritalStatus,
      childrenCount,
      specialAdjustments,
    )
    return {
      grossSalary: gross,
      taxWithheld: withheld,
      creditPoints,
      refundNis,
    }
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

  const extracted = parseExtractedJson(text)
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
