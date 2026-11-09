/**
 * The shore at the bottom of the pond: a peninsula with the egg nest (click to hatch a duck) It is the last child of
 * the pond pane and pinned to its bottom edge (`mt-auto`), so it always sits on the screen edge.
 */
export default function ShoreIsland({ onHatchEgg, isEggHatching }) {
  return (
    <div
      data-testid="shore-island"
      className="relative z-20 w-full shrink-0 h-[clamp(5.5rem,calc(max(100vh,720px)*0.13),11rem)] pointer-events-none select-none"
    >
      <svg
        viewBox="0 0 1440 176"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="shoreSandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="shoreGrassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="55%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        <path
          d="M90 176 C300 170 420 70 580 66 L860 66 C1020 70 1140 170 1350 176 Z"
          fill="rgba(224,242,254,0.2)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
        />
        <path
          d="M170 176 C340 172 440 90 590 86 L850 86 C1000 90 1100 172 1270 176 Z"
          fill="url(#shoreSandGrad)"
          stroke="#92400e"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M230 176 C380 174 470 106 600 102 L840 102 C970 106 1060 174 1210 176 Z"
          fill="url(#shoreGrassGrad)"
          stroke="#14532d"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M440 144 Q520 110 640 106 L800 106"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <g stroke="#15803d" strokeWidth="3" strokeLinecap="round">
          <path d="M350 170 Q344 132 352 102 M372 172 Q372 140 368 114 M1090 170 Q1096 132 1088 104 M1068 172 Q1068 142 1072 118" />
        </g>
        <g fill="#78350f" stroke="#451a03" strokeWidth="1">
          <ellipse cx="352" cy="106" rx="4" ry="11" />
          <ellipse cx="368" cy="118" rx="3.6" ry="9" />
          <ellipse cx="1088" cy="108" rx="4" ry="11" />
          <ellipse cx="1072" cy="122" rx="3.6" ry="9" />
        </g>
        <circle cx="470" cy="156" r="3.5" fill="#f472b6" />
        <circle cx="520" cy="166" r="3" fill="#fde047" />
        <circle cx="990" cy="160" r="3.5" fill="#f472b6" />
        <circle cx="940" cy="168" r="3" fill="#c084fc" />
        <circle cx="1030" cy="170" r="3.5" fill="#fbbf24" />
        <circle cx="760" cy="168" r="3" fill="#c084fc" />
        <ellipse cx="660" cy="166" rx="6" ry="3" fill="#a8a29e" />
        <ellipse cx="800" cy="168" rx="5" ry="2.6" fill="#d6d3d1" />
      </svg>

      <div className="pointer-events-auto absolute inset-0">
        <button
          type="button"
          onClick={onHatchEgg}
          data-testid="hatch-egg-btn"
          aria-label="Hatch a new duck"
          className="group absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-3 z-10 focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
          title="Click the egg to hatch another duck into the pond!"
        >
          <svg
            viewBox="12 14 96 80"
            className="h-[clamp(4.25rem,calc(max(100vh,720px)*0.105),6.25rem)] w-auto overflow-visible drop-shadow-[0_10px_18px_rgba(15,23,42,0.35)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="eggShellGrad" cx="36%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="45%" stopColor="#fef9c3" stopOpacity="0.96" />
                <stop offset="85%" stopColor="#fde047" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
              </radialGradient>
              <linearGradient id="twigNestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.98" />
              </linearGradient>
              <radialGradient id="eggGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ellipse
              cx="60"
              cy="74"
              rx="34"
              ry="11"
              fill="#92400e"
              stroke="#451a03"
              strokeWidth="1.4"
            />
            <path
              d="M28 72 Q60 60 92 72 M31 68 Q60 58 89 68"
              stroke="#d97706"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <ellipse cx="60" cy="73" rx="27" ry="7.5" fill="#451a03" opacity="0.85" />

            <circle
              cx="60"
              cy="50"
              r="30"
              fill="url(#eggGlowGrad)"
              className={isEggHatching ? 'egg-burst' : 'animate-pulse'}
            />

            <g
              className={isEggHatching ? 'animate-egg-wobble' : 'animate-duck-bob'}
              style={{ transformOrigin: '60px 72px' }}
            >
              <path
                d="M60 22 C47 22, 41 46, 44 62 C46 74, 74 74, 76 62 C79 46, 73 22, 60 22 Z"
                fill="url(#eggShellGrad)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
              />
              <path
                d="M52 29 C49 36, 48 44, 49 50"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="55" cy="36" r="1.8" fill="#d97706" opacity="0.65" />
              <circle cx="66" cy="42" r="2.2" fill="#d97706" opacity="0.55" />
              <circle cx="57" cy="52" r="1.5" fill="#b45309" opacity="0.6" />
              <circle cx="67" cy="32" r="1.3" fill="#b45309" opacity="0.6" />
              <circle cx="63" cy="60" r="1.6" fill="#b45309" opacity="0.5" />
              {isEggHatching && (
                <g>
                  <path
                    className="egg-crack"
                    pathLength="100"
                    d="M45 46 L54 41 L59 50 L66 42 L75 47"
                    stroke="#78350f"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    className="egg-crack"
                    pathLength="100"
                    style={{ animationDelay: '0.25s' }}
                    d="M59 50 L57 60 M66 42 L68 32 M54 41 L52 31"
                    stroke="#78350f"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}
            </g>

            <path
              d="M26 73 C28 90, 92 90, 94 73 C86 82, 34 82, 26 73 Z"
              fill="url(#twigNestGrad)"
              stroke="#451a03"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <g strokeLinecap="round" fill="none">
              <path d="M28 75 Q60 87 92 75" stroke="#78350f" strokeWidth="1.8" />
              <path d="M31 79 Q60 89 89 79" stroke="#b45309" strokeWidth="1.6" />
              <path
                d="M34 76 L48 83 M46 80 L66 85 M64 84 L84 77 M40 81 L56 86"
                stroke="#fde68a"
                strokeWidth="1.2"
                opacity="0.9"
              />
              <path
                d="M26 72 L19 66 M27 76 L18 77 M94 72 L101 66 M93 76 L102 78"
                stroke="#92400e"
                strokeWidth="2"
              />
              <path
                d="M84 72 Q91 64 96 59 Q91 68 86 75 Z"
                stroke="#ffffff"
                strokeWidth="0.8"
                fill="rgba(255,255,255,0.85)"
              />
            </g>

            {isEggHatching && (
              <circle
                className="egg-burst"
                cx="60"
                cy="52"
                r="28"
                fill="rgba(255,251,200,0.85)"
                style={{ transformOrigin: '60px 52px' }}
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
