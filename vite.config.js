import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useStore } from '../lib/store.jsx'
import { checklistStats, daysUntil } from '../lib/utils.js'

export default function TimelineView() {
  const { properties } = useStore()

  const range = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0)
    const todayKey = today.getTime()
    const days = []
    for (let i = -7; i <= 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i)
      days.push({ key: i, date: d, isToday: i === 0, isWeekend: d.getDay() === 0 || d.getDay() === 6, label: d.getDate(), monthLabel: d.getDate() === 1 ? d.toLocaleString('en-US', { month: 'short' }) : null })
    }
    return { days, today: todayKey }
  }, [])

  const sorted = [...properties].sort((a, b) => {
    const aD = daysUntil(a.moveDate); const bD = daysUntil(b.moveDate)
    if (aD === null) return 1; if (bD === null) return -1
    return aD - bD
  })

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Timeline</h1>
        <p className="text-sm text-ink-600 mt-1">Visual schedule across all properties — past 7 days through next 90 days.</p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-10 text-center">
          <p className="text-sm text-ink-500">No properties to display</p>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white overflow-x-auto">
          <div style={{ minWidth: `${range.days.length * 24 + 240}px` }}>
            {/* Date header */}
            <div className="grid sticky top-0 bg-white border-b border-ink-200 z-10" style={{ gridTemplateColumns: `240px repeat(${range.days.length}, 24px)` }}>
              <div className="px-3 py-2 text-xs font-semibold text-ink-500 uppercase tracking-wider border-r border-ink-200">Property</div>
              {range.days.map(d => (
                <div key={d.key} className={`text-center text-[10px] py-1 border-r border-ink-100 ${d.isWeekend ? 'bg-ink-50' : ''} ${d.isToday ? 'bg-brand-100 font-bold text-brand-700' : 'text-ink-500'}`}>
                  {d.monthLabel ? <div className="font-semibold text-ink-700">{d.monthLabel}</div> : null}
                  {d.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {sorted.map(p => {
              const stats = checklistStats(p)
              const moveOffset = p.moveDate ? Math.round((new Date(p.moveDate + 'T00:00:00').getTime() - range.today) / 86400000) : null
              const startOffset = -7
              const moveCol = moveOffset !== null ? moveOffset - startOffset + 2 : null
              return (
                <div key={p.id} className="grid items-center border-b border-ink-100 hover:bg-ink-50/40 transition-colors" style={{ gridTemplateColumns: `240px repeat(${range.days.length}, 24px)` }}>
                  <Link to={`/app/property/${p.id}`} className="px-3 py-3 flex items-center gap-2 border-r border-ink-200 min-w-0">
                    <span className="text-base flex-shrink-0">{p.themeIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-ink-500">{stats.pct}% · {p.status}</div>
                    </div>
                  </Link>
                  {range.days.map(d => {
                    const isMoveDate = moveOffset !== null && d.key === moveOffset
                    return (
                      <div key={d.key} className={`h-12 ${d.isWeekend ? 'bg-ink-50/60' : ''} ${d.isToday ? 'bg-brand-50/70' : ''} border-r border-ink-100 relative`}>
                        {isMoveDate && (
                          <div className="absolute inset-1 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ background: p.themeAccent }} title={`${p.name} move-out`}>
                            🚚
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {/* Bar from today to move-out */}
                  {moveCol && moveOffset >= 0 && (
                    <div className="h-1 rounded-full absolute pointer-events-none" style={{
                      gridColumn: `${2 + Math.max(0, -startOffset)} / span ${moveOffset + 1}`,
                      background: p.themeAccent + '60',
                      gridRow: 'auto',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
