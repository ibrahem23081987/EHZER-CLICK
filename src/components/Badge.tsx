type BadgeProps = {
  children: React.ReactNode
  variant?: 'gold' | 'green' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'gold', className = '' }: BadgeProps) {
  const styles = {
    gold: 'bg-gold-muted text-navy ring-gold/30',
    green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    muted: 'bg-slate-100 text-slate-700 ring-slate-200',
  }[variant]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles} ${className}`}
    >
      {children}
    </span>
  )
}
