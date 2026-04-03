import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  value: string | null
  onChange: (dataUrl: string | null) => void
  className?: string
}

function getCanvasPoint(canvas: HTMLCanvasElement, e: PointerEvent) {
  const rect = canvas.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height
  return { x, y }
}

export function SignaturePad({ value, onChange, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const [hasDrawn, setHasDrawn] = useState(Boolean(value))

  const hint = useMemo(
    () => (hasDrawn ? 'חתימה נקלטה. ניתן לנקות ולחתום מחדש.' : 'חתום/חתמי כאן באמצעות עכבר או מסך מגע.'),
    [hasDrawn],
  )

  function resizeForHiDpi() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
    const rect = canvas.getBoundingClientRect()
    const nextW = Math.max(1, Math.floor(rect.width * dpr))
    const nextH = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width === nextW && canvas.height === nextH) return
    const prev = canvas.toDataURL('image/png')
    canvas.width = nextW
    canvas.height = nextH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (prev && hasDrawn) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = prev
    }
  }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onChange(null)
    setHasDrawn(false)
  }

  useEffect(() => {
    resizeForHiDpi()
    const onResize = () => resizeForHiDpi()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (!value) return
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setHasDrawn(true)
    }
    img.src = value
  }, [value])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1e3a5f'
    ctx.lineWidth = 3

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      isDrawingRef.current = true
      canvas.setPointerCapture(e.pointerId)
      lastRef.current = getCanvasPoint(canvas, e)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      const last = lastRef.current
      if (!last) return
      const next = getCanvasPoint(canvas, e)
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(next.x, next.y)
      ctx.stroke()
      lastRef.current = next
      if (!hasDrawn) setHasDrawn(true)
    }

    const end = () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      lastRef.current = null
      const dataUrl = canvas.toDataURL('image/png')
      onChange(dataUrl)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', end)
    canvas.addEventListener('pointercancel', end)
    canvas.addEventListener('pointerleave', end)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', end)
      canvas.removeEventListener('pointercancel', end)
      canvas.removeEventListener('pointerleave', end)
    }
  }, [hasDrawn, onChange])

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-navy/60">{hint}</p>
        <button
          type="button"
          onClick={clear}
          className="shrink-0 rounded-lg border border-navy/20 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-navy/5"
        >
          נקה
        </button>
      </div>
      <div className="mt-2 overflow-hidden rounded-2xl border border-navy/15 bg-white shadow-sm">
        <canvas ref={canvasRef} className="h-44 w-full touch-none" aria-label="לוח חתימה דיגיטלית" />
      </div>
    </div>
  )
}

