import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { slackForItem, urgencyLevel } from '../lib/utils.js'

export default function CalendarView() {
  const { properties } = useStore()
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d })

  const month = cursor.getMonth()
  const year = cursor.getFullYear()
  const monthLabel = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const events = useMemo(() => {
    const map = {} // 'YYYY-MM-DD' => array
    properties.forEach(p => {
      // Move-out date itself
      if (p.moveDate) {
        const k = p.moveDate
        map[k] = map[k] || []
        map[k].push({ kind: 'moveout', property: p, label: `${p.themeIcon} ${p.name} — MOVE-OUT`, color: '#e11d48' })
      }
      // Tasks with due dates derived from daysBefore
      if (p.moveDate) {
        const moveDate = new Date(p.moveDate + 'T00:00:00')
        p.checklist.forEach(g => g.items.forEach(it => {
          if (it.done) return
          if (it.daysBefore == null) return
          const dt = new Date(moveDate); dt.setDate(dt.getDate() - it.daysBefore)
          const k = dt.toISOString().slice(0, 10)
          const lvl = urgencyLevel(slackForItem(p, it))
          map[k] = map[k] || []
          map[k].push({ kind: 'task', property: p, label: `${p.themeIcon} ${it.text}`, color: lvl === 'overdue' ? '#e11d48' : lvl === 'urgent' ? '#f59e0b' : p.themeAccent })
        }))
      }
      // Custom events
      p.events?.forEach(e => {
        if (!e.date) return
        map[e.date] = map[e.date] || []
        map[e.date].push({ kind: 'event', property: p, label: `${p.themeIcon} ${e.title} (${e.kind})`, color: '#6366f1' })
      })
    })
    return map
  }, [properties])

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d)
    const key = dt.toISOString().slice(0, 10)
    cells.push({ day: d, key, events: events[key] || [] })
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date(); today.setHours(0,0,0,0)
  const todayKey = today.toISOString().slice(0, 10)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Calendar</h1>
          <p className="text-sm text-ink-600 mt-1">Move-outs, tasks, and events across your portfolio.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="btn-secondary btn-sm"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-medium text-ink-900 px-3 min-w-[10rem] text-center">{monthLabel}</span>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="btn-secondary btn-sm"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); setCursor(d) }} className="btn-secondary btn-sm">Today</button>
        </div>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-ink-200 bg-ink-50">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-ink-600 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-ink-100">
          {cells.map((c, i) => (
            <div key={i} className={`min-h-[120px] p-2 ${c ? '' : 'bg-ink-50/40'} ${c?.key === todayKey ? 'bg-brand-50/50' : ''}`}>
              {c && (
                <>
                  <div className={`text-xs font-medium mb-1.5 ${c.key === todayKey ? 'text-brand-700' : 'text-ink-500'}`}>{c.day}</div>
                  <div className="space-y-1">
                    {c.events.slice(0, 4).map((e, idx) => (
                      <Link key={idx} to={`/app/property/${e.property.id}`}
                        className="block text-[10px] px-1.5 py-0.5 rounded text-white truncate hover:opacity-90"
                        style={{ background: e.color }}
                        title={e.label}>
                        {e.label}
                      </Link>
                    ))}
                    {c.events.length > 4 && (
                      <div className="text-[10px] text-ink-500 px-1">+{c.events.length - 4} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
