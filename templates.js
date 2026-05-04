import { useEffect, useState } from 'react'
import { Sparkles, Bot, ArrowLeft, ChevronRight } from 'lucide-react'
import Modal from './Modal.jsx'
import { useStore } from '../lib/store.jsx'
import { detectTheme, prettyThemeLabel, US_STATES, CURRENCIES, DATE_FORMATS, getUtilities } from '../lib/constants.js'
import { BUILTIN_TEMPLATES } from '../data/templates.js'
import { parseAddress } from '../lib/utils.js'
import { generateChecklistFromListing } from '../agent/agent.js'

export default function NewPropertyModal({ onClose }) {
  const [stage, setStage] = useState('chooser') // chooser | listing | details
  const [ctx, setCtx] = useState(null)

  if (stage === 'chooser') return <ChooserStage onClose={onClose}
    onSmart={() => { setCtx({ source: 'auto' }); setStage('details') }}
    onListing={() => setStage('listing')}
    onTemplate={(key) => { setCtx({ source: 'builtin', templateKey: key }); setStage('details') }}
  />
  if (stage === 'listing') return <ListingStage onClose={onClose} onBack={() => setStage('chooser')} onDone={(generatedChecklist) => { setCtx({ source: 'ai', generatedChecklist }); setStage('details') }} />
  if (stage === 'details') return <DetailsStage onClose={onClose} onBack={() => setStage('chooser')} ctx={ctx} />
  return null
}

function ChooserStage({ onClose, onSmart, onListing, onTemplate }) {
  return (
    <Modal title="Start a new property" subtitle="Choose how to begin" onClose={onClose}>
      <div className="space-y-2 mb-6">
        <button onClick={onSmart} className="btn-primary w-full py-3.5 text-base">
          <Sparkles className="w-4 h-4" /> Smart start
        </button>
        <button onClick={onListing} className="btn-secondary w-full py-3.5 text-base">
          <Bot className="w-4 h-4" /> Generate from listing
        </button>
      </div>
      <div className="text-xs uppercase tracking-wider text-ink-400 mb-2 font-medium">Or pick a template</div>
      <div className="space-y-1.5">
        {Object.entries(BUILTIN_TEMPLATES).map(([k, t]) => {
          const tc = t.checklist.reduce((s, g) => s + g.items.length, 0)
          return (
            <button key={k} onClick={() => onTemplate(k)} className="w-full p-3 rounded-lg border border-ink-200 hover:border-ink-300 hover:bg-ink-50 transition-all flex items-center gap-3 text-left">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-ink-900">{t.name}</div>
                <div className="text-xs text-ink-500 mt-0.5">{t.desc}</div>
              </div>
              <span className="badge bg-ink-100 text-ink-600 flex-shrink-0">{tc} tasks</span>
              <ChevronRight className="w-4 h-4 text-ink-400 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

function ListingStage({ onClose, onBack, onDone }) {
  const { apiKey } = useStore()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const go = async () => {
    if (!text.trim()) return
    setBusy(true); setError('')
    const result = await generateChecklistFromListing(text, apiKey)
    setBusy(false)
    if (result?.categories?.length) onDone(result.categories)
    else setError(apiKey ? 'AI returned an empty checklist. Try again.' : 'Add an Anthropic API key in Settings to use AI generation.')
  }
  return (
    <Modal title="🤖 Generate from listing" subtitle="Paste a property description; AI tailors the checklist" onClose={onClose}
      footer={
        <div className="flex justify-between gap-2">
          <button onClick={onBack} className="btn-ghost"><ArrowLeft className="w-4 h-4" />Back</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={go} disabled={busy || !text.trim()} className="btn-brand btn-sm">{busy ? 'Generating…' : 'Generate'}</button>
          </div>
        </div>
      }>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="e.g. 3-bed beach cottage in Cape May, in-ground pool, gas fireplace, well water, septic system. Closing in 30 days."
        className="input min-h-[140px] resize-y" autoFocus />
      {error && <div className="mt-3 text-xs text-rose-600">{error}</div>}
    </Modal>
  )
}

function DetailsStage({ onClose, onBack, ctx }) {
  const { addProperty } = useStore()
  const [form, setForm] = useState({ name: '', address: '', city: '', addrState: '', zip: '', moveDate: '', status: 'Prepping', currency: 'USD', dateFormat: 'MDY' })
  const [theme, setTheme] = useState(null)
  const [parseHint, setParseHint] = useState('')

  useEffect(() => {
    setTheme(detectTheme(form.name))
  }, [form.name])

  const tryParse = () => {
    const parsed = parseAddress(form.address)
    if (parsed) {
      setForm(f => ({ ...f, address: parsed.street, city: parsed.city, addrState: parsed.state, zip: parsed.zip }))
      setParseHint('✓ Auto-filled' + (getUtilities(parsed.state) ? ` · Utility data available for ${US_STATES[parsed.state]}` : ''))
    }
  }

  const create = () => {
    if (!form.name.trim()) return
    addProperty(form, { ...ctx, theme })
    onClose()
  }

  const tplName = ctx.source === 'auto' ? 'Smart start' : ctx.source === 'ai' ? 'AI-generated' : BUILTIN_TEMPLATES[ctx.templateKey]?.name

  return (
    <Modal title={`New · ${tplName}`} subtitle="Type a name and (optionally) paste a full address" onClose={onClose} size="md"
      footer={
        <div className="flex justify-between gap-2">
          <button onClick={onBack} className="btn-ghost"><ArrowLeft className="w-4 h-4" />Back</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={create} className="btn-brand btn-sm">Create property</button>
          </div>
        </div>
      }>
      {ctx.source === 'auto' && theme && (
        <div className="mb-5 flex items-center gap-3 p-3 rounded-xl border-l-4 bg-ink-50/50 border border-ink-200" style={{ borderLeftColor: theme.accent }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: theme.accent + '20' }}>{theme.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-900">{form.name ? `Detected: ${prettyThemeLabel(theme.id)}` : 'Type a name to start'}</div>
            <div className="text-xs text-ink-500">{BUILTIN_TEMPLATES[theme.template].name} · {BUILTIN_TEMPLATES[theme.template].checklist.reduce((s, g) => s + g.items.length, 0)} tasks</div>
          </div>
        </div>
      )}

      <div className="space-y-3.5">
        <div>
          <label className="label block mb-1">Name</label>
          <input className="input" placeholder="e.g. Beach cottage" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
        </div>
        <div>
          <label className="label block mb-1">Address</label>
          <input className="input" placeholder="1234 Main St, City, ST 12345" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            onBlur={tryParse} onPaste={() => setTimeout(tryParse, 50)} />
          {parseHint && <div className="text-xs text-emerald-600 mt-1">{parseHint}</div>}
        </div>
        <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-2">
          <input className="input" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          <select className="input" value={form.addrState} onChange={e => setForm({ ...form, addrState: e.target.value })}>
            <option value="">State</option>
            {Object.entries(US_STATES).map(([k, v]) => <option key={k} value={k}>{k} — {v}</option>)}
          </select>
          <input className="input" placeholder="ZIP" maxLength={10} value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label block mb-1">Move-out date</label>
            <input type="date" className="input" value={form.moveDate} onChange={e => setForm({ ...form, moveDate: e.target.value })} />
          </div>
          <div>
            <label className="label block mb-1">Status</label>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {['Prepping','Listed','Under contract','Closing soon','Sold','Tenant move-out'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink-100">
          <div>
            <label className="label block mb-1">Currency</label>
            <select className="input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              {Object.entries(CURRENCIES).map(([k, c]) => <option key={k} value={k}>{c.symbol} {c.code}</option>)}
            </select>
          </div>
          <div>
            <label className="label block mb-1">Date format</label>
            <select className="input" value={form.dateFormat} onChange={e => setForm({ ...form, dateFormat: e.target.value })}>
              {Object.entries(DATE_FORMATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}
