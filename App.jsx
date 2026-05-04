import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, User } from 'lucide-react'
import { useStore } from '../../lib/store.jsx'

const SUGGESTED_PROMPTS = [
  'What\'s left to do?',
  'What should I prioritize this week?',
  'Am I tracking on budget?',
  'Which vendors do I still need?',
  'Generate a brief progress summary',
]

export default function ChatTab({ property }) {
  const { chatWithAgent, apiKey } = useStore()
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  const chat = property.aiChat || []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat.length, busy])

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || busy) return
    setInput('')
    setBusy(true)
    await chatWithAgent(property.id, msg)
    setBusy(false)
  }

  const onSubmit = (e) => { e.preventDefault(); send() }

  return (
    <div className="flex flex-col h-[calc(100vh-26rem)] min-h-[440px] rounded-xl border border-ink-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-200 bg-gradient-to-r from-brand-50 to-amber-50/50 flex items-center gap-2">
        <span className="ai-dot" />
        <span className="text-sm font-medium text-ink-900">Property co-pilot</span>
        <span className="text-xs text-ink-500">— knows everything about {property.name}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.length === 0 && (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-3" />
            <p className="text-sm text-ink-700 font-medium mb-1">Ask anything about this property</p>
            <p className="text-xs text-ink-500 mb-5">The AI sees the full context — checklist, vendors, expenses, photos, status, dates.</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {SUGGESTED_PROMPTS.map(p => (
                <button key={p} onClick={() => send(p)} className="text-xs px-3 py-1.5 rounded-full border border-ink-200 bg-white hover:bg-ink-50 text-ink-700">
                  {p}
                </button>
              ))}
            </div>
            {!apiKey && (
              <div className="mt-6 inline-block px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Add your Anthropic API key in Settings to enable the co-pilot.
              </div>
            )}
          </div>
        )}
        {chat.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
        {busy && <Message role="assistant" content="…" loading />}
      </div>

      <form onSubmit={onSubmit} className="p-3 border-t border-ink-200 flex gap-2">
        <input
          className="input flex-1"
          placeholder={apiKey ? `Ask about ${property.name}…` : 'Add API key in Settings to chat'}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={busy || !apiKey}
        />
        <button type="submit" disabled={!input.trim() || busy || !apiKey} className="btn-brand btn-sm">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}

function Message({ role, content, loading }) {
  if (role === 'user') {
    return (
      <div className="flex gap-3 justify-end animate-fade-in">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-brand-600 text-white px-4 py-2.5 text-sm leading-relaxed">{content}</div>
        <div className="w-8 h-8 rounded-full bg-ink-200 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-ink-700" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-1">
        <Sparkles className="w-4 h-4 text-brand-700" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-ink-100 text-ink-900 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
        {loading ? <span className="ai-dot" /> : content}
      </div>
    </div>
  )
}
