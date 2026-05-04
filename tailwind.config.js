import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, AlertTriangle, TrendingUp, Building2, Clock, ChevronRight } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { checklistStats, daysUntil, fmtMoney, slackForItem, urgencyLevel, expensesTotal } from '../lib/utils.js'
import EmptyState from '../components/EmptyState.jsx'

export default function Dashboard() {
  const { properties, briefing, triggerBriefing, loadDemo } = useStore()

  useEffect(() => { triggerBriefing() }, [properties.length])

  if (properties.length === 0) {
    return <EmptyState onDemo={loadDemo} />
  }

  // Aggregate stats
  let totalTasks = 0, doneTasks = 0, totalOverdue = 0, totalUrgent = 0, moveReady = 0
  const spendByCur = {}
  properties.forEach(p => {
    const s = checklistStats(p)
    totalTasks += s.total; doneTasks += s.done
    if (s.pct === 100 && s.total > 0) moveReady++
    p.checklist.forEach(g => g.items.forEach(it => {
      if (it.done) return
      const lvl = urgencyLevel(slackForItem(p, it))
      if (lvl === 'overdue') totalOverdue++
      else if (lvl === 'urgent') totalUrgent++
    }))
    const cur = p.currency || 'USD'
    spendByCur[cur] = (spendByCur[cur] || 0) + expensesTotal(p)
  })
  const portfolioPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0
  const totalSpent = Object.entries(spendByCur).filter(([_, v]) => v > 0).map(([cur, v]) => fmtMoney(v, cur)).join(' · ') || fmtMoney(0, 'USD')

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-600 mt-1">{properties.length} {properties.length === 1 ? 'property' : 'properties'} · {portfolioPct}% portfolio complete</p>
      </div>

      {/* Daily briefing */}
      {briefing && <BriefingCard briefing={briefing} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard accent="brand" icon={Building2} label="Properties" value={properties.length} sub={moveReady > 0 ? `✓ ${moveReady} ready` : null} />
        <KpiCard accent="ink" icon={TrendingUp} label="Tasks" value={`${doneTasks}/${totalTasks}`} sub={`${portfolioPct}% complete`} />
        <KpiCard accent={totalOverdue > 0 ? 'rose' : 'emerald'} icon={AlertTriangle} label="Overdue" value={totalOverdue} sub={totalUrgent > 0 ? `+${totalUrgent} urgent` : 'All on track'} />
        <KpiCard accent="amber" icon={TrendingUp} label="Total spent" value={totalSpent} small={totalSpent.length > 14} />
      </div>

      {/* Properties */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Your properties</h2>
          <span className="text-xs text-ink-500">{properties.length} total</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[...properties].sort((a,b) => {
            const ar = checklistStats(a).pct === 100, br = checklistStats(b).pct === 100
            if (ar !== br) return ar ? 1 : -1
            return 0
          }).map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      </div>
    </div>
  )
}

function BriefingCard({ briefing }) {
  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-50 via-white to-amber-50 border border-brand-200/60 p-5 animate-slide-up">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-700 mb-3">
        <span className="ai-dot" /> Daily briefing
      </div>
      <p className="text-base font-medium text-ink-900 leading-snug mb-4">{briefing.headline}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {briefing.needs_attention?.length > 0 && (
          <div>
            <div className="text-xs font-medium text-ink-600 mb-1.5">Needs attention</div>
            <ul className="space-y-1">
              {briefing.needs_attention.slice(0, 3).map((n, i) => (
                <li key={i} className="text-sm text-ink-800 flex items-start gap-2"><span className="text-rose-500 mt-1">•</span>{n}</li>
              ))}
            </ul>
          </div>
        )}
        {briefing.wins?.length > 0 && (
          <div>
            <div className="text-xs font-medium text-emerald-700 mb-1.5">Wins</div>
            <ul className="space-y-1">
              {briefing.wins.slice(0, 2).map((w, i) => (
                <li key={i} className="text-sm text-ink-800 flex items-start gap-2"><span className="text-emerald-600 mt-1">✓</span>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {briefing.money_note && (
        <div className="mt-4 pt-3 border-t border-brand-200/60 text-sm text-ink-700">💰 {briefing.money_note}</div>
      )}
    </div>
  )
}

const KPI_ACCENTS = {
  brand: 'bg-brand-100 text-brand-700',
  ink: 'bg-ink-200 text-ink-700',
  rose: 'bg-rose-100 text-rose-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
}

function KpiCard({ accent, icon: Icon, label, value, sub, small }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${KPI_ACCENTS[accent] || KPI_ACCENTS.ink}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className={`font-bold text-ink-900 tracking-tighter ${small ? 'text-base' : 'text-2xl'}`}>{value}</div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
    </div>
  )
}

function PropertyCard({ property: p }) {
  const stats = checklistStats(p)
  const expTotal = expensesTotal(p)
  const d = daysUntil(p.moveDate)
  const cur = p.currency || 'USD'
  let overdue = 0, urgent = 0
  p.checklist.forEach(g => g.items.forEach(it => {
    if (it.done) return
    const lvl = urgencyLevel(slackForItem(p, it))
    if (lvl === 'overdue') overdue++; else if (lvl === 'urgent') urgent++
  }))

  let dateLabel = 'No date', dateColor = 'text-ink-400'
  if (d !== null) {
    if (d < 0) { dateLabel = `${Math.abs(d)}d past`; dateColor = 'text-rose-600' }
    else if (d === 0) { dateLabel = 'Today'; dateColor = 'text-rose-600' }
    else if (d <= 7) { dateLabel = `${d}d left`; dateColor = 'text-amber-600' }
    else { dateLabel = `${d}d left`; dateColor = 'text-ink-500' }
  }

  const isReady = stats.pct === 100 && stats.total > 0
  const accent = p.themeAccent || '#6366f1'
  const budgetTotal = p.budget?.total || 0

  return (
    <Link to={`/app/property/${p.id}`} className="group relative rounded-xl bg-white border border-ink-200 hover:border-ink-300 hover:shadow-soft transition-all overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: isReady ? '#10b981' : accent }} />
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: accent + '1f' }}>
              {p.themeIcon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-ink-900 truncate">{p.name}</span>
                {isReady && <span className="badge bg-emerald-100 text-emerald-700">✓ Ready</span>}
              </div>
              <div className="text-xs text-ink-500 truncate">{p.address || 'No address'} {p.city ? `· ${p.city}` : ''}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="badge bg-ink-100 text-ink-600">{p.status}</span>
            <span className={`text-xs font-medium ${dateColor}`}>{dateLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, background: isReady ? '#10b981' : accent }} />
          </div>
          <span className="text-xs font-semibold text-ink-700 tabular-nums w-9 text-right">{stats.pct}%</span>
        </div>

        {(overdue + urgent > 0) && (
          <div className="flex gap-1.5 mb-3">
            {overdue > 0 && <span className="badge bg-rose-100 text-rose-700">⚠ {overdue} overdue</span>}
            {urgent > 0 && <span className="badge bg-amber-100 text-amber-700">{urgent} urgent</span>}
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-dashed border-ink-200 text-[11px]">
          <Stat label="Tasks" value={`${stats.done}/${stats.total}`} />
          <Stat label="Photos" value={p.photos.length} />
          <Stat label="Vendors" value={p.vendors.length} />
          <Stat label="Spent" value={budgetTotal > 0 ? `${fmtMoney(expTotal, cur)} / ${fmtMoney(budgetTotal, cur)}` : fmtMoney(expTotal, cur)} small />
        </div>

        {p.aiNextAction && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-200/60">
            <span className="ai-dot mt-1.5 flex-shrink-0" />
            <p className="text-xs text-brand-900 leading-snug truncate flex-1">{p.aiNextAction}</p>
          </div>
        )}
      </div>
    </Link>
  )
}

function Stat({ label, value, small }) {
  return (
    <div>
      <div className="text-ink-500 mb-0.5">{label}</div>
      <div className={`font-semibold text-ink-900 ${small ? 'text-[10px]' : ''} truncate`}>{value}</div>
    </div>
  )
}
