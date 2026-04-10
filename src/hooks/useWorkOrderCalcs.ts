import type { LineItem } from '../types'

export interface LineItemTotals {
  laborSubtotal: number
  partsSubtotal: number
  subtotal: number
  taxableAmount: number
  taxAmount: number
  total: number
  laborHours: number
}

export function calcLineItems(items: LineItem[], taxRate: number): LineItemTotals {
  let laborSubtotal = 0
  let partsSubtotal = 0
  let taxableAmount = 0
  let laborHours = 0

  for (const item of items) {
    const lineTotal = item.quantity * item.unitPrice
    if (item.type === 'labor') {
      laborSubtotal += lineTotal
      laborHours += item.quantity
    } else {
      partsSubtotal += lineTotal
    }
    if (item.taxable) taxableAmount += lineTotal
  }

  const subtotal = laborSubtotal + partsSubtotal
  const taxAmount = (taxableAmount * taxRate) / 100

  return {
    laborSubtotal,
    partsSubtotal,
    subtotal,
    taxableAmount,
    taxAmount,
    total: subtotal + taxAmount,
    laborHours,
  }
}

/** Format a number as currency string */
export function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Format a date as short locale string */
export function fmtDate(d: Date | undefined): string {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Format datetime */
export function fmtDateTime(d: Date | undefined): string {
  if (!d) return '—'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Time ago string */
export function timeAgo(d: Date): string {
  const secs = (Date.now() - d.getTime()) / 1000
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}
