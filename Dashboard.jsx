import { CURRENCIES } from './constants.js'

export const uid = () => Math.random().toString(36).slice(2, 10)

export function fmtMoney(n, code = 'USD') {
  const c = CURRENCIES[code] || CURRENCIES.USD
  try {
    return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n) || 0)
  } catch {
    return c.symbol + Number(n || 0).toLocaleString()
  }
}

export function fmtDate(iso, fmt = 'MDY') {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  if (fmt === 'DMY') return `${d}/${m}/${y}`
  if (fmt === 'YMD') return `${y}-${m}-${d}`
  return `${m}/${d}/${y}`
}

export function daysUntil(moveDate) {
  if (!moveDate) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(moveDate + 'T00:00:00')
  return Math.round((target - today) / 86400000)
}

export function slackForItem(p, item) {
  const d = daysUntil(p.moveDate)
  if (d === null || item.daysBefore == null) return null
  return d - item.daysBefore
}

export function urgencyLevel(slack) {
  if (slack === null) return 'none'
  if (slack < 0) return 'overdue'
  if (slack <= 2) return 'urgent'
  if (slack <= 7) return 'soon'
  return 'ok'
}

export function checklistStats(p) {
  const total = p.checklist.reduce((s, g) => s + g.items.length, 0)
  const done = p.checklist.reduce((s, g) => s + g.items.filter(i => i.done).length, 0)
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

export function expensesTotal(p) {
  return p.expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
}

export function spentByCategory(p) {
  const map = {}
  p.expenses.forEach(e => {
    const c = e.category || 'Other'
    map[c] = (map[c] || 0) + Number(e.amount || 0)
  })
  return map
}

export function isVendorFinalized(v) {
  if (!v) return false
  return !!((v.name || '').trim() && ((v.phone || '').trim() || (v.email || '').trim() || (v.type || '').trim()))
}

export function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}

export function classNames(...c) { return c.filter(Boolean).join(' ') }

export function relativeDay(daysFromNow) {
  if (daysFromNow === null || daysFromNow === undefined) return ''
  if (daysFromNow < 0) return `${Math.abs(daysFromNow)}d past`
  if (daysFromNow === 0) return 'Today'
  if (daysFromNow === 1) return 'Tomorrow'
  if (daysFromNow <= 7) return `${daysFromNow}d`
  if (daysFromNow <= 30) return `${daysFromNow}d away`
  if (daysFromNow <= 60) return `~${Math.round(daysFromNow / 7)}w`
  return `${Math.round(daysFromNow / 30)}mo`
}

export function parseAddress(input) {
  if (!input || !input.trim()) return null
  const cleaned = input.trim().replace(/\s+/g, ' ')
  const m = cleaned.match(/^(.+?),\s*([A-Za-z\s.\-']+?),\s*([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/)
  if (m) return { street: m[1].trim(), city: m[2].trim(), state: m[3].toUpperCase(), zip: m[4] }
  return null
}
