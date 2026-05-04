import { createContext, useContext, useEffect, useReducer, useMemo, useCallback } from 'react'
import { loadStore, persistStore, clearStore } from './storage.js'
import { uid, isVendorFinalized } from './utils.js'
import { detectTheme, categoryForVendor, DEFAULT_THEME } from './constants.js'
import { BUILTIN_TEMPLATES } from '../data/templates.js'
import { runMasterAgent, runDailyBriefing, runAgentChat } from '../agent/agent.js'

const StoreCtx = createContext(null)

function syncVendorExpense(p, vendor) {
  const ex = p.expenses.find(e => e.vendorId === vendor.id)
  const amt = Number(vendor.price) || 0
  if (amt <= 0) {
    if (ex) p.expenses = p.expenses.filter(e => e.id !== ex.id)
    return
  }
  const label = vendor.name || vendor.type || 'Vendor'
  const cat = categoryForVendor(vendor.type)
  if (ex) { ex.label = label; ex.amount = amt; ex.category = cat }
  else p.expenses.push({ id: uid(), vendorId: vendor.id, label, category: cat, amount: amt, date: new Date().toISOString().slice(0, 10) })
}

function createPropertyFromTemplate(data, tplChecklist, theme) {
  const checklist = tplChecklist.map(g => ({
    id: uid(),
    cat: g.cat,
    items: g.items.map(it => ({ id: uid(), text: it.text, done: false, daysBefore: it.daysBefore, assignedTo: null })),
  }))
  return {
    id: uid(),
    name: data.name || 'Untitled',
    address: data.address || '', city: data.city || '', addrState: data.addrState || '', zip: data.zip || '',
    moveDate: data.moveDate || '', status: data.status || 'Prepping',
    currency: data.currency || 'USD',
    dateFormat: data.dateFormat || 'MDY',
    themeId: theme.id, themeIcon: theme.icon, themeAccent: theme.accent,
    checklist,
    photos: [], vendors: [], expenses: [], documents: [], events: [], notes: '',
    budget: { total: 0, byCategory: {} },
    aiInsights: null,
    aiSuggestions: null,
    aiNextAction: null,
    aiChat: [],
    teamIds: ['user-1'], // owner only by default
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function genSamplePortfolio() {
  const today = new Date()
  const future = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10) }
  const samples = [
    { name: 'Riverside Main House', address: '142 River Rd', city: 'Harrisburg', addrState: 'PA', zip: '17104', moveDate: future(45), status: 'Listed', tpl: 'standard', budget: { total: 8000, byCategory: { Cleaning: 600, Movers: 2500, Repairs: 2000, Utilities: 200 } } },
    { name: 'Beach Cottage', address: '88 Ocean Ave', city: 'Cape May', addrState: 'NJ', zip: '08204', moveDate: future(20), status: 'Under contract', tpl: 'standard', budget: { total: 5000, byCategory: { Cleaning: 800, Movers: 2000, Repairs: 1500 } } },
    { name: 'Downtown Rental Unit 3B', address: '500 Market St', city: 'Philadelphia', addrState: 'PA', zip: '19106', moveDate: future(8), status: 'Tenant move-out', tpl: 'rental', budget: { total: 1200, byCategory: { Cleaning: 400, Movers: 500 } } },
    { name: 'Mountain Cabin Retreat', address: '1212 Pine Trail', city: 'Stroudsburg', addrState: 'PA', zip: '18360', moveDate: future(60), status: 'Prepping', tpl: 'standard', budget: { total: 0, byCategory: {} } },
    { name: 'Investment Flip on Maple', address: '77 Maple St', city: 'Lancaster', addrState: 'PA', zip: '17601', moveDate: future(3), status: 'Closing soon', tpl: 'quick', budget: { total: 0, byCategory: {} } },
  ]
  return samples.map(s => {
    const theme = detectTheme(s.name)
    const tpl = BUILTIN_TEMPLATES[s.tpl]
    const prop = createPropertyFromTemplate({ ...s, currency: 'USD' }, tpl.checklist, theme)
    if (s.budget) prop.budget = s.budget
    const total = prop.checklist.reduce((sum, g) => sum + g.items.length, 0)
    const target = Math.floor(total * (0.2 + Math.random() * 0.4))
    let dc = 0
    for (const g of prop.checklist) for (const it of g.items) {
      if (dc >= target) break
      if (Math.random() > 0.3) { it.done = true; dc++ }
    }
    if (s.tpl !== 'quick') {
      const v1 = { id: uid(), name: 'Swift Movers', type: 'Mover', phone: '555-0142', email: '', notes: '', price: 1850 }
      const v2 = { id: uid(), name: 'Sparkle Clean', type: 'Cleaner', phone: '555-0188', email: '', notes: '', price: 425 }
      prop.vendors.push(v1, v2)
      syncVendorExpense(prop, v1); syncVendorExpense(prop, v2)
    }
    return prop
  })
}

function defaultTeam() {
  return [
    { id: 'user-1', name: 'You', email: 'you@moveout.os', role: 'owner', avatar: '👤' },
  ]
}

function initialState() {
  const persisted = loadStore()
  if (persisted) {
    return {
      properties: persisted.properties || [],
      activePropertyId: persisted.activePropertyId || null,
      team: persisted.team || defaultTeam(),
      briefing: persisted.briefing || null,
      _briefingSig: persisted._briefingSig || null,
      onboarded: persisted.onboarded || false,
      darkMode: persisted.darkMode || false,
      apiKey: persisted.apiKey || '',
    }
  }
  return {
    properties: [],
    activePropertyId: null,
    team: defaultTeam(),
    briefing: null,
    _briefingSig: null,
    onboarded: false,
    darkMode: false,
    apiKey: '',
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROPERTIES': return { ...state, properties: action.properties }
    case 'ADD_PROPERTY': return { ...state, properties: [...state.properties, action.property] }
    case 'UPDATE_PROPERTY': {
      const properties = state.properties.map(p => p.id === action.id ? { ...p, ...action.patch, updatedAt: Date.now() } : p)
      return { ...state, properties }
    }
    case 'PATCH_PROPERTY_DEEP': {
      const properties = state.properties.map(p => {
        if (p.id !== action.id) return p
        const np = action.update(p)
        np.updatedAt = Date.now()
        return np
      })
      return { ...state, properties }
    }
    case 'DELETE_PROPERTY': return { ...state, properties: state.properties.filter(p => p.id !== action.id) }
    case 'SET_ACTIVE_PROPERTY': return { ...state, activePropertyId: action.id }
    case 'SET_TEAM': return { ...state, team: action.team }
    case 'SET_BRIEFING': return { ...state, briefing: action.briefing, _briefingSig: action.sig }
    case 'SET_ONBOARDED': return { ...state, onboarded: action.value }
    case 'SET_API_KEY': return { ...state, apiKey: action.key }
    case 'SET_DARK': return { ...state, darkMode: action.value }
    case 'LOAD_DEMO': return { ...state, properties: genSamplePortfolio(), onboarded: true }
    case 'CLEAR': return { ...initialState(), onboarded: state.onboarded }
    default: return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // persist
  useEffect(() => { persistStore(state) }, [state])

  // ---- AGENT TRIGGERS ----
  // Debounced runs per property
  const agentTimers = useMemo(() => ({}), [])
  const triggerAgent = useCallback((propertyId) => {
    if (agentTimers[propertyId]) clearTimeout(agentTimers[propertyId])
    agentTimers[propertyId] = setTimeout(async () => {
      const p = state.properties.find(x => x.id === propertyId)
      if (!p) return
      const result = await runMasterAgent(p, state.apiKey)
      if (!result) return
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (prop) => {
        const next = { ...prop }
        // 1. Auto-check
        const ids = result.completed_task_ids || []
        if (ids.length) {
          next.checklist = next.checklist.map(g => ({ ...g, items: g.items.map(it => ids.includes(it.id) ? { ...it, done: true } : it) }))
        }
        // 2. Next action
        if (result.next_action) next.aiNextAction = result.next_action
        // 3. Vendor suggestions
        if (Array.isArray(result.missing_vendors) && result.missing_vendors.length) next.aiSuggestions = result.missing_vendors.slice(0, 3)
        // 4. Status
        if (result.suggested_status && result.suggested_status !== prop.status) next.status = result.suggested_status
        // 5. Budget allocation
        if (result.budget_alloc && result.budget_alloc.byCategory && next.budget && next.budget.total > 0) {
          const existing = Object.values(next.budget.byCategory || {}).reduce((s, v) => s + Number(v || 0), 0)
          if (existing === 0) {
            const newCats = {}
            Object.entries(result.budget_alloc.byCategory).forEach(([k, v]) => {
              const n = Number(v); if (!isNaN(n) && n > 0) newCats[k] = Math.round(n)
            })
            if (Object.keys(newCats).length) next.budget = { ...next.budget, byCategory: newCats }
          }
        }
        // 6. Auto-add tasks
        if (Array.isArray(result.added_tasks) && result.added_tasks.length) {
          let cl = [...next.checklist]
          result.added_tasks.forEach(at => {
            if (!at.text || !at.category) return
            let cat = cl.find(g => g.cat.toLowerCase() === at.category.toLowerCase())
            if (!cat) {
              cat = { id: uid(), cat: at.category, items: [] }
              cl = [...cl, cat]
            } else {
              cat = { ...cat, items: [...cat.items] }
              cl = cl.map(g => g.cat.toLowerCase() === at.category.toLowerCase() ? cat : g)
            }
            const exists = cat.items.some(it => it.text.toLowerCase().includes(at.text.toLowerCase().slice(0, 12)) || at.text.toLowerCase().includes(it.text.toLowerCase().slice(0, 12)))
            if (!exists) cat.items.push({ id: uid(), text: at.text, done: false, daysBefore: typeof at.daysBefore === 'number' ? at.daysBefore : 7 })
          })
          next.checklist = cl
        }
        return next
      }})
    }, 700)
  }, [state.properties, state.apiKey, agentTimers])

  // Briefing
  const briefingTimer = useMemo(() => ({ t: null }), [])
  const triggerBriefing = useCallback(() => {
    clearTimeout(briefingTimer.t)
    briefingTimer.t = setTimeout(async () => {
      if (state.properties.length === 0) return
      const sig = state.properties.map(p => p.id + ':' + p.checklist.reduce((s, g) => s + g.items.filter(i => i.done).length, 0) + ':' + p.vendors.length + ':' + p.status).join('|')
      if (state._briefingSig === sig && state.briefing) return
      const briefing = await runDailyBriefing(state.properties, state.apiKey)
      if (briefing) dispatch({ type: 'SET_BRIEFING', briefing, sig })
    }, 1200)
  }, [state.properties, state.briefing, state._briefingSig, state.apiKey, briefingTimer])

  // Action helpers
  const actions = useMemo(() => ({
    addProperty: (data, ctx) => {
      let np
      if (ctx.source === 'auto' || ctx.source === 'builtin') {
        const theme = ctx.source === 'auto' ? (ctx.theme || detectTheme(data.name)) : detectTheme(data.name)
        const tk = ctx.source === 'auto' ? theme.template : ctx.templateKey
        np = createPropertyFromTemplate(data, BUILTIN_TEMPLATES[tk].checklist, theme)
      } else if (ctx.source === 'ai') {
        np = createPropertyFromTemplate(data, ctx.generatedChecklist, detectTheme(data.name))
      }
      dispatch({ type: 'ADD_PROPERTY', property: np })
      dispatch({ type: 'SET_ACTIVE_PROPERTY', id: np.id })
      setTimeout(() => triggerAgent(np.id), 100)
      return np
    },
    updateProperty: (id, patch) => dispatch({ type: 'UPDATE_PROPERTY', id, patch }),
    patchProperty: (id, update) => dispatch({ type: 'PATCH_PROPERTY_DEEP', id, update }),
    deleteProperty: (id) => dispatch({ type: 'DELETE_PROPERTY', id }),
    setActiveProperty: (id) => dispatch({ type: 'SET_ACTIVE_PROPERTY', id }),
    toggleTask: (propertyId, taskId, done) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, checklist: p.checklist.map(g => ({ ...g, items: g.items.map(it => it.id === taskId ? { ...it, done } : it) }))
      })})
      triggerAgent(propertyId)
    },
    addTask: (propertyId, categoryId, text, daysBefore = 7) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, checklist: p.checklist.map(g => g.id === categoryId ? { ...g, items: [...g.items, { id: uid(), text, done: false, daysBefore, assignedTo: null }] } : g)
      })})
    },
    deleteTask: (propertyId, categoryId, taskId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, checklist: p.checklist.map(g => g.id === categoryId ? { ...g, items: g.items.filter(it => it.id !== taskId) } : g)
      })})
    },
    addCategory: (propertyId, name) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, checklist: [...p.checklist, { id: uid(), cat: name, items: [] }]
      })})
    },
    deleteCategory: (propertyId, categoryId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, checklist: p.checklist.filter(g => g.id !== categoryId)
      })})
    },
    assignTask: (propertyId, taskId, userId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, checklist: p.checklist.map(g => ({ ...g, items: g.items.map(it => it.id === taskId ? { ...it, assignedTo: userId } : it) }))
      })})
    },
    upsertVendor: (propertyId, vendor) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => {
        const next = { ...p }
        const idx = next.vendors.findIndex(v => v.id === vendor.id)
        if (idx >= 0) next.vendors = next.vendors.map(v => v.id === vendor.id ? vendor : v)
        else next.vendors = [...next.vendors, vendor]
        // sync expense
        const expenses = [...next.expenses]
        const exIdx = expenses.findIndex(e => e.vendorId === vendor.id)
        const amt = Number(vendor.price) || 0
        if (amt > 0) {
          const expense = { id: exIdx >= 0 ? expenses[exIdx].id : uid(), vendorId: vendor.id, label: vendor.name || vendor.type || 'Vendor', category: categoryForVendor(vendor.type), amount: amt, date: new Date().toISOString().slice(0, 10) }
          if (exIdx >= 0) expenses[exIdx] = expense
          else expenses.push(expense)
        } else if (exIdx >= 0) {
          expenses.splice(exIdx, 1)
        }
        next.expenses = expenses
        return next
      }})
      if (isVendorFinalized(vendor)) triggerAgent(propertyId)
    },
    deleteVendor: (propertyId, vendorId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p,
        vendors: p.vendors.filter(v => v.id !== vendorId),
        expenses: p.expenses.filter(e => e.vendorId !== vendorId),
      })})
    },
    addPhoto: (propertyId, src, label = '', tags = []) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, photos: [...p.photos, { id: uid(), src, label, tags, room: '', uploadedAt: Date.now() }]
      })})
      triggerAgent(propertyId)
    },
    updatePhoto: (propertyId, photoId, patch) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, photos: p.photos.map(ph => ph.id === photoId ? { ...ph, ...patch } : ph)
      })})
    },
    deletePhoto: (propertyId, photoId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, photos: p.photos.filter(ph => ph.id !== photoId)
      })})
    },
    addExpense: (propertyId, exp) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, expenses: [...p.expenses, { id: uid(), ...exp, date: exp.date || new Date().toISOString().slice(0, 10) }]
      })})
    },
    updateExpense: (propertyId, expenseId, patch) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, expenses: p.expenses.map(e => e.id === expenseId ? { ...e, ...patch } : e)
      })})
    },
    deleteExpense: (propertyId, expenseId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, expenses: p.expenses.filter(e => e.id !== expenseId)
      })})
    },
    setBudget: (propertyId, budget) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({ ...p, budget }) })
      triggerAgent(propertyId)
    },
    addDocument: (propertyId, doc) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, documents: [...p.documents, { id: uid(), ...doc, uploadedAt: Date.now() }]
      })})
    },
    deleteDocument: (propertyId, docId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, documents: p.documents.filter(d => d.id !== docId)
      })})
    },
    addEvent: (propertyId, evt) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, events: [...p.events, { id: uid(), ...evt }]
      })})
    },
    deleteEvent: (propertyId, eventId) => {
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (p) => ({
        ...p, events: p.events.filter(e => e.id !== eventId)
      })})
    },
    updateNotes: (propertyId, notes) => {
      dispatch({ type: 'UPDATE_PROPERTY', id: propertyId, patch: { notes } })
    },
    addTeamMember: (member) => {
      dispatch({ type: 'SET_TEAM', team: [...state.team, { id: uid(), ...member }] })
    },
    removeTeamMember: (memberId) => {
      dispatch({ type: 'SET_TEAM', team: state.team.filter(m => m.id !== memberId) })
    },
    updateTeamMember: (memberId, patch) => {
      dispatch({ type: 'SET_TEAM', team: state.team.map(m => m.id === memberId ? { ...m, ...patch } : m) })
    },
    chatWithAgent: async (propertyId, message) => {
      const p = state.properties.find(x => x.id === propertyId)
      if (!p) return
      // Add user message
      dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (prop) => ({
        ...prop, aiChat: [...(prop.aiChat || []), { role: 'user', content: message, ts: Date.now() }]
      })})
      // Stream response
      const reply = await runAgentChat(p, [...(p.aiChat || []), { role: 'user', content: message }], state.apiKey)
      if (reply) {
        dispatch({ type: 'PATCH_PROPERTY_DEEP', id: propertyId, update: (prop) => ({
          ...prop, aiChat: [...(prop.aiChat || []), { role: 'assistant', content: reply, ts: Date.now() }]
        })})
      }
    },
    loadDemo: () => dispatch({ type: 'LOAD_DEMO' }),
    clear: () => { clearStore(); dispatch({ type: 'CLEAR' }) },
    setOnboarded: (value) => dispatch({ type: 'SET_ONBOARDED', value }),
    setApiKey: (key) => dispatch({ type: 'SET_API_KEY', key }),
    triggerAgent,
    triggerBriefing,
  }), [state.properties, state.team, state.apiKey, triggerAgent, triggerBriefing])

  return <StoreCtx.Provider value={{ ...state, ...actions }}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
