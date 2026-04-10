export function nextId(prefix: string, existing: string[]): string {
  const max = existing.reduce((m, id) => {
    const n = parseInt(id.replace(`${prefix}-`, ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

export function lineItemId(): string {
  return `li-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export function paymentId(): string {
  return `pay-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}
