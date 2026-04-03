import { useCallback, useEffect, useId, useState } from 'react'

const LS_FONT = 'ehzer-a11y-font'
const LS_CONTRAST = 'ehzer-a11y-contrast'
const LS_UNDERLINE = 'ehzer-a11y-underline'

function readLs(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLs(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function applyToDocument(fontStep: number, highContrast: boolean, underlineLinks: boolean) {
  const root = document.documentElement
  root.dataset.a11yFont = String(Math.max(0, Math.min(3, fontStep)))
  root.toggleAttribute('data-a11y-contrast-high', highContrast)
  root.toggleAttribute('data-a11y-links-underline', underlineLinks)
}

export function AccessibilityWidget() {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [fontStep, setFontStep] = useState(0)
  const [highContrast, setHighContrast] = useState(false)
  const [underlineLinks, setUnderlineLinks] = useState(false)

  useEffect(() => {
    const f = parseInt(readLs(LS_FONT) ?? '0', 10)
    const c = readLs(LS_CONTRAST) === '1'
    const u = readLs(LS_UNDERLINE) === '1'
    const fs = Number.isFinite(f) ? Math.max(0, Math.min(3, f)) : 0
    setFontStep(fs)
    setHighContrast(c)
    setUnderlineLinks(u)
    applyToDocument(fs, c, u)
  }, [])

  const persist = useCallback((fs: number, hc: boolean, ul: boolean) => {
    writeLs(LS_FONT, String(fs))
    writeLs(LS_CONTRAST, hc ? '1' : '0')
    writeLs(LS_UNDERLINE, ul ? '1' : '0')
    applyToDocument(fs, hc, ul)
  }, [])

  const bumpFont = (delta: number) => {
    const next = Math.max(0, Math.min(3, fontStep + delta))
    setFontStep(next)
    persist(next, highContrast, underlineLinks)
  }

  const resetFont = () => {
    setFontStep(0)
    persist(0, highContrast, underlineLinks)
  }

  const toggleContrast = () => {
    const next = !highContrast
    setHighContrast(next)
    persist(fontStep, next, underlineLinks)
  }

  const toggleUnderline = () => {
    const next = !underlineLinks
    setUnderlineLinks(next)
    persist(fontStep, highContrast, next)
  }

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col items-start gap-2">
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="הגדרות נגישות"
          className="w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-navy/20 bg-white p-4 shadow-xl shadow-navy/15 ring-1 ring-navy/10"
        >
          <p className="text-sm font-bold text-navy">נגישות</p>
          <div className="mt-3 space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-navy/80">גודל טקסט</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => bumpFont(-1)}
                  disabled={fontStep <= 0}
                  className="min-h-10 min-w-10 rounded-lg border border-navy/20 bg-slate-50 text-lg font-bold text-navy transition hover:bg-navy/5 disabled:opacity-40"
                  aria-label="הקטן גופן"
                >
                  A−
                </button>
                <button
                  type="button"
                  onClick={() => bumpFont(1)}
                  disabled={fontStep >= 3}
                  className="min-h-10 min-w-10 rounded-lg border border-navy/20 bg-slate-50 text-lg font-bold text-navy transition hover:bg-navy/5 disabled:opacity-40"
                  aria-label="הגדל גופן"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={resetFont}
                  className="rounded-lg border border-navy/15 px-3 py-2 text-xs font-semibold text-navy transition hover:bg-navy/5"
                >
                  איפוס
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleContrast}
              aria-pressed={highContrast}
              className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                highContrast
                  ? 'border-navy bg-navy text-white'
                  : 'border-navy/20 bg-white text-navy hover:bg-slate-50'
              }`}
            >
              ניגודיות גבוהה
            </button>
            <button
              type="button"
              onClick={toggleUnderline}
              aria-pressed={underlineLinks}
              className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                underlineLinks
                  ? 'border-navy bg-navy text-white'
                  : 'border-navy/20 bg-white text-navy hover:bg-slate-50'
              }`}
            >
              הדגשת קישורים (קו תחתון)
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-navy bg-gold text-lg font-bold text-navy shadow-lg transition hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'סגור תפריט נגישות' : 'פתח תפריט נגישות'}
        title="נגישות"
      >
        <span aria-hidden className="text-xl leading-none">
          ♿
        </span>
      </button>
    </div>
  )
}
