import { IconLock } from './icons'

export function SecurityNote({ className = '' }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 text-sm text-navy/80 ${className}`}
      role="note"
    >
      <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
      <span>פרטיך מוגנים ולא יועברו לצד שלישי.</span>
    </p>
  )
}
