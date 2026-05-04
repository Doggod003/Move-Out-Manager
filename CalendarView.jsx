export const STANDARD_CHECKLIST = [
  { cat: 'Utilities', items: [
    { text: 'Schedule electric service transfer', daysBefore: 14 },
    { text: 'Schedule gas service transfer', daysBefore: 14 },
    { text: 'Cancel internet/cable', daysBefore: 7 },
    { text: 'Forward mail with USPS', daysBefore: 14 },
  ]},
  { cat: 'Deep Clean', items: [
    { text: 'Clean inside oven and stovetop', daysBefore: 2 },
    { text: 'Clean inside fridge/freezer', daysBefore: 1 },
    { text: 'Clean all bathrooms', daysBefore: 1 },
    { text: 'Hire cleaning service for final clean', daysBefore: 5 },
    { text: 'Vacuum and mop all floors', daysBefore: 1 },
  ]},
  { cat: 'Repairs', items: [
    { text: 'Patch nail holes in walls', daysBefore: 14 },
    { text: 'Touch up paint where needed', daysBefore: 14 },
    { text: 'Hire painter for touch-up work', daysBefore: 14 },
    { text: 'Replace burnt-out light bulbs', daysBefore: 7 },
  ]},
  { cat: 'Movers', items: [
    { text: 'Hire moving company', daysBefore: 21 },
    { text: 'Confirm moving date with movers', daysBefore: 7 },
    { text: 'Pack non-essentials', daysBefore: 14 },
  ]},
  { cat: 'Documentation', items: [
    { text: 'Photos of every room (empty)', daysBefore: 1 },
    { text: 'Photos of all appliances', daysBefore: 1 },
    { text: 'Read final utility meter readings', daysBefore: 0 },
  ]},
  { cat: 'Final', items: [
    { text: 'Remove all personal items', daysBefore: 1 },
    { text: 'Verify all keys/remotes accounted for', daysBefore: 0 },
    { text: 'Lock all windows and doors', daysBefore: 0 },
  ]},
]

export const RENTAL_CHECKLIST = [
  { cat: 'Notice', items: [
    { text: 'Give written notice to landlord', daysBefore: 30 },
    { text: 'Schedule pre-move-out walkthrough', daysBefore: 7 },
    { text: 'Provide forwarding address for deposit', daysBefore: 1 },
  ]},
  { cat: 'Cleaning', items: [
    { text: 'Hire cleaning service', daysBefore: 5 },
    { text: 'Clean inside oven and stovetop', daysBefore: 2 },
    { text: 'Clean all bathrooms', daysBefore: 1 },
  ]},
  { cat: 'Movers', items: [
    { text: 'Hire moving company', daysBefore: 14 },
    { text: 'Pack non-essentials', daysBefore: 7 },
  ]},
  { cat: 'Documentation', items: [
    { text: 'Photos of every room (empty)', daysBefore: 1 },
    { text: 'Get keys-returned receipt', daysBefore: 0 },
  ]},
]

export const QUICK_CHECKLIST = [
  { cat: 'Utilities', items: [
    { text: 'Schedule electric disconnect', daysBefore: 7 },
    { text: 'Forward mail', daysBefore: 7 },
  ]},
  { cat: 'Movers', items: [{ text: 'Hire moving company', daysBefore: 14 }] },
  { cat: 'Final', items: [
    { text: 'Take condition photos', daysBefore: 1 },
    { text: 'Lock up, hand over keys', daysBefore: 0 },
  ]},
]

export const BUILTIN_TEMPLATES = {
  standard: { name: 'Standard sale', desc: 'Full move-out for a property going to market', checklist: STANDARD_CHECKLIST },
  rental: { name: 'Rental move-out', desc: 'Tenant turnover — security deposit focus', checklist: RENTAL_CHECKLIST },
  quick: { name: 'Quick move', desc: 'Short list for fast turnarounds', checklist: QUICK_CHECKLIST },
  blank: { name: 'Blank slate', desc: 'Build it from zero', checklist: [] },
}
