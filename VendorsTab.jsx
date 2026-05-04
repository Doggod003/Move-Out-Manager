import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open = true, title, subtitle, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-floaty border border-ink-200 max-h-[90vh] flex flex-col animate-slide-up`}>
        {(title || onClose) && (
          <div className="px-6 pt-5 pb-3 border-b border-ink-100 flex items-start justify-between gap-3">
            <div>
              {title && <h2 className="text-lg font-semibold text-ink-900 tracking-tight">{title}</h2>}
              {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
            </div>
            {onClose && (
              <button onClick={onClose} className="text-ink-400 hover:text-ink-700 -mt-1 -mr-1 p-1 rounded-md hover:bg-ink-100">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-ink-100 bg-ink-50/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  )
}
