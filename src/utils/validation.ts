/** Israeli national ID checksum (תעודת זהות). */
export function isValidIsraeliId(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 0 || digits.length > 9) return false
  const id = digits.padStart(9, '0')
  if (!/^\d{9}$/.test(id)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let n = Number(id[i])
    const weight = (i % 2) + 1
    n *= weight
    if (n > 9) n = Math.floor(n / 10) + (n % 10)
    sum += n
  }
  return sum % 10 === 0
}

/** Israeli phone: 9–10 digits, leading 0 (נייד או קווי). */
export function isValidIsraeliPhone(raw: string): boolean {
  const d = raw.replace(/\D/g, '')
  if (d.length < 9 || d.length > 10) return false
  return d.startsWith('0')
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
