/**
 * "Continue editing" lily pad: only shown when a roadmap is already in progress. Sits between
 * Create and Open and names the roadmap it will reopen.
 */
export default function ContinuePad({ name, hasUnbackedChanges, onContinue }) {
  return (
    <button
      type="button"
      onClick={onContinue}
      data-testid="continue-editing-btn"
      aria-label={`Continue editing ${name}`}
      style={{ animationDelay: '0.45s' }}
      className="animate-duck-bob group relative flex w-28 flex-col items-center px-1 py-2 text-center text-white transition-all duration-300 hover:rotate-0 hover:scale-105 sm:w-48 sm:px-3 sm:py-3"
    >
      <svg
        viewBox="0 0 76 52"
        className="relative mb-1 h-12 w-16 overflow-visible drop-shadow-[0_6px_12px_rgba(251,191,36,0.45)] transition-transform group-hover:scale-110 sm:h-[5.25rem] sm:w-28"
      >
        <defs>
          <linearGradient id="continuePadGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path
          d="M38 39 L69 35 A32 10 0 1 1 66 31 Z"
          fill="url(#continuePadGrad)"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* A page with a pencil: the roadmap you were working on */}
        <rect
          x="24"
          y="8"
          width="22"
          height="27"
          rx="3"
          fill="#ffffff"
          stroke="#d97706"
          strokeWidth="1.6"
        />
        <path
          d="M29 16 H41 M29 21 H41 M29 26 H36"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M43 31 L55 14 L59 17 L47 34 L42 35 Z"
          fill="#fde047"
          stroke="#92400e"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M55 14 L58 12 L61 15 L59 17 Z" fill="#fb7185" stroke="#92400e" strokeWidth="1.2" />
      </svg>
      <span className="relative flex items-center gap-1.5 text-sm font-extrabold tracking-tight text-white drop-shadow-sm sm:text-base">
        {hasUnbackedChanges && (
          <span
            title="Not backed up"
            className="inline-block h-2 w-2 shrink-0 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.9)]"
          />
        )}
        Continue editing
        {hasUnbackedChanges && <span className="sr-only">(not backed up)</span>}
      </span>
      <span className="relative max-w-full truncate text-[11px] font-bold text-amber-200 drop-shadow-sm sm:text-xs">
        “{name}”
      </span>
    </button>
  );
}
