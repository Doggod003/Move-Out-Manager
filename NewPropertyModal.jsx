import { useState } from 'react'
import { Plus, X, User } from 'lucide-react'
import { useStore } from '../../lib/store.jsx'
import { slackForItem, urgencyLevel, daysUntil } from '../../lib/utils.js'

const URGENCY_STYLE = {
  overdue: { bg: 'bg-rose-100', text: 'text-rose-700', label: (s) => `${Math.abs(s)}d late` },
  urgent: { bg: 'bg-amber-100', text: 'text-amber-700', label: (s) => s === 0 ? 'Today' : `${s}d` },
  soon: { bg: 'bg-blue-100', text: 'text-blue-700', label: (s) => `${s}d` },
  ok: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: (s) => `${s}d` },
  none: { bg: 'bg-ink-100', text: 'text-ink-500', label: () => '' },
}

export default function ChecklistTab({ property }) {
  const { toggleTask, deleteTask, addTask, addCategory, deleteCategory, assignTask, team } = useStore()
  const d = daysUntil(property.moveDate)

  const counts = { overdue: 0, urgent: 0, soon: 0, ok: 0 }
  if (d !== null) {
    property.checklist.forEach(g => g.items.forEach(it => {
      if (it.done) return
      const lvl = urgencyLevel(slackForItem(property, it))
      if (counts[lvl] !== undefined) counts[lvl]++
    }))
  }

  return (
    <div className="space-y-5">
      {d !== null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { k: 'overdue', l: 'Overdue', s: 'bg-rose-50 text-rose-700' },
            { k: 'urgent', l: 'Urgent', s: 'bg-amber-50 text-amber-700' },
            { k: 'soon', l: 'Soon', s: 'bg-blue-50 text-blue-700' },
            { k: 'ok', l: 'On track', s: 'bg-emerald-50 text-emerald-700' },
          ].map(b => (
            <div key={b.k} className={`rounded-lg p-3 ${b.s}`}>
              <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{b.l}</div>
              <div className="text-2xl font-bold tracking-tighter mt-0.5">{counts[b.k]}</div>
            </div>
          ))}
        </div>
      )}

      <AddCategory onAdd={(name) => addCategory(property.id, name)} />

      {property.checklist.length === 0 && (
        <p className="text-sm text-ink-500 italic">No categories yet. Add one above to get started.</p>
      )}

      {property.checklist.map(group => (
        <CategoryGroup key={group.id} property={property} group={group}
          onToggle={(taskId, done) => toggleTask(property.id, taskId, done)}
          onDelete={(taskId) => deleteTask(property.id, group.id, taskId)}
          onAdd={(text, daysBefore) => addTask(property.id, group.id, text, daysBefore)}
          onAssign={(taskId, userId) => assignTask(property.id, taskId, userId)}
          onDeleteCategory={() => { if (confirm('Remove this category?')) deleteCategory(property.id, group.id) }}
          team={team}
        />
      ))}
    </div>
  )
}

function AddCategory({ onAdd }) {
  const [name, setName] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); if (name.trim()) { onAdd(name.trim()); setName('') } }}
      className="flex gap-2">
      <input className="input flex-1" placeholder="New category…" value={name} onChange={e => setName(e.target.value)} />
      <button type="submit" disabled={!name.trim()} className="btn-secondary">
        <Plus className="w-4 h-4" />Add category
      </button>
    </form>
  )
}

function CategoryGroup({ property, group, onToggle, onDelete, onAdd, onAssign, onDeleteCategory, team }) {
  const dc = group.items.filter(i => i.done).length
  const allDone = group.items.length > 0 && dc === group.items.length

  return (
    <div className="rounded-xl bg-white border border-ink-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-ink-100 bg-ink-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-ink-900">{group.cat}</h3>
          <span className="text-xs text-ink-500">{dc}/{group.items.length}</span>
          {allDone && <span className="badge bg-emerald-100 text-emerald-700">✓ done</span>}
        </div>
        <button onClick={onDeleteCategory} className="text-xs text-ink-400 hover:text-rose-600">Remove</button>
      </div>
      <div className="divide-y divide-ink-100">
        {group.items.map(it => <TaskRow key={it.id} property={property} item={it} onToggle={onToggle} onDelete={onDelete} onAssign={onAssign} team={team} />)}
        <AddTask onAdd={onAdd} />
      </div>
    </div>
  )
}

function TaskRow({ property, item, onToggle, onDelete, onAssign, team }) {
  const [showAssign, setShowAssign] = useState(false)
  const slack = slackForItem(property, item)
  const lvl = urgencyLevel(slack)
  const style = URGENCY_STYLE[lvl]
  const showPill = !item.done && property.moveDate && lvl !== 'none'
  const assignedTo = team.find(t => t.id === item.assignedTo)

  return (
    <div className="px-4 py-2.5 flex items-center gap-3 group hover:bg-ink-50/50 transition-colors">
      <input type="checkbox" checked={item.done} onChange={e => onToggle(item.id, e.target.checked)}
        className="w-4 h-4 rounded text-emerald-600 cursor-pointer flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className={`text-sm leading-snug ${item.done ? 'line-through text-ink-400' : 'text-ink-800'}`}>{item.text}</div>
        {assignedTo && <div className="text-[10px] text-ink-500 mt-0.5">Assigned to {assignedTo.name}</div>}
      </div>
      {showPill && <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label(slack)}</span>}
      <div className="relative">
        <button onClick={() => setShowAssign(!showAssign)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-ink-700 p-1 transition-opacity">
          <User className="w-3.5 h-3.5" />
        </button>
        {showAssign && (
          <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-ink-200 rounded-lg shadow-floaty w-48 py-1">
            {team.map(t => (
              <button key={t.id} onClick={() => { onAssign(item.id, t.id); setShowAssign(false) }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-ink-50 flex items-center gap-2">
                <span>{t.avatar}</span>{t.name}
              </button>
            ))}
            {item.assignedTo && (
              <button onClick={() => { onAssign(item.id, null); setShowAssign(false) }} className="w-full text-left px-3 py-1.5 text-xs text-ink-500 hover:bg-ink-50 border-t border-ink-100">Unassign</button>
            )}
          </div>
        )}
      </div>
      <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-rose-600 p-1 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function AddTask({ onAdd }) {
  const [text, setText] = useState('')
  const [days, setDays] = useState('')
  return (
    <form onSubmit={e => {
      e.preventDefault()
      if (!text.trim()) return
      onAdd(text.trim(), days === '' ? null : Math.max(0, parseInt(days, 10) || 0))
      setText(''); setDays('')
    }} className="px-4 py-2 flex items-center gap-2">
      <input className="input flex-1" placeholder="Add task…" value={text} onChange={e => setText(e.target.value)} />
      <input className="input w-20" type="number" min="0" max="180" placeholder="Days" value={days} onChange={e => setDays(e.target.value)} />
      <button type="submit" disabled={!text.trim()} className="btn-secondary btn-sm">Add</button>
    </form>
  )
}
