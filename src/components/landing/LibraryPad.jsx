/**
 * "Browse Roadmaps" lily pad (desktop app only): opens the grid of roadmaps saved in the library
 * folder. Sits to the right of Open Roadmap.
 */
export default function LibraryPad({ onBrowse }) {
  return (
    <button
      type="button"
      onClick={onBrowse}
      data-testid="library-open-btn"
      style={{ animationDelay: '1.25s' }}
      className="animate-duck-bob group relative flex w-28 -rotate-2 translate-y-1 flex-col items-center px-1 py-2 text-center text-white transition-all duration-300 hover:rotate-0 hover:scale-105 sm:w-48 sm:px-3 sm:py-3"
    >
      <svg
        viewBox="0 0 76 52"
        className="relative mb-1 h-[3.4rem] w-[4.5rem] overflow-visible drop-shadow-[0_6px_12px_rgba(99,102,241,0.45)] transition-transform group-hover:scale-110 sm:h-[5.25rem] sm:w-28"
      >
        <defs>
          <linearGradient id="libraryPadGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3730a3" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path
          d="M38 39 L7 35 A32 10 0 1 0 10 31 Z"
          fill="url(#libraryPadGrad)"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* A fanned stack of roadmap cards */}
        <rect
          x="20"
          y="12"
          width="20"
          height="24"
          rx="3"
          transform="rotate(-12 30 24)"
          fill="#e0e7ff"
          stroke="#4f46e5"
          strokeWidth="1.4"
        />
        <rect
          x="32"
          y="11"
          width="20"
          height="24"
          rx="3"
          transform="rotate(10 42 23)"
          fill="#fef08a"
          stroke="#4f46e5"
          strokeWidth="1.4"
        />
        <rect
          x="26"
          y="9"
          width="22"
          height="27"
          rx="3"
          fill="#ffffff"
          stroke="#4f46e5"
          strokeWidth="1.6"
        />
        <path
          d="M31 17 H43 M31 22 H43 M31 27 H38"
          stroke="#6366f1"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="relative text-sm font-extrabold tracking-tight text-white drop-shadow-sm sm:text-base">
        Browse Roadmaps
      </span>
    </button>
  );
}
