import { Sparkles, Building2 } from 'lucide-react'
import { useState } from 'react'
import NewPropertyModal from './NewPropertyModal.jsx'

export default function EmptyState({ onDemo }) {
  const [openNew, setOpenNew] = useState(false)
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Welcome to MoveOut OS</h2>
        <p className="text-ink-600 mt-2 leading-relaxed">Your AI-powered move-out workspace. Start with the demo portfolio to see what it can do, or add your first property.</p>
        <div className="mt-7 flex flex-col gap-2">
          <button onClick={onDemo} className="btn-brand">
            <Sparkles className="w-4 h-4" />Load demo portfolio
          </button>
          <button onClick={() => setOpenNew(true)} className="btn-secondary">+ Add your first property</button>
        </div>
      </div>
      {openNew && <NewPropertyModal onClose={() => setOpenNew(false)} />}
    </div>
  )
}
