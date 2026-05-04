import { useState } from 'react'
import { Plus, X, UserPlus } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { TEAM_ROLES } from '../lib/constants.js'

const AVATARS = ['👤','👨','👩','🧑','👨‍💼','👩‍💼','🧑‍💼','🦸','🦸‍♀️','🧙']

export default function TeamView() {
  const { team, addTeamMember, removeTeamMember, updateTeamMember } = useStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'manager', avatar: '👤' })

  const create = () => {
    if (!form.name.trim()) return
    addTeamMember({ ...form, name: form.name.trim() })
    setForm({ name: '', email: '', role: 'manager', avatar: '👤' })
    setAdding(false)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Team</h1>
          <p className="text-sm text-ink-600 mt-1">Invite agents, vendors, and clients. Assign tasks and control access by role.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-brand btn-sm">
          <UserPlus className="w-3.5 h-3.5" />Invite member
        </button>
      </div>

      {adding && (
        <div className="rounded-xl bg-white border-2 border-brand-300 p-5 mb-4 animate-slide-up space-y-3">
          <h3 className="font-semibold text-ink-900">Invite a team member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {Object.entries(TEAM_ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
            </select>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setForm({ ...form, avatar: a })}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${form.avatar === a ? 'bg-brand-100 ring-2 ring-brand-500' : 'bg-ink-100 hover:bg-ink-200'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={create} disabled={!form.name.trim()} className="btn-brand btn-sm">Send invite</button>
            <button onClick={() => setAdding(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-ink-200 bg-white overflow-hidden divide-y divide-ink-100">
        {team.map(m => {
          const role = TEAM_ROLES[m.role] || TEAM_ROLES.manager
          return (
            <div key={m.id} className="p-4 flex items-center gap-4 group hover:bg-ink-50/50">
              <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-xl flex-shrink-0">{m.avatar || '👤'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-ink-900">{m.name}</span>
                  <span className={`badge bg-${role.color}-100 text-${role.color}-700 capitalize`}>{role.label}</span>
                </div>
                {m.email && <div className="text-xs text-ink-500 mt-0.5">{m.email}</div>}
              </div>
              <select value={m.role} onChange={e => updateTeamMember(m.id, { role: e.target.value })} className="input h-8 text-xs w-32"
                disabled={m.role === 'owner'}>
                {Object.entries(TEAM_ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
              </select>
              {m.role !== 'owner' && (
                <button onClick={() => { if (confirm(`Remove ${m.name}?`)) removeTeamMember(m.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-400 hover:text-rose-600 p-2">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-xl bg-ink-50 border border-ink-200 p-4 text-sm text-ink-600">
        <div className="font-medium text-ink-900 mb-1">About roles</div>
        <ul className="space-y-1 text-xs leading-relaxed">
          <li><strong>Owner</strong> — full control, billing, member management</li>
          <li><strong>Manager</strong> — view, edit, assign tasks across all properties</li>
          <li><strong>Agent</strong> — view and edit assigned properties</li>
          <li><strong>Vendor</strong> — view assigned tasks only</li>
          <li><strong>Client</strong> — read-only view of shared properties</li>
        </ul>
      </div>
    </div>
  )
}
