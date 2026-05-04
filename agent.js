import { useRef } from 'react'
import { FileText, Upload, X, Download } from 'lucide-react'
import { useStore } from '../../lib/store.jsx'

const DOC_TYPES = ['Lease', 'Inspection', 'Receipt', 'Contract', 'Title', 'Insurance', 'Other']

export default function DocumentsTab({ property }) {
  const { addDocument, deleteDocument } = useStore()
  const fileRef = useRef(null)

  const onUpload = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(f => {
      const r = new FileReader()
      r.onload = ev => addDocument(property.id, { name: f.name, type: 'Other', size: f.size, dataUrl: ev.target.result, mime: f.type })
      r.readAsDataURL(f)
    })
    e.target.value = ''
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-ink-900">Document vault</h3>
          <p className="text-sm text-ink-600">Store leases, inspections, contracts, receipts.</p>
        </div>
        <button onClick={() => fileRef.current?.click()} className="btn-brand btn-sm">
          <Upload className="w-3.5 h-3.5" />Upload
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={onUpload} />
      </div>

      {property.documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-10 text-center">
          <FileText className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-sm text-ink-500">No documents yet</p>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary btn-sm mt-3">
            <Upload className="w-3.5 h-3.5" />Upload first document
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
          <div className="divide-y divide-ink-100">
            {property.documents.map(d => (
              <div key={d.id} className="p-3 flex items-center gap-3 hover:bg-ink-50/50 group">
                <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-ink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-ink-900 truncate">{d.name}</div>
                  <div className="text-xs text-ink-500">{d.type} · {(d.size / 1024).toFixed(1)} KB</div>
                </div>
                <a href={d.dataUrl} download={d.name} className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-500 hover:text-ink-900 p-2">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => deleteDocument(property.id, d.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-400 hover:text-rose-600 p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
