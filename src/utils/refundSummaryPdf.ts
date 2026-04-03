import { jsPDF } from 'jspdf'

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const sub = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...sub)
  }
  return btoa(binary)
}

let hebrewFontRegistered = false

/** טוען Noto Sans Hebrew מ־CDN ומוסיף ל-jsPDF (פעם אחת ברuntime) */
async function ensureHebrewFont(doc: jsPDF): Promise<void> {
  if (hebrewFontRegistered) {
    doc.setFont('NotoSansHebrew', 'normal')
    return
  }

  const fontUrl =
    'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@a736380bdf46538487bcd175012246052e9744e0/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf'

  const res = await fetch(fontUrl)
  if (!res.ok) throw new Error('font_load_failed')

  const buf = await res.arrayBuffer()
  const b64 = arrayBufferToBase64(buf)
  doc.addFileToVFS('NotoSansHebrew-Regular.ttf', b64)
  doc.addFont('NotoSansHebrew-Regular.ttf', 'NotoSansHebrew', 'normal')
  hebrewFontRegistered = true
  doc.setFont('NotoSansHebrew', 'normal')
}

function sanitizeFilenamePart(s: string): string {
  const t = s
    .split('')
    .filter((ch) => !/[\\/:*?"<>|]/.test(ch) && ch >= ' ')
    .join('')
    .trim()
  return t.slice(0, 80) || 'קובץ'
}

export type RefundSummaryPdfParams = {
  taxYear: string
  firstName: string
  bodyText: string
}

/**
 * יוצר PDF בעברית, יישור לימין (RTL) שורה־שורה, ומוריד קובץ.
 */
export async function downloadRefundSummaryPdf(params: RefundSummaryPdfParams): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  await ensureHebrewFont(doc)

  doc.setFontSize(11)
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18
  const maxWidth = pageWidth - 2 * margin
  let y = margin
  const lineHeight = 6.2

  const normalized = params.bodyText.replace(/\r\n/g, '\n').trim()
  const lines = doc.splitTextToSize(normalized, maxWidth)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (y > pageHeight - margin) {
      doc.addPage()
      y = margin
      doc.setFont('NotoSansHebrew', 'normal')
      doc.setFontSize(11)
    }
    doc.text(line, pageWidth - margin, y, { align: 'right', maxWidth })
    y += lineHeight
  }

  const year = sanitizeFilenamePart(params.taxYear)
  const name = sanitizeFilenamePart(params.firstName)
  doc.save(`החזר-מס-${year}-${name}.pdf`)
}
