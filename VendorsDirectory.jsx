import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, MessageSquare, ListChecks, Image as ImageIcon, Wrench, Receipt, FileText, Calendar as CalIcon, Sparkles } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { checklistStats, daysUntil, fmtDate, expensesTotal, fmtMoney } from '../lib/utils.js'
import { CURRENCIES, PROPERTY_STATUSES } from '../lib/constants.js'
import ChecklistTab from '../components/tabs/ChecklistTab.jsx'
import PhotosTab from '../components/tabs/PhotosTab.jsx'
import VendorsTab from '../components/tabs/VendorsTab.jsx'
import ExpensesTab from '../components/tabs/ExpensesTab.jsx'
import DocumentsTab from '../components/tabs/DocumentsTab.jsx'
import ChatTab from '../components/tabs/ChatTab.jsx'
import EventsTab from '../components/tabs/EventsTab.jsx'
import NotesTab from '../components/tabs/NotesTab.jsx'

const TABS = [
  { id: 'checklist', label: 'Checklist', icon: ListChecks },
  { id: 'photos', label: 'Photos', icon: ImageIcon },
  { id: 'vendors', label: 'Vendors', icon: Wrench },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'events', label: 'Events', icon: CalIcon },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
]

export default function PropertyView() {
  const { id, tab } = useParams()
  const navigate = useNavigate()
  const { properties, deleteProperty, triggerAgent, updateProperty } = useStore()

  const property = properties.find(p => p.id === id)
  const activeTab = tab || 'checklist'

  useEffect(() => { if (property) triggerAgent(property.id) }, [id])

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-600">Property not found.</p>
        <Link to="/app" className="btn-secondary mt-4">Back to dashboard</Link>
      </div>
    )
  }

  const stats = checklistStats(property)
  const d = daysUntil(property.moveDate)
  const isReady = stats.pct === 100 && stats.total > 0
  const accent = property.themeAccent

  let dateInfo = null
  if (d !== null) {
    if (d < 0) dateInfo = { text: `${Math.abs(d)} days past`, color: 'text-rose-600' }
    else if (d === 0) dateInfo = { text: 'Today', color: 'text-rose-600' }
    else dateInfo = { text: `${d} days until move-out`, color: d <= 7 ? 'text-amber-600' : 'text-ink-600' }
  }

  const handleDelete = () => {
    if (confirm(`Delete ${property.name}?`)) {
      deleteProperty(property.id)
      navigate('/app')
    }
  }

  return (
    <div className="animate-fade-in">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />All properties
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: accent + '1f' }}>
            {property.themeIcon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tighter text-ink-900">{property.name}</h1>
              {isReady && <span className="badge bg-emerald-100 text-emerald-700">✓ Move-ready</span>}
            </div>
            <p className="text-sm text-ink-600 mt-0.5">{property.address || 'No address'}{property.city ? `, ${property.city}` : ''}{property.addrState ? `, ${property.addrState}` : ''}</p>
            <p className="text-xs text-ink-500 mt-1">
              {dateInfo ? <span className={dateInfo.color}>{dateInfo.text}</span> : 'No date set'}
              {property.moveDate && <> · {fmtDate(property.moveDate, property.dateFormat)}</>}
              {' · '}
              <select value={property.status} onChange={e => updateProperty(property.id, { status: e.target.value })} className="bg-transparent border-0 text-xs cursor-pointer hover:text-ink-700 -ml-1 outline-none focus:ring-0">
                {PROPERTY_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </p>
          </div>
        </div>
        <button onClick={handleDelete} className="btn-secondary btn-sm text-ink-600 hover:text-rose-600">
          <Trash2 className="w-3.5 h-3.5" />Delete
        </button>
      </div>

      {/* Progress + AI summary row */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-xl bg-white border border-ink-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-500">Progress</span>
            <span className="text-sm font-semibold text-ink-900">{stats.done}/{stats.total} · {stats.pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stats.pct}%`, background: isReady ? '#10b981' : accent }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dashed border-ink-200 text-xs">
            <Stat label="Vendors" value={property.vendors.length} />
            <Stat label="Photos" value={property.photos.length} />
            <Stat label="Spent" value={fmtMoney(expensesTotal(property), property.currency)} />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-amber-50 border border-brand-200/60 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-700 mb-2">
            <span className="ai-dot" /> Do this next
          </div>
          {property.aiNextAction ? (
            <p className="text-sm text-ink-900 leading-snug">{property.aiNextAction}</p>
          ) : (
            <p className="text-sm text-ink-600 leading-snug italic">AI is analyzing… a recommendation will appear here.</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-ink-200 -mx-6 px-6 overflow-x-auto">
        <div className="flex gap-1">
          {TABS.map(t => {
            const isActive = activeTab === t.id
            return (
              <button key={t.id} onClick={() => navigate(`/app/property/${id}/${t.id}`)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${isActive ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800'}`}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'checklist' && <ChecklistTab property={property} />}
        {activeTab === 'photos' && <PhotosTab property={property} />}
        {activeTab === 'vendors' && <VendorsTab property={property} />}
        {activeTab === 'expenses' && <ExpensesTab property={property} />}
        {activeTab === 'documents' && <DocumentsTab property={property} />}
        {activeTab === 'events' && <EventsTab property={property} />}
        {activeTab === 'notes' && <NotesTab property={property} />}
        {activeTab === 'chat' && <ChatTab property={property} />}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-ink-500 mb-0.5 uppercase tracking-wider font-medium text-[10px]">{label}</div>
      <div className="font-semibold text-ink-900">{value}</div>
    </div>
  )
}
