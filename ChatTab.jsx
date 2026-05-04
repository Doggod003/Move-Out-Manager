import { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import { useStore } from '../../lib/store.jsx'
import { fmtMoney, expensesTotal, spentByCategory } from '../../lib/utils.js'
import { CURRENCIES, EXPENSE_CATEGORIES } from '../../lib/constants.js'
import Modal from '../Modal.jsx'

export default function ExpensesTab({ property }) {
  const { addExpense, updateExpense, deleteExpense, setBudget } = useStore()
  const [budgetOpen, setBudgetOpen] = useState(false)
  const cur = property.currency || 'USD'
  const total = expensesTotal(property)
  const budgetTotal = property.budget?.total || 0
  const remaining = budgetTotal - total
  const overallPct = budgetTotal > 0 ? Math.min(100, Math.round((total / budgetTotal) * 100)) : 0
  const overallOver = budgetTotal > 0 && total > budgetTotal
  const byCatActual = spentByCategory(property)

  const hasCatBudgets = Object.values(property.budget?.byCategory || {}).some(v => Number(v) > 0)

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white border border-ink-200 p-5">
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-500 mb-1">Total spent</div>
            <div className="text-3xl font-bold tracking-tighter text-ink-900">{fmtMoney(total, cur)}</div>
            {budgetTotal > 0 ? (
              <div className={`text-sm mt-1 ${overallOver ? 'text-rose-600' : 'text-ink-600'}`}>
                of {fmtMoney(budgetTotal, cur)} · {overallOver ? `${fmtMoney(Math.abs(remaining), cur)} over` : `${fmtMoney(remaining, cur)} left`}
              </div>
            ) : (
              <div className="text-xs text-ink-400 mt-1">{property.expenses.length} expense{property.expenses.length === 1 ? '' : 's'}</div>
            )}
          </div>
          <button onClick={() => setBudgetOpen(true)} className="btn-secondary btn-sm">
            {budgetTotal > 0 ? <><Edit2 className="w-3.5 h-3.5" />Edit budget</> : <><Plus className="w-3.5 h-3.5" />Set budget</>}
          </button>
        </div>
        {budgetTotal > 0 && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%`, background: overallOver ? '#e11d48' : overallPct >= 80 ? '#f59e0b' : '#10b981' }} />
            </div>
            <div className="text-xs text-ink-500 mt-1.5">{overallPct}% of budget{overallOver ? ' · over' : ''}</div>
          </div>
        )}
      </div>

      {hasCatBudgets && (
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-500 mb-2">By category</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {EXPENSE_CATEGORIES.map(c => {
              const budgeted = Number(property.budget?.byCategory[c]) || 0
              if (budgeted <= 0) return null
              const actual = byCatActual[c] || 0
              const pct = Math.min(100, Math.round((actual / budgeted) * 100))
              const over = actual > budgeted
              return (
                <div key={c} className="rounded-lg bg-white border border-ink-200 p-3">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-sm font-medium text-ink-900">{c}</span>
                    <span className={`text-xs ${over ? 'text-rose-600' : 'text-ink-500'}`}>
                      {fmtMoney(actual, cur)} / {fmtMoney(budgeted, cur)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? '#e11d48' : pct >= 80 ? '#f59e0b' : '#10b981' }} />
                  </div>
                  <div className="text-[10px] text-ink-400 mt-1">{pct}%{over && ` · ${fmtMoney(actual - budgeted, cur)} over`}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink-900">Expenses</h3>
        <button onClick={() => addExpense(property.id, { label: '', category: 'Cleaning', amount: 0, date: '' })} className="btn-secondary btn-sm">
          <Plus className="w-3.5 h-3.5" />Add expense
        </button>
      </div>

      {property.expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-10 text-center">
          <p className="text-sm text-ink-500">No expenses yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
          <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-2 px-3 py-2 bg-ink-50 border-b border-ink-200 text-[10px] uppercase tracking-wider font-semibold text-ink-500">
            <div>Label</div><div>Category</div><div>Amount</div><div>Date</div><div></div>
          </div>
          <div className="divide-y divide-ink-100">
            {property.expenses.map(e => <ExpenseRow key={e.id} expense={e} cur={cur}
              onUpdate={(patch) => updateExpense(property.id, e.id, patch)}
              onDelete={() => deleteExpense(property.id, e.id)} />)}
          </div>
        </div>
      )}

      {budgetOpen && <BudgetModal property={property} cur={cur} onClose={() => setBudgetOpen(false)} onSave={(b) => { setBudget(property.id, b); setBudgetOpen(false) }} />}
    </div>
  )
}

function ExpenseRow({ expense, cur, onUpdate, onDelete }) {
  const isVendorLinked = !!expense.vendorId
  return (
    <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-2 p-2 items-center hover:bg-ink-50/50 group">
      <div className="relative">
        <input className="input h-9 text-sm" value={expense.label} disabled={isVendorLinked} onChange={e => onUpdate({ label: e.target.value })} placeholder="Description" />
        {isVendorLinked && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-ink-100 px-1.5 py-0.5 rounded text-ink-600 font-medium">vendor</span>}
      </div>
      <select className="input h-9 text-sm" disabled={isVendorLinked} value={expense.category} onChange={e => onUpdate({ category: e.target.value })}>
        {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <input type="number" step="0.01" className="input h-9 text-sm" disabled={isVendorLinked} value={expense.amount || ''} onChange={e => onUpdate({ amount: parseFloat(e.target.value) || 0 })} />
      <input type="date" className="input h-9 text-sm" value={expense.date || ''} onChange={e => onUpdate({ date: e.target.value })} />
      <button onClick={onDelete} disabled={isVendorLinked} className="text-ink-400 hover:text-rose-600 p-1.5 disabled:opacity-30 disabled:cursor-not-allowed">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function BudgetModal({ property, cur, onClose, onSave }) {
  const [total, setTotal] = useState(property.budget?.total || '')
  const [byCat, setByCat] = useState(property.budget?.byCategory || {})

  const save = () => {
    const t = parseFloat(total) || 0
    const cleaned = {}
    Object.entries(byCat).forEach(([k, v]) => {
      const n = parseFloat(v)
      if (!isNaN(n) && n > 0) cleaned[k] = n
    })
    onSave({ total: t, byCategory: cleaned })
  }

  const clear = () => { if (confirm('Clear all budget amounts?')) onSave({ total: 0, byCategory: {} }) }

  return (
    <Modal title="💰 Set budget" subtitle={`AI auto-allocates per-category if you only set total · ${CURRENCIES[cur].code}`} onClose={onClose}
      footer={
        <div className="flex justify-between gap-2">
          <button onClick={clear} className="btn-ghost text-rose-600">Clear all</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={save} className="btn-brand btn-sm">Save budget</button>
          </div>
        </div>
      }>
      <div className="mb-5">
        <label className="label block mb-1">Overall budget</label>
        <div className="flex items-center gap-2">
          <span className="text-2xl text-ink-400 w-6">{CURRENCIES[cur].symbol}</span>
          <input className="input text-base" type="number" step="1" value={total} onChange={e => setTotal(e.target.value)} placeholder="e.g. 5000" />
        </div>
      </div>
      <div className="border-t border-ink-100 pt-5">
        <div className="text-xs uppercase tracking-wider font-medium text-ink-500 mb-2">Per category (or let AI decide)</div>
        <div className="space-y-2">
          {EXPENSE_CATEGORIES.map(c => (
            <div key={c} className="grid grid-cols-[1fr_1.2fr] gap-2 items-center">
              <label className="text-sm text-ink-700">{c}</label>
              <input type="number" step="1" className="input h-9 text-sm" value={byCat[c] || ''} onChange={e => setByCat({ ...byCat, [c]: e.target.value })} placeholder="0" />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
