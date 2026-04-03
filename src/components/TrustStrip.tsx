import { IconShield } from './icons'

const items = ['מאובטח SSL', 'חישוב חינם'] as const

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 border-y border-white/10 bg-navy-dark/50 py-3 text-sm text-white/90">
      {items.map((label) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 shadow-sm ring-1 ring-white/10"
        >
          <IconShield className="h-4 w-4 text-gold" />
          <span className="font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}
