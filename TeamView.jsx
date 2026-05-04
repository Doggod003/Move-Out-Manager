// Currencies, dates, expense categories
export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', locale: 'en-US' },
  CAD: { symbol: '$', code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', locale: 'en-IE' },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  AUD: { symbol: '$', code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  MXN: { symbol: '$', code: 'MXN', name: 'Mexican Peso', locale: 'es-MX' },
}

export const DATE_FORMATS = {
  MDY: { label: 'MM/DD/YYYY', sample: '12/31/2025' },
  DMY: { label: 'DD/MM/YYYY', sample: '31/12/2025' },
  YMD: { label: 'YYYY-MM-DD', sample: '2025-12-31' },
}

export const EXPENSE_CATEGORIES = [
  'Cleaning', 'Repairs', 'Movers', 'Utilities', 'Storage', 'Supplies', 'Inspections', 'Legal', 'Other'
]

export const PROPERTY_STATUSES = [
  'Prepping', 'Listed', 'Under contract', 'Closing soon', 'Sold', 'Tenant move-out', 'Archived'
]

export const TEAM_ROLES = {
  owner: { label: 'Owner', color: 'brand', perms: ['*'] },
  manager: { label: 'Manager', color: 'blue', perms: ['view', 'edit', 'assign'] },
  vendor: { label: 'Vendor', color: 'green', perms: ['view'] },
  agent: { label: 'Agent', color: 'amber', perms: ['view', 'edit'] },
  client: { label: 'Client', color: 'gray', perms: ['view'] },
}

export const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
  PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
  PR: 'Puerto Rico', VI: 'US Virgin Islands', GU: 'Guam', AS: 'American Samoa', MP: 'Northern Mariana Islands',
}

// Property themes
export const THEMES = [
  { id: 'rental', keywords: ['rental','rent','apartment','apt','condo','tenant','lease','studio'], icon: '🏢', accent: '#8b5cf6', template: 'rental' },
  { id: 'cabin', keywords: ['cabin','lodge','cottage','chalet','mountain','lake'], icon: '🏕️', accent: '#16a34a', template: 'standard' },
  { id: 'beach', keywords: ['beach','shore','coast','ocean'], icon: '🏖️', accent: '#0ea5e9', template: 'standard' },
  { id: 'townhouse', keywords: ['townhouse','townhome','duplex','rowhome'], icon: '🏘️', accent: '#0891b2', template: 'standard' },
  { id: 'main', keywords: ['main','primary','home','house','residence'], icon: '🏠', accent: '#0d6efd', template: 'standard' },
  { id: 'office', keywords: ['office','commercial','retail'], icon: '🏬', accent: '#475569', template: 'quick' },
  { id: 'investment', keywords: ['investment','flip'], icon: '💼', accent: '#0d9488', template: 'standard' },
]

export const DEFAULT_THEME = { id: 'default', icon: '🏠', accent: '#6366f1', template: 'standard' }

export function detectTheme(name) {
  const lower = (name || '').toLowerCase()
  if (!lower.trim()) return DEFAULT_THEME
  let best = null, bestScore = 0
  for (const t of THEMES) {
    let score = 0
    for (const kw of t.keywords) {
      const re = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i')
      if (re.test(lower)) score += kw.length
    }
    if (score > bestScore) { bestScore = score; best = t }
  }
  return best || DEFAULT_THEME
}

export function prettyThemeLabel(id) {
  return ({
    rental: 'Rental', cabin: 'Cabin', beach: 'Beach', townhouse: 'Townhouse',
    main: 'Primary home', office: 'Commercial', investment: 'Investment', default: 'Property'
  })[id] || 'Property'
}

// Utility providers
export const UTILITY_BY_STATE = {
  PA: { electric: ['PPL','PECO','Duquesne'], gas: ['UGI','Columbia Gas'], water: 'Municipal' },
  NJ: { electric: ['PSE&G','JCP&L'], gas: ['PSE&G','NJ Natural Gas'], water: 'NJ American' },
  NY: { electric: ['Con Edison','National Grid'], gas: ['Con Edison'], water: 'NYC DEP' },
  CA: { electric: ['PG&E','SCE','SDG&E'], gas: ['PG&E','SoCalGas'], water: 'Local' },
  TX: { electric: ['Reliant','TXU'], gas: ['Atmos','CenterPoint'], water: 'Municipal' },
  FL: { electric: ['FPL','Duke','TECO'], gas: ['TECO Peoples'], water: 'Municipal' },
  OH: { electric: ['AEP Ohio','Duke'], gas: ['Columbia Gas of Ohio'], water: 'Municipal' },
  IL: { electric: ['ComEd','Ameren'], gas: ['Peoples Gas','Nicor'], water: 'Municipal' },
  NC: { electric: ['Duke'], gas: ['Piedmont'], water: 'Municipal' },
  GA: { electric: ['Georgia Power'], gas: ['Atlanta Gas Light'], water: 'Municipal' },
  MI: { electric: ['DTE','Consumers'], gas: ['DTE'], water: 'Municipal' },
  WA: { electric: ['Puget Sound','Seattle City Light'], gas: ['NW Natural'], water: 'Municipal' },
  AZ: { electric: ['APS','SRP'], gas: ['Southwest Gas'], water: 'Municipal' },
  CO: { electric: ['Xcel'], gas: ['Xcel'], water: 'Municipal' },
  MA: { electric: ['Eversource','National Grid'], gas: ['National Grid'], water: 'MWRA' },
  VA: { electric: ['Dominion'], gas: ['Washington Gas'], water: 'Municipal' },
  MD: { electric: ['BGE','Pepco'], gas: ['BGE','Washington Gas'], water: 'WSSC' },
  OR: { electric: ['PGE','Pacific Power'], gas: ['NW Natural'], water: 'Municipal' },
  TN: { electric: ['TVA cooperatives'], gas: ['Piedmont'], water: 'Municipal' },
  WI: { electric: ['We Energies','Alliant'], gas: ['We Energies'], water: 'Municipal' },
  MN: { electric: ['Xcel'], gas: ['CenterPoint'], water: 'Municipal' },
  MO: { electric: ['Ameren','Evergy'], gas: ['Spire'], water: 'Municipal' },
  IN: { electric: ['Duke','NIPSCO'], gas: ['NIPSCO'], water: 'Municipal' },
  NV: { electric: ['NV Energy'], gas: ['Southwest Gas'], water: 'Municipal' },
  CT: { electric: ['Eversource','UI'], gas: ['Eversource'], water: 'Aquarion' },
  DC: { electric: ['Pepco'], gas: ['Washington Gas'], water: 'DC Water' },
  // Fallback for any state not listed: AI insights still work, just no preloaded utilities.
}

export function getUtilities(s) { return s && UTILITY_BY_STATE[s] || null }

// Vendor type → expense category mapping
export const VENDOR_TYPE_TO_CATEGORY = {
  mover: 'Movers', moving: 'Movers', cleaner: 'Cleaning', cleaning: 'Cleaning',
  utility: 'Utilities', electric: 'Utilities', gas: 'Utilities',
  storage: 'Storage', contractor: 'Repairs', handyman: 'Repairs',
  painter: 'Repairs', plumber: 'Repairs', electrician: 'Repairs',
  landscaper: 'Repairs', junk: 'Other', carpet: 'Cleaning', window: 'Cleaning',
  inspector: 'Inspections', inspection: 'Inspections', stager: 'Other',
  photographer: 'Other', lawyer: 'Legal', attorney: 'Legal', notary: 'Legal',
}

export function categoryForVendor(t) {
  const s = (t || '').toLowerCase().trim()
  for (const k in VENDOR_TYPE_TO_CATEGORY) if (s.includes(k)) return VENDOR_TYPE_TO_CATEGORY[k]
  return 'Other'
}
