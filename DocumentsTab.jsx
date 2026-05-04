import { useState } from 'react'
import { Plus, X, Edit2, Phone, Mail, Sparkles, Check } from 'lucide-react'
import { useStore } from '../../lib/store.jsx'
import { fmtMoney, isVendorFinalized, uid } from '../../lib/utils.js'
import { getUtilities, US_STATES } from '../../lib/constants.js'

export default function VendorsTab({ property }) {
  const { upsertVendor, deleteVendor, patchProperty } = useStore()
  const [editingId, setEditingId] = useState(null)
  const cur = property.currency || 'USD'
  const utils = getUtilities(property.addrState)

  const startNew = () => {
    const nv = { id: uid(), name: '', type: '', phone: '', email: '', notes: '', price: '' }
    upsertVendor(property.id, nv)
    setEditingId(nv.id)
  }

  const acceptSuggestion = (idx) => {
    const s = property.aiSuggestions[idx]
    const nv = { id: uid(), name: '', type: s.type, phone: '', email: '', notes: 'AI-suggested · ' + (s.reason || ''), price: s.est_price || '' }
    upsertVendor(property.id, nv)
    setEditingId(nv.id)
    patchProperty(property.id, (p) => ({ ...p, aiSuggestions: p.aiSuggestions.filter((_, i) => i !== idx) }))
  }

  const dismissSuggestion = (idx) => {
    patchProperty(property.id, (p) => ({ ...p, aiSuggestions: p.aiSuggestions.filter((_, i) => i !== idx) }))
  }

  const seedUtilities = () => {
    if (!utils) return
    if (utils.electric?.[0]) {
      upsertVendor(property.id, { id: uid(), name: utils.electric[0], type: 'Utility - Electric', phone: '', email: '', notes: `For ${property.addrState}`, price: '' })
    }
    if (utils.gas?.[0]) {
      upsertVendor(property.id, { id: uid(), name: utils.gas[0], type: 'Utility - Gas', phone: '', email: '', notes: `For ${property.addrState}`, price: '' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-ink-900">Vendor roster</h3>
          <p className="text-sm text-ink-600">Movers, cleaners, contractors. Adding one auto-checks matching tasks.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {utils && <button onClick={seedUtilities} className="btn-secondary btn-sm">⚡ Seed {property.addrState} utilities</button>}
          <button onClick={startNew} className="btn-brand btn-sm"><Plus className="w-3.5 h-3.5" />Add vendor</button>
        </div>
      </div>

      {property.aiSuggestions?.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-amber-50 border border-brand-200/60 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-700 mb-3">
            <span className="ai-dot" /> AI suggests you need
          </div>
          <div className="space-y-2">
            {property.aiSuggestions.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-ink-200">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-ink-900">
                    {s.type}
                    {s.est_price && <span className="ml-2 text-xs text-ink-500 font-normal">~{fmtMoney(s.est_price, cur)}</span>}
                  </div>
                  <div className="text-xs text-ink-600 mt-0.5">{s.reason}</div>
                </div>
                <button onClick={() => acceptSuggestion(i)} className="btn-brand btn-sm">
                  <Check className="w-3.5 h-3.5" />Add
                </button>
                <button onClick={() => dismissSuggestion(i)} className="text-ink-400 hover:text-ink-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {property.vendors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-10 text-center">
          <p className="text-sm text-ink-500">No vendors yet</p>
          <button onClick={startNew} className="btn-secondary btn-sm mt-3">Add your first vendor</button>
        </div>
      ) : (
        <div className="space-y-2">
          {property.vendors.map(v => {
            const isE = editingId === v.id
            const finalized = !isE && isVendorFinalized(v)
            return finalized
              ? <CompactVendorCard key={v.id} vendor={v} cur={cur} onEdit={() => setEditingId(v.id)} onDelete={() => deleteVendor(property.id, v.id)} />
              : <EditableVendorCard key={v.id} vendor={v} cur={cur} onSave={(nv) => { upsertVendor(property.id, nv); setEditingId(null) }} onDelete={() => deleteVendor(property.id, v.id)} />
          })}
        </div>
      )}
    </div>
  )
}

function CompactVendorCard({ vendor, cur, onEdit, onDelete }) {
  const price = Number(vendor.price) || 0
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-3 hover:border-ink-300 hover:shadow-soft transition-all flex items-center gap-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-ink-900">{vendor.name}</span>
          {vendor.type && <span className="badge bg-ink-100 text-ink-600">{vendor.type}</span>}
        </div>
        {(vendor.phone || vendor.email) && (
          <div className="flex items-center gap-3 mt-1 text-xs text-ink-500">
            {vendor.phone && <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3" />{vendor.phone}</span>}
            {vendor.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{vendor.email}</span>}
          </div>
        )}
      </div>
      <div className="text-right">
        {price > 0 ? <div className="font-semibold text-ink-900">{fmtMoney(price, cur)}</div> : <div className="text-xs text-ink-400">no price</div>}
      </div>
      <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-ink-700 p-1.5 transition-opacity">
        <Edit2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-rose-600 p-1.5 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function EditableVendorCard({ vendor, cur, onSave, onDelete }) {
  const [v, setV] = useState({ ...vendor })
  return (
    <div className="rounded-lg border-2 border-brand-300 bg-white p-4 space-y-2.5 animate-slide-up">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-brand-700">Editing</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className="input" placeholder="Name *" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} />
        <input className="input" placeholder="Type (Mover, Cleaner, etc.)" value={v.type} onChange={e => setV({ ...v, type: e.target.value })} />
        <input className="input" placeholder="Phone" value={v.phone} onChange={e => setV({ ...v, phone: e.target.value })} />
        <input className="input" placeholder="Email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} />
      </div>
      <textarea className="input min-h-[60px]" placeholder="Notes (optional)" value={v.notes || ''} onChange={e => setV({ ...v, notes: e.target.value })} />
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-500 w-16">Price</span>
        <input type="number" step="0.01" className="input flex-1" value={v.price === '' || v.price == null ? '' : v.price} onChange={e => setV({ ...v, price: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })} placeholder={`0.00 ${cur}`} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(v)} className="btn-brand btn-sm" disabled={!v.name.trim()}>Save vendor</button>
        <button onClick={onDelete} className="btn-secondary btn-sm text-rose-600">Delete</button>
      </div>
    </div>
  )
}
