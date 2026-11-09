export default function HorizonScene({ isDark }) {
  return (
    <div className="relative w-full h-[clamp(3.5rem,calc(max(100vh,720px)*0.09),5rem)] shrink-0 pointer-events-none select-none z-10 -mb-1">
      {/* Distant Mountain Ranges behind the hills */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-10 w-full h-28"
      >
        <path
          d="M0,120 L0,78 L120,40 L200,66 L330,18 L430,60 L520,38 L640,72 L760,30 L880,66 L1010,22 L1120,64 L1230,40 L1340,70 L1440,48 L1440,120 Z"
          fill={isDark ? '#334155' : '#a5b4fc'}
          opacity="0.85"
        />
        <g fill="#ffffff" opacity={isDark ? '0.7' : '0.9'}>
          <path d="M330,18 L305,40 L322,36 L330,44 L342,35 L356,40 Z" />
          <path d="M760,30 L738,50 L752,47 L760,54 L772,46 L784,50 Z" />
          <path d="M1010,22 L988,43 L1002,40 L1010,48 L1022,39 L1034,43 Z" />
          <path d="M120,40 L102,56 L114,54 L120,60 L130,53 L138,56 Z" />
        </g>
        <path
          d="M0,120 L0,96 L90,70 L170,92 L280,58 L390,96 L520,74 L640,100 L760,62 L890,98 L1000,72 L1130,100 L1260,66 L1360,92 L1440,80 L1440,120 Z"
          fill={isDark ? '#1e293b' : '#6366f1'}
          opacity="0.8"
        />
        <g fill="#ffffff" opacity={isDark ? '0.6' : '0.85'}>
          <path d="M280,58 L262,74 L274,72 L280,78 L290,71 L298,74 Z" />
          <path d="M760,62 L744,76 L754,74 L760,80 L768,73 L776,76 Z" />
          <path d="M1260,66 L1244,80 L1254,78 L1260,84 L1268,77 L1276,80 Z" />
        </g>
      </svg>
      <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-transparent via-white/25 to-sky-400/70 dark:via-indigo-950/60 dark:to-sky-900/85 backdrop-blur-[2px]" />

      <svg
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 w-full h-24 overflow-visible"
      >
        <defs>
          <linearGradient id="farHillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#312e81' : '#34d399'} stopOpacity="0.65" />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#059669'} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="nearHillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#065f46' : '#10b981'} stopOpacity="0.78" />
            <stop offset="100%" stopColor={isDark ? '#022c22' : '#047857'} stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="waveMidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#0284c7' : '#bae6fd'} stopOpacity="0.75" />
            <stop offset="100%" stopColor={isDark ? '#0c4a6e' : '#38bdf8'} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Distant Frosted Rolling Meadow Hills */}
        <path
          d="M0,62 C220,18 460,68 740,36 C1020,8 1240,56 1440,28 L1440,110 L0,110 Z"
          fill="url(#farHillGrad)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
        />

        {/* Closer Translucent Shoreline Banks */}
        <path
          d="M0,70 C280,42 540,82 840,52 C1100,26 1280,68 1440,48 L1440,110 L0,110 Z"
          fill="url(#nearHillGrad)"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.5"
        />

        {/* Shoreline Cattails & Reeds with Glass Rim Highlights */}
        <g
          stroke={isDark ? '#34d399' : '#064e3b'}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.85"
        >
          <line x1="120" y1="74" x2="115" y2="42" />
          <line x1="132" y1="76" x2="134" y2="48" />
          <line x1="1310" y1="70" x2="1306" y2="38" />
          <line x1="1322" y1="72" x2="1326" y2="44" />
        </g>
        <g fill="#78350f" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8">
          <ellipse cx="116" cy="48" rx="2.5" ry="6" transform="rotate(-8 116 48)" />
          <ellipse cx="133" cy="53" rx="2.2" ry="5.5" transform="rotate(6 133 53)" />
          <ellipse cx="1307" cy="44" rx="2.5" ry="6" transform="rotate(-6 1307 44)" />
          <ellipse cx="1325" cy="49" rx="2.2" ry="5.5" transform="rotate(8 1325 49)" />
        </g>

        {/* Back Shimmering Sea-Glass Water Wave */}
        <path
          d="M0,66 C200,90 440,44 720,70 C1000,92 1220,48 1440,68 L1440,110 L0,110 Z"
          fill="url(#waveMidGrad)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
          className="animate-wave-slow"
        />

        {/* Front Pond Waterline Wave */}
        <path
          d="M0,80 C260,54 520,96 820,72 C1100,50 1300,88 1440,74 L1440,110 L0,110 Z"
          className="fill-sky-400 dark:fill-sky-900"
        />
        {/* Luminous Specular Glass Shoreline Highlight */}
        <path
          d="M0,80 C260,54 520,96 820,72 C1100,50 1300,88 1440,74"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
