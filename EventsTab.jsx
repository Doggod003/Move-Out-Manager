export default function Logo({ size = 32, withText = true, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="7" fill="currentColor" className="text-brand-600" />
        <path d="M8 12L16 6L24 12V24H19V18H13V24H8V12Z" fill="white" />
        <circle cx="22" cy="10" r="3" fill="#facc15" />
      </svg>
      {withText && (
        <span className="font-semibold text-ink-900 tracking-tight" style={{ fontSize: size * 0.55 }}>
          MoveOut <span className="text-brand-600">OS</span>
        </span>
      )}
    </div>
  )
}
