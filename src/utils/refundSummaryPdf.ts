import { jsPDF } from 'jspdf'

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
 * יוצר PDF עם יישור לימין (RTL) שורה־שורה, ומוריד קובץ.
 * משתמש בגופן המובנה של jsPDF (Helvetica) — ללא טעינת גופן מרשת, כדי שלא ייכשלו בקשות CDN.
 * טקסט עברי עשוי להופיע חלקית/לא מושלם לעומת גופן עברי מוטמע.
 */
export function downloadRefundSummaryPdf(params: RefundSummaryPdfParams): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setFont('helvetica', 'normal')
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
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
    }
    doc.text(line, pageWidth - margin, y, { align: 'right', maxWidth })
    y += lineHeight
  }

  const year = sanitizeFilenamePart(params.taxYear)
  const name = sanitizeFilenamePart(params.firstName)
  doc.save(`החזר-מס-${year}-${name}.pdf`)
}
