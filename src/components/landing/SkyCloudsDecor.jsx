export default function SkyCloudsDecor() {
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 w-full h-[max(26vh,11.5rem)]"
    >
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="cloudSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Dark Mode Twinkling Vector Star Constellations */}
      <g className="hidden dark:block">
        <path
          d="M210 38 L213 46 L221 49 L213 52 L210 60 L207 52 L199 49 L207 46 Z"
          fill="#fef08a"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="0.8"
          opacity="0.9"
        />
        <path
          d="M580 26 L582 32 L588 34 L582 36 L580 42 L578 36 L572 34 L578 32 Z"
          fill="#c7d2fe"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="0.8"
          opacity="0.85"
        />
        <path
          d="M980 44 L983 51 L990 54 L983 57 L980 64 L977 57 L970 54 L977 51 Z"
          fill="#fde047"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="0.8"
          opacity="0.85"
        />
        <circle cx="360" cy="68" r="2.2" fill="#ffffff" opacity="0.75" />
        <circle cx="760" cy="52" r="2.4" fill="#fef08a" opacity="0.8" />
        <circle cx="1140" cy="36" r="2" fill="#a5b4fc" opacity="0.85" />
      </g>

      {/* Light Mode Frosted Glass Clouds */}
      <g className="dark:hidden">
        <path
          d="M190 95 C175 95, 165 82, 175 70 C178 52, 202 46, 218 56 C230 40, 260 42, 270 60 C288 60, 296 76, 285 90 C280 95, 200 95, 190 95 Z"
          fill="url(#cloudGrad)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
        />
        <path
          d="M185 68 C196 54, 212 52, 222 59 C232 45, 255 46, 264 59"
          fill="none"
          stroke="url(#cloudSheen)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M780 82 C765 82, 756 70, 766 58 C770 42, 794 36, 810 46 C824 30, 855 32, 865 50 C882 50, 890 66, 878 78 C870 82, 790 82, 780 82 Z"
          fill="url(#cloudGrad)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
        />
        <path
          d="M775 56 C786 43, 804 41, 814 48 C826 35, 848 36, 858 49"
          fill="none"
          stroke="url(#cloudSheen)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
