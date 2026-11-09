export default function CelestialThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-testid="celestial-theme-toggle"
      style={{
        // Sized from the locked scene height so it stays high in the sky on short windows.
        width: 'clamp(4.5rem, calc(max(100vh,720px)*0.115), 6rem)',
        height: 'clamp(4.5rem, calc(max(100vh,720px)*0.115), 6rem)',
        top: 'clamp(0.4rem, calc(max(100vh,720px)*0.008), 1.5rem)',
      }}
      className="flex absolute right-3 sm:right-6 xl:right-10 z-30 group items-center justify-center rounded-full focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95"
      title={
        isDark ? 'Click the Moon to switch to Light Mode' : 'Click the Sun to switch to Dark Mode'
      }
    >
      {isDark ? (
        /* Sculpted Glassmorphic Crescent Moon with Lunar Craters & Twinkling Stars */
        <div className="relative h-full w-full flex items-center justify-center drop-shadow-[0_0_24px_rgba(253,224,71,0.65)]">
          <svg
            viewBox="0 0 88 88"
            className="h-full w-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="moonGrad"
                x1="16"
                y1="12"
                x2="68"
                y2="74"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                <stop offset="35%" stopColor="#fef9c3" stopOpacity="0.92" />
                <stop offset="75%" stopColor="#fde047" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.95" />
              </linearGradient>
              <radialGradient id="moonCraterGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.2" />
              </radialGradient>
            </defs>
            <circle
              cx="44"
              cy="44"
              r="32"
              fill="rgba(129, 140, 248, 0.16)"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1"
            />
            <path
              d="M 52 14 A 30 30 0 1 0 74 56 A 23 23 0 1 1 52 14 Z"
              fill="url(#moonGrad)"
              stroke="rgba(255, 255, 255, 0.88)"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Specular Glass Rim Along Outer Crescent */}
            <path
              d="M 38 18 A 27 27 0 0 0 21 46"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle
              cx="31"
              cy="40"
              r="3.8"
              fill="url(#moonCraterGrad)"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="0.7"
            />
            <circle
              cx="36"
              cy="54"
              r="5"
              fill="url(#moonCraterGrad)"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="0.7"
            />
            <circle cx="27" cy="51" r="2.3" fill="url(#moonCraterGrad)" />
            <circle
              cx="48"
              cy="64"
              r="3.1"
              fill="url(#moonCraterGrad)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.6"
            />
            <path
              d="M62 22 L64 27 L69 29 L64 31 L62 36 L60 31 L55 29 L60 27 Z"
              fill="#fef9c3"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="0.6"
              className="animate-pulse"
            />
            <path
              d="M50 37 L51.2 40.2 L54.4 41.4 L51.2 42.6 L50 45.8 L48.8 42.6 L45.6 41.4 L48.8 40.2 Z"
              fill="#fde047"
            />
            <circle cx="68" cy="43" r="1.8" fill="#fef08a" />
          </svg>
        </div>
      ) : (
        /* Sculpted Glassmorphic Radiant Sun with 16 Solar Rays & Luminous Core */
        <div className="relative h-full w-full flex items-center justify-center drop-shadow-[0_0_28px_rgba(251,191,36,0.85)]">
          <svg
            viewBox="0 0 88 88"
            className="h-full w-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="sunCoreGrad" cx="36%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="30%" stopColor="#fef9c3" stopOpacity="0.95" />
                <stop offset="68%" stopColor="#facc15" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.96" />
              </radialGradient>
            </defs>
            <circle
              cx="44"
              cy="44"
              r="34"
              fill="rgba(254, 240, 138, 0.25)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
            />
            <g className="origin-center group-hover:rotate-45 transition-transform duration-700">
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = i * 22.5;
                const isLong = i % 2 === 0;
                return (
                  <polygon
                    key={angle}
                    points={isLong ? '44,3 40.2,19 47.8,19' : '44,9 41.2,19.5 46.8,19.5'}
                    fill={isLong ? 'rgba(251, 191, 36, 0.92)' : 'rgba(253, 224, 71, 0.85)'}
                    stroke="rgba(255, 255, 255, 0.78)"
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                    transform={`rotate(${angle} 44 44)`}
                  />
                );
              })}
            </g>
            <circle
              cx="44"
              cy="44"
              r="21"
              fill="url(#sunCoreGrad)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2"
            />
            <path
              d="M 30 34 A 16 16 0 0 1 53 29"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3.5 right-1/2 translate-x-1/2 whitespace-nowrap px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide backdrop-blur-md bg-white/80 dark:bg-slate-900/85 text-slate-900 dark:text-indigo-200 border border-white/70 dark:border-indigo-400/40 shadow-lg">
        {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </span>
    </button>
  );
}
