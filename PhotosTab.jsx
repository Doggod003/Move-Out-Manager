import { useEffect, useState } from 'react'
import { useStore } from '../../lib/store.jsx'

export default function NotesTab({ property }) {
  const { updateNotes } = useStore()
  const [val, setVal] = useState(property.notes || '')

  // Debounced save
  useEffect(() => {
    const t = setTimeout(() => {
      if (val !== property.notes) updateNotes(property.id, val)
    }, 600)
    return () => clearTimeout(t)
  }, [val])

  return (
    <div>
      <div className="mb-3">
        <h3 className="font-semibold text-ink-900">Notes</h3>
        <p className="text-sm text-ink-600">Free-form notes for this property. Auto-saves as you type.</p>
      </div>
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={`Anything you want to remember about ${property.name}…`}
        className="input min-h-[400px] font-mono text-sm leading-relaxed"
      />
    </div>
  )
}
