import { useState } from 'react'
import { Plus, X, Calendar } from 'lucide-react'
import { useStore } from '../../lib/store.jsx'
import { fmtDate, daysUntil } from '../../lib/utils.js'

const EVENT_KINDS = ['Walkthrough', 'Showing', 'Inspection', 'Closing', 'Move-out', 'Vendor visit', 'Other']

export default function EventsTab({ property }) {
  const { addEvent, deleteEvent } = useStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', kind: 'Walkthrough', date: '', time: '', notes: '' })

  const create = () => {
    if (!form.title.trim() || !form.date) return
    addEvent(property.id, { ...form, title: form.title.trim() })
    setForm({ title: '', kind: 'Walkthrough', date: '', time: '', notes: '' })
    setAdding(false)
  }

  const sorted = [...property.events].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-ink-900">Events & appointments</h3>
          <p className="text-sm text-ink-600">Walkthroughs, showings, inspections, closings.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-brand btn-sm">
          <Plus className="w-3.5 h-3.5" />Add event
        </button>
      </div>

      {adding && (
        <div className="rounded-xl bg-white border-2 border-brand-300 p-4 space-y-2.5 mb-4 animate-slide-up">
          <input className="input" placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select className="input" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
              {EVENT_KINDS.map(k => <option key={k}>{k}</option>)}
            </select>
            <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input type="time" className="input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <textarea className="input min-h-[60px]" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={create} disabled={!form.title.trim() || !form.date} className="btn-brand btn-sm">Save event</button>
            <button onClick={() => setAdding(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-10 text-center">
          <Calendar className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-sm text-ink-500">No events scheduled</p>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white overflow-hidden divide-y divide-ink-100">
          {sorted.map(e => {
            const d = daysUntil(e.date)
            const isPast = d !== null && d < 0
            return (
              <div key={e.id} className={`p-3 flex items-center gap-3 group hover:bg-ink-50/50 ${isPast ? 'opacity-60' : ''}`}>
                <div className="w-12 h-12 rounded-lg bg-brand-100 text-brand-700 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold uppercase">{new Date(e.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' })}</span>
                  <span className="text-base font-bold tracking-tighter leading-none">{new Date(e.date + 'T00:00:00').getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-ink-900">{e.title}</span>
                    <span className="badge bg-ink-100 text-ink-600">{e.kind}</span>
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {fmtDate(e.date, property.dateFormat)}{e.time ? ` · ${e.time}` : ''}
                    {d !== null && (
                      <span className={`ml-2 ${isPast ? '' : d <= 7 ? 'text-amber-600 font-medium' : ''}`}>
                        {isPast ? `${Math.abs(d)}d ago` : d === 0 ? 'Today' : `in ${d}d`}
                      </span>
                    )}
                  </div>
                  {e.notes && <div className="text-xs text-ink-600 mt-1 italic">{e.notes}</div>}
                </div>
                <button onClick={() => deleteEvent(property.id, e.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-rose-600 p-2 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
