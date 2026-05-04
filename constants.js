import { CURRENCIES, US_STATES, prettyThemeLabel } from '../lib/constants.js'
import { daysUntil, slackForItem } from '../lib/utils.js'

const MODEL = 'claude-sonnet-4-20250514'

// Use a proxy/serverless function in production. For the demo we expect the user to set their key.
async function callApi(systemPrompt, userPrompt, apiKey, maxTokens = 1500) {
  if (!apiKey) {
    // Without an API key, return null — agent silently does nothing.
    return null
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    if (!r.ok) return null
    const data = await r.json()
    const t = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n')
    return t
  } catch {
    return null
  }
}

function tryParseJson(text) {
  if (!text) return null
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

function buildContext(p) {
  const d = daysUntil(p.moveDate)
  return {
    name: p.name,
    type: prettyThemeLabel(p.themeId),
    location: (p.city ? p.city + ', ' : '') + (p.addrState ? US_STATES[p.addrState] || p.addrState : ''),
    zip: p.zip,
    moveOut: p.moveDate,
    daysUntilMove: d,
    status: p.status,
    currency: p.currency || 'USD',
    checklist: p.checklist.map(g => ({
      category: g.cat,
      items: g.items.map(it => ({ id: it.id, text: it.text, done: it.done, daysBefore: it.daysBefore })),
    })),
    vendors: p.vendors.map(v => ({ name: v.name, type: v.type, price: v.price === '' ? null : Number(v.price), notes: v.notes })),
    photos: p.photos.map(ph => ({ label: ph.label, room: ph.room, tags: ph.tags })),
    expenses: p.expenses.map(e => ({ label: e.label, category: e.category, amount: Number(e.amount || 0) })),
    budget: p.budget || { total: 0, byCategory: {} },
  }
}

export async function runMasterAgent(p, apiKey) {
  if (!p) return null
  const ctx = buildContext(p)
  const cur = CURRENCIES[p.currency || 'USD']
  const sys = "You are an autonomous move-out operations agent. Silently optimize a property's move-out plan. Be DECISIVE. Return ONLY JSON, no prose."
  const prompt = `Property context:\n${JSON.stringify(ctx)}\n\nReturn ONLY this JSON:\n{\n  "completed_task_ids": ["ids of tasks clearly satisfied by current vendors/photos"],\n  "next_action": "single most useful sentence telling user what to do next",\n  "missing_vendors": [{"type":"e.g. Painter","reason":"why","est_price":number_in_${cur.code}}],\n  "suggested_status": "Prepping|Listed|Under contract|Closing soon|Sold|Tenant move-out|Archived (only if clearly justified else null)",\n  "budget_alloc": {"total": number_or_null, "byCategory": {"Cleaning":n,"Movers":n,"Repairs":n,"Utilities":n,"Other":n}},\n  "added_tasks": [{"category":"name","text":"task","daysBefore":n}]\n}\n\nRules:\n- completed_task_ids: AGGRESSIVE inference. Mover hired => "Hire moving company" done. Cleaner hired => "Hire cleaning service" done (NOT "Clean inside oven"). Painter hired => "Hire painter" done. Multiple labeled photos => "Photos of every room" done.\n- next_action: specific & useful for ${cur.code}\n- missing_vendors: only if clearly needed, max 3\n- suggested_status: only if existing status clearly wrong\n- budget_alloc: ONLY if total > 0 and byCategory empty/unbalanced. For ${ctx.type} in ${ctx.location || 'US'}.\n- added_tasks: 0-3 truly missing property-specific tasks.`

  const text = await callApi(sys, prompt, apiKey, 2500)
  return tryParseJson(text)
}

export async function runDailyBriefing(properties, apiKey) {
  if (!properties || properties.length === 0) return null
  const summary = properties.map(p => {
    const stats = p.checklist.reduce((s, g) => { s.total += g.items.length; s.done += g.items.filter(i => i.done).length; return s }, { total: 0, done: 0 })
    const d = daysUntil(p.moveDate)
    const overdue = p.checklist.reduce((sum, g) => sum + g.items.filter(it => !it.done && (slackForItem(p, it) || 0) < 0).length, 0)
    return {
      name: p.name, status: p.status, daysUntilMove: d,
      taskPct: stats.total ? Math.round((stats.done / stats.total) * 100) : 0,
      overdueCount: overdue, vendors: p.vendors.length,
      spend: p.expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
      budget: p.budget ? p.budget.total : 0, currency: p.currency,
    }
  })
  const sys = 'You are a portfolio operations agent. Generate a CONCISE morning briefing. Return ONLY JSON.'
  const prompt = `Properties:\n${JSON.stringify(summary)}\n\nReturn ONLY:\n{\n  "headline": "one sentence about portfolio state today",\n  "needs_attention": ["1-3 items, each: 'Property name: reason'"],\n  "wins": ["1-2 positive notes"],\n  "money_note": "one sentence on budget/spend across portfolio"\n}`
  const text = await callApi(sys, prompt, apiKey, 800)
  return tryParseJson(text)
}

export async function runAgentChat(property, messages, apiKey) {
  if (!property) return null
  const ctx = buildContext(property)
  const cur = CURRENCIES[property.currency || 'USD']
  const sys = `You are the AI co-pilot for the property "${property.name}". Speak in plain prose, no markdown headers, no bullet lists unless the user asks. Be concise (2-5 sentences typical) and concrete. You see the full property context — refer to specific tasks/vendors/numbers when answering. Use ${cur.code} for money. The user is the property owner or manager.`
  const last = messages[messages.length - 1]?.content || ''
  const history = messages.slice(0, -1).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
  const prompt = `Property context:\n${JSON.stringify(ctx)}\n\nConversation so far:\n${history}\n\nUser: ${last}\n\nRespond as the AI co-pilot.`
  const text = await callApi(sys, prompt, apiKey, 800)
  return text || "I'm offline right now — set your Anthropic API key in Settings to enable the AI co-pilot."
}

export async function generateChecklistFromListing(text, apiKey) {
  const sys = 'Move-out checklist generator. Return ONLY JSON.'
  const prompt = `Property: ${text}\n\nReturn:\n{"categories":[{"cat":"Name","items":[{"text":"task","daysBefore":n}]}]}\n5-7 categories, 3-8 items each. Concrete, property-specific tasks.`
  const result = await callApi(sys, prompt, apiKey, 2500)
  return tryParseJson(result)
}
