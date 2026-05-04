import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Calendar, BarChart3, Users, FileText, Shield, Camera, MessageSquare, Building2, CheckCircle2, Star } from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Nav />
      <Hero />
      <SocialProof />
      <FeatureGrid />
      <AiSection />
      <ScreenshotShowcase />
      <Testimonials />
      <PricingPreview />
      <CTA />
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-50/80 border-b border-ink-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-600">
          <a href="#features" className="hover:text-ink-900">Features</a>
          <a href="#ai" className="hover:text-ink-900">AI</a>
          <Link to="/pricing" className="hover:text-ink-900">Pricing</Link>
          <a href="#testimonials" className="hover:text-ink-900">Customers</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/app" className="text-sm text-ink-600 hover:text-ink-900 hidden sm:inline">Sign in</Link>
          <Link to="/app" className="btn-brand btn-sm">Start free trial<ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-native, not AI-bolted-on
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-ink-900 leading-[0.95]">
            Move-outs that <span className="text-brand-600">run themselves</span>.
          </h1>
          <p className="mt-6 text-xl text-ink-600 max-w-2xl leading-relaxed">
            The first move-out platform with an AI agent that auto-checks tasks, allocates budgets, suggests vendors, and tells you what to do next — all silently in the background while you focus on closing deals.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/app" className="btn-brand">
              Start free — no credit card<ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/app" className="btn-secondary">See live demo</Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-ink-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free up to 3 properties</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 14-day pro trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> No CC required</span>
          </div>
        </div>
      </div>

      {/* Decorative gradient mesh */}
      <div className="absolute top-0 right-0 w-[42rem] h-[42rem] -mr-32 -mt-32 pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-300/40 via-brand-200/20 to-transparent blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-1/2 w-[32rem] h-[32rem] -mb-32 pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-200/30 via-pink-200/20 to-transparent blur-3xl" />
      </div>
    </section>
  )
}

function SocialProof() {
  return (
    <div className="border-y border-ink-200 bg-white/60">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-ink-500 mb-6">Trusted by property pros across the US</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70">
          {['Stonemark Realty', 'PrimeCare Properties', 'Maple Holdings', 'Riverside Group', 'Cape May Co.', 'Lancaster RE'].map(n => (
            <span key={n} className="text-base font-semibold tracking-tight text-ink-700">{n}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: Sparkles, title: 'Autonomous AI agent', desc: 'Auto-checks tasks, suggests vendors, allocates budgets, drafts a "do this next" plan — all silently as you work.' },
  { icon: Calendar, title: 'Calendar & timeline', desc: 'See every move-out across your portfolio on one calendar. Drag tasks to reschedule. Visual timelines per property.' },
  { icon: BarChart3, title: 'Reports & closing packets', desc: 'One-click PDF closing packets. Portfolio analytics. Vendor spend reports. Tax-ready expense exports.' },
  { icon: Users, title: 'Team collaboration', desc: 'Invite agents, vendors, clients. Role-based access. Assign tasks. Real-time updates across your team.' },
  { icon: FileText, title: 'Document vault', desc: 'Centralize leases, inspections, receipts, photos. Each property gets its own organized vault.' },
  { icon: Camera, title: 'Walkthrough mode', desc: 'Mobile-first companion for on-site work. Photograph rooms, check tasks, capture conditions in seconds.' },
  { icon: MessageSquare, title: 'Chat with each property', desc: 'Ask "what\'s left to do?" or "who handles repairs?" Your AI co-pilot knows the full context of every property.' },
  { icon: Building2, title: 'Vendor directory', desc: 'Build a roster of trusted movers, cleaners, contractors. AI suggests the right ones for each property.' },
  { icon: Shield, title: 'Built for portfolios', desc: 'Whether you manage 3 properties or 300, MoveOut OS scales with multi-property dashboards and bulk actions.' },
]

function FeatureGrid() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white border-y border-ink-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-ink-900">Everything you need to ship a move-out cleanly.</h2>
          <p className="mt-4 text-lg text-ink-600">From the first listing to the keys handover. Built for the people who do this every week.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-ink-200 bg-ink-50/50 hover:bg-white hover:border-ink-300 hover:shadow-soft transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-ink-900 text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AiSection() {
  return (
    <section id="ai" className="py-24 lg:py-32 bg-ink-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-600 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-brand-300 text-xs font-medium mb-6">
            <span className="ai-dot" />
            The AI agent runs continuously
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[0.95]">
            Your move-out manager, but it's an agent.
          </h2>
          <p className="mt-6 text-xl text-ink-300 leading-relaxed max-w-2xl">
            We didn't bolt AI onto a checklist app. We built the entire product around an autonomous agent that actually does the work — silently — every time something changes.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-7 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <div className="text-xs text-brand-300 uppercase tracking-wider font-medium mb-3 flex items-center gap-2"><span className="ai-dot" /> Auto-check</div>
            <h3 className="text-xl font-semibold mb-2">Tasks complete themselves</h3>
            <p className="text-ink-300 leading-relaxed">Hire a mover and "Hire moving company" silently checks off. Upload room photos and "Photo documentation" handles itself. The AI infers what's done from what you actually do.</p>
          </div>
          <div className="p-7 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <div className="text-xs text-brand-300 uppercase tracking-wider font-medium mb-3 flex items-center gap-2"><span className="ai-dot" /> Daily briefing</div>
            <h3 className="text-xl font-semibold mb-2">Know what to do, every morning</h3>
            <p className="text-ink-300 leading-relaxed">Open the app and see a portfolio briefing: what needs attention today, recent wins, where you're tracking on budget. No more "what was I supposed to do?" mornings.</p>
          </div>
          <div className="p-7 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <div className="text-xs text-brand-300 uppercase tracking-wider font-medium mb-3 flex items-center gap-2"><span className="ai-dot" /> Vendor suggestions</div>
            <h3 className="text-xl font-semibold mb-2">It tells you who to hire</h3>
            <p className="text-ink-300 leading-relaxed">"You need a painter ($800), a junk hauler ($300), and a carpet cleaner ($400)" — with reasons, prices, and one-click placeholders. Custom-tailored for the property in question.</p>
          </div>
          <div className="p-7 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <div className="text-xs text-brand-300 uppercase tracking-wider font-medium mb-3 flex items-center gap-2"><span className="ai-dot" /> Chat copilot</div>
            <h3 className="text-xl font-semibold mb-2">Ask anything, anytime</h3>
            <p className="text-ink-300 leading-relaxed">"What's left for Beach Cottage?" "Can I afford to hire a stager?" "What's overdue across all properties?" Your AI knows every detail of your portfolio.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ScreenshotShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-ink-900">A workspace that respects your time.</h2>
          <p className="mt-4 text-lg text-ink-600">Clean. Fast. Calm. Built by someone who's actually managed properties.</p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-ink-200 shadow-floaty bg-ink-50">
          <div className="px-4 py-3 border-b border-ink-200 bg-white flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-ink-500 ml-3 font-mono">moveout.os/dashboard</span>
          </div>
          <div className="p-8 lg:p-12 grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-3">
              {['Dashboard', 'Calendar', 'Timeline', 'Vendors', 'Reports', 'Team', 'Settings'].map((it, i) => (
                <div key={it} className={`px-3 py-2 rounded-lg text-sm ${i === 0 ? 'bg-brand-100 text-brand-700 font-medium' : 'text-ink-600'}`}>{it}</div>
              ))}
            </div>
            <div className="col-span-9 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-brand-100 to-ink-50 p-5 border border-ink-200">
                <div className="text-xs text-brand-700 font-medium uppercase tracking-wider mb-2">⏺ Today's briefing</div>
                <p className="text-ink-800 font-medium">Two properties need attention today; Beach Cottage closes in 8 days with no movers booked.</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[['Properties', '5'], ['Tasks', '47/82'], ['Overdue', '3'], ['Spent', '$8.2K']].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-ink-50 p-4 border border-ink-200">
                    <div className="text-xs text-ink-500 uppercase tracking-wider">{l}</div>
                    <div className="text-2xl font-semibold text-ink-900 mt-1">{v}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {['🏠 Riverside Main House', '🏖️ Beach Cottage', '🏢 Downtown Rental 3B', '🏕️ Mountain Cabin'].map((n, i) => (
                  <div key={n} className="rounded-xl bg-white p-4 border border-ink-200 flex items-center justify-between">
                    <span className="font-medium text-ink-800">{n}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${[78, 65, 32, 12][i]}%` }} />
                      </div>
                      <span className="text-sm font-medium text-ink-700 w-10 text-right">{[78, 65, 32, 12][i]}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const TESTIMONIALS = [
  { name: 'Mara K.', role: 'RE Agent · Philadelphia', quote: 'I run 12 listings at any time. The AI briefing every morning saves me an hour of digging through spreadsheets. It just tells me what to focus on.' },
  { name: 'Damian S.', role: 'Property Manager · Charlotte', quote: 'I added a cleaner vendor and three tasks just checked themselves. Felt like the app was working with me, not for me. First time I\'ve said that about software.' },
  { name: 'Reema A.', role: 'Investor · Austin', quote: 'Closing packets used to take me hours. Now it\'s one click. The vendor budget allocation alone has saved me real money on three properties.' },
]

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-ink-50 border-y border-ink-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-ink-900">Built with operators, for operators.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="p-7 rounded-2xl bg-white border border-ink-200">
              <div className="flex gap-0.5 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-ink-800 leading-relaxed mb-5">"{t.quote}"</p>
              <div>
                <div className="font-medium text-ink-900">{t.name}</div>
                <div className="text-sm text-ink-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingPreview() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-ink-900">Simple, fair pricing.</h2>
          <p className="mt-4 text-lg text-ink-600">Start free. Pay when it makes you money.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: 'Solo', price: '$0', period: 'forever', desc: 'For your own moves', features: ['Up to 3 properties', 'Full AI agent', 'Calendar + timeline', 'Document vault'] },
            { name: 'Pro', price: '$29', period: '/month', desc: 'For active agents & PMs', popular: true, features: ['Unlimited properties', 'Team of 3', 'Vendor directory', 'Closing packet exports', 'Priority AI processing'] },
            { name: 'Team', price: '$99', period: '/month', desc: 'For growing portfolios', features: ['Everything in Pro', 'Unlimited team members', 'Role-based access', 'White-label closing packets', 'API access'] },
          ].map(t => (
            <div key={t.name} className={`p-7 rounded-2xl border ${t.popular ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/30' : 'border-ink-200 bg-white'}`}>
              {t.popular && <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-600 text-white text-xs font-medium mb-4">Most popular</div>}
              <div className="text-sm text-ink-500 mb-1">{t.name}</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-ink-900 tracking-tighter">{t.price}</span>
                <span className="text-ink-500">{t.period}</span>
              </div>
              <p className="text-sm text-ink-600 mb-5">{t.desc}</p>
              <Link to="/app" className={t.popular ? 'btn-brand w-full' : 'btn-secondary w-full'}>
                {t.name === 'Solo' ? 'Start free' : 'Start trial'}
              </Link>
              <ul className="mt-6 space-y-2.5">
                {t.features.map(f => (
                  <li key={f} className="text-sm text-ink-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 bg-ink-950 text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Stop juggling spreadsheets.</h2>
        <p className="mt-6 text-xl text-ink-400">Start your next move-out in MoveOut OS. The AI does the rest.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/app" className="btn-brand px-6 py-3 text-base">Get started free<ArrowRight className="w-4 h-4" /></Link>
          <Link to="/pricing" className="text-white/80 hover:text-white px-4 py-3">See pricing →</Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-ink-200">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo size={24} />
          <span className="text-sm text-ink-500">© 2026</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-ink-500">
          <Link to="/pricing" className="hover:text-ink-900">Pricing</Link>
          <a href="#features" className="hover:text-ink-900">Features</a>
          <a href="#" className="hover:text-ink-900">Privacy</a>
          <a href="#" className="hover:text-ink-900">Terms</a>
          <a href="#" className="hover:text-ink-900">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
