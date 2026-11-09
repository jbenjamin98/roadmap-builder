export default function DuckSvg({ duck }) {
  const { palette, hat, eyewear, accessory, isLeader } = duck;
  const uid = duck.id;
  const rim = palette.stroke || '#78350f';

  return (
    <svg
      viewBox="0 0 68 64"
      style={{
        // Ducks shrink on shorter screens. The landing scene never gets shorter than 720px, so the
        // size is based on max(window height, 720px) and reaches full size around 1000px tall.
        width: isLeader
          ? 'clamp(72px, calc(max(100vh, 720px) * 0.115), 124px)'
          : 'clamp(62px, calc(max(100vh, 720px) * 0.105), 104px)',
        height: 'auto',
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      <defs>
        <radialGradient id={`bodyG-${uid}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor={palette.head} />
          <stop offset="55%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.bodyShade || palette.wing} />
        </radialGradient>
        <radialGradient id={`headG-${uid}`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="30%" stopColor={palette.head} />
          <stop offset="100%" stopColor={palette.body} />
        </radialGradient>
        <linearGradient id={`wingG-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.wing} />
          <stop offset="100%" stopColor={palette.bodyShade || palette.wing} />
        </linearGradient>
        <linearGradient id={`beakG-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor={palette.beak} />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>

      {/* Luminous Water Wake Ripple Ring Around Duck */}
      <ellipse
        cx="32"
        cy="54"
        rx={isLeader ? '27' : '23'}
        ry="6"
        fill="rgba(224, 242, 254, 0.18)"
        stroke="rgba(255, 255, 255, 0.55)"
        strokeWidth="1.1"
      />
      <ellipse
        cx="32"
        cy="54"
        rx={isLeader ? '20' : '16.5'}
        ry="3.8"
        fill="rgba(56, 189, 248, 0.42)"
      />

      {/* Illustrated Duck Body with Radial Shading */}
      <path
        d="M12 41 C10 32, 18 28, 30 30 C37 31, 45 29, 48 23 C50 30, 52 41, 45 49 C38 55, 20 55, 14 48 C12 46, 12 43, 12 41 Z"
        fill={`url(#bodyG-${uid})`}
        stroke={rim}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Specular Back Highlight */}
      <path
        d="M15 35 C20 31, 28 31, 35 32"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Body Patterns */}
      {palette.pattern === 'tuxedo' && (
        <path
          d="M34 31 C42 31, 47 36, 45 46 C41 51, 33 50, 32 43 Z"
          fill="#f8fafc"
          stroke={rim}
          strokeWidth="1.3"
        />
      )}
      {palette.pattern === 'mallard' && (
        <path
          d="M33 27 C37 29, 44 29, 47 26"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}
      {palette.pattern === 'dots' && (
        <g fill="rgba(255,255,255,0.75)">
          <circle cx="20" cy="39" r="2" />
          <circle cx="27" cy="46" r="1.8" />
          <circle cx="17" cy="45" r="1.5" />
        </g>
      )}
      {palette.pattern === 'stripes' && (
        <g stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round">
          <path d="M16 37 L26 35" />
          <path d="M15 42 L25 40" />
        </g>
      )}
      {palette.pattern === 'stars' && (
        <g fill="#fef08a">
          <path d="M19 35 L20 37.5 L22.5 38.5 L20 39.5 L19 42 L18 39.5 L15.5 38.5 L18 37.5 Z" />
          <circle cx="26" cy="46" r="1.5" />
          <circle cx="39" cy="44" r="1.6" />
        </g>
      )}

      {/* Illustrated Duck Head */}
      <circle cx="42" cy="22" r="10.5" fill={palette.head} stroke={rim} strokeWidth="1.8" />
      <circle cx="42" cy="22" r="10" fill={`url(#headG-${uid})`} />
      {/* Head Rim Highlight */}
      <path
        d="M35 16 A 8.5 8.5 0 0 1 46 14.5"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Rosy Cheek Glow */}
      <circle cx="44.5" cy="25.5" r="2.4" fill="#fb7185" opacity="0.7" />

      {/* Duck Beak with Warm Gradient & Highlight */}
      <path
        d="M51 20.5 C57 20, 61 22.5, 58.5 25 C56.5 27, 51 26, 51 26 Z"
        fill={`url(#beakG-${uid})`}
        stroke="#9a3412"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M52.5 21.6 Q55.5 21.4 57.2 22.6"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Expressive Duck Eye */}
      {eyewear !== 'sunglasses' && eyewear !== 'starshades' && eyewear !== 'eyepatch' && (
        <g>
          <circle cx="45" cy="20" r="2.3" fill="#1e293b" />
          <circle cx="45.8" cy="19.2" r="0.85" fill="#ffffff" />
          <circle cx="44.3" cy="20.8" r="0.4" fill="#ffffff" />
        </g>
      )}

      {/* Eyewear */}
      {eyewear === 'sunglasses' && (
        <g>
          <rect
            x="41"
            y="17.5"
            width="9"
            height="5"
            rx="1.5"
            fill="#0f172a"
            stroke="#fde047"
            strokeWidth="1.1"
          />
          <line
            x1="42.5"
            y1="18.5"
            x2="44.5"
            y2="21.5"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line x1="34" y1="19" x2="41" y2="19" stroke="#0f172a" strokeWidth="1.6" />
        </g>
      )}
      {eyewear === 'roundglasses' && (
        <g>
          <circle
            cx="45.5"
            cy="20"
            r="3.6"
            fill="rgba(255,255,255,0.25)"
            stroke="#451a03"
            strokeWidth="1.5"
          />
          <line x1="36" y1="20" x2="41.9" y2="20" stroke="#451a03" strokeWidth="1.3" />
        </g>
      )}
      {eyewear === 'monocle' && (
        <g>
          <circle
            cx="45.5"
            cy="20"
            r="3.8"
            fill="rgba(253, 224, 71, 0.22)"
            stroke="#fbbf24"
            strokeWidth="1.6"
          />
          <path d="M45.5 23.8 Q44 30 41 33" stroke="#fbbf24" strokeWidth="1.2" />
        </g>
      )}
      {eyewear === 'starshades' && (
        <g>
          <polygon
            points="45.5,15.5 47,18.5 50.5,19 48,21.2 48.6,24.5 45.5,22.8 42.4,24.5 43,21.2 40.5,19 44,18.5"
            fill="#ec4899"
            stroke="#fef08a"
            strokeWidth="1.2"
          />
        </g>
      )}
      {eyewear === 'eyepatch' && (
        <g>
          <circle cx="45.5" cy="20" r="3.2" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
          <line x1="34" y1="16" x2="51" y2="22" stroke="#1e293b" strokeWidth="1.6" />
        </g>
      )}

      {/* Folded Wing with Gradient & Feather Detail */}
      <path
        d="M21 37 C27 34, 36 36, 36 42 C36 46, 27 48, 20 44 C18 42, 19 38, 21 37 Z"
        fill={`url(#wingG-${uid})`}
        stroke={rim}
        strokeWidth="1.6"
        strokeLinecap="round"
        className={duck.flying ? 'duck-wing-flap' : undefined}
      />
      <path
        d="M23 39 Q29 37.5 33 40.5"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Neck Accessories */}
      {accessory === 'bowtie' && (
        <g>
          <polygon points="39,29 44,32 39,35" fill="#f43f5e" stroke="#881337" strokeWidth="1.1" />
          <polygon points="49,29 44,32 49,35" fill="#f43f5e" stroke="#881337" strokeWidth="1.1" />
          <circle cx="44" cy="32" r="1.6" fill="#fda4af" stroke="#881337" strokeWidth="1" />
        </g>
      )}
      {accessory === 'scarf' && (
        <g>
          <path d="M33 28 Q42 33 49 29" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M36 30 L34 39" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
          <path d="M34 28 Q42 32 48 28.5" stroke="#fca5a5" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}
      {accessory === 'chain' && (
        <path
          d="M34 29 Q42 35 48 29"
          stroke="#fde047"
          strokeWidth="2.5"
          strokeDasharray="2 2"
          strokeLinecap="round"
        />
      )}
      {accessory === 'bandana' && (
        <polygon points="35,28 49,28 43,36" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.3" />
      )}

      {/* Hats & Headgear */}
      {hat === 'captain' && (
        <g>
          <path d="M33 13 C35 7, 47 7, 49 13 Z" fill="#4f46e5" stroke="#1e1b4b" strokeWidth="1.6" />
          <path d="M31 13 L53 13" stroke="#1e1b4b" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="41.5" cy="8.5" r="1.8" fill="#fde047" stroke="#b45309" strokeWidth="0.6" />
        </g>
      )}
      {hat === 'crown' && (
        <polygon
          points="34,13 35,5 39,10 42,4 45,10 49,5 50,13"
          fill="#fde047"
          stroke="#b45309"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {hat === 'wizard' && (
        <g>
          <polygon
            points="32,14 42,1 51,14"
            fill="#9333ea"
            stroke="#3b0764"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M29 14 L54 14" stroke="#3b0764" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="42" cy="9" r="1.5" fill="#fef08a" />
        </g>
      )}
      {hat === 'tophat' && (
        <g>
          <rect
            x="35"
            y="3"
            width="13"
            height="10"
            rx="1.5"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="1.6"
          />
          <rect x="35" y="10" width="13" height="2.5" fill="#f43f5e" />
          <path d="M31 13 L52 13" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}
      {hat === 'cowboy' && (
        <g>
          <path
            d="M34 13 C35 6, 40 8, 42 6 C44 8, 48 6, 49 13 Z"
            fill="#d97706"
            stroke="#78350f"
            strokeWidth="1.6"
          />
          <path d="M29 12 Q42 16 54 12" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
      {hat === 'party' && (
        <g>
          <polygon
            points="36,13 42,2 48,13"
            fill="#f472b6"
            stroke="#831843"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="42" cy="2" r="2.2" fill="#fef08a" />
        </g>
      )}
      {hat === 'viking' && (
        <g>
          <path
            d="M34 14 C31 8, 30 5, 33 4 C34 8, 36 10, 37 12"
            fill="#fef9c3"
            stroke="#78350f"
            strokeWidth="1.4"
          />
          <path
            d="M49 14 C52 8, 53 5, 50 4 C49 8, 47 10, 46 12"
            fill="#fef9c3"
            stroke="#78350f"
            strokeWidth="1.4"
          />
          <path d="M34 13 C35 7, 48 7, 49 13 Z" fill="#94a3b8" stroke="#334155" strokeWidth="1.6" />
        </g>
      )}
      {hat === 'chef' && (
        <g>
          <path
            d="M34 13 C31 9, 34 4, 38 6 C40 3, 45 3, 46 6 C50 4, 52 9, 49 13 Z"
            fill="#ffffff"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      )}
      {hat === 'pirate' && (
        <g>
          <path d="M31 14 C35 6, 48 6, 53 14 Z" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.4" />
          <circle cx="42" cy="11" r="1.8" fill="#fef08a" />
        </g>
      )}
      {hat === 'propeller' && (
        <g>
          <path d="M34 13 C35 8, 48 8, 49 13 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
          <line x1="41.5" y1="8" x2="41.5" y2="4" stroke="#0369a1" strokeWidth="1.8" />
          <ellipse
            cx="41.5"
            cy="4"
            rx="6"
            ry="1.6"
            fill="#fb7185"
            stroke="#881337"
            strokeWidth="1.1"
          />
        </g>
      )}
      {hat === 'halo' && (
        <ellipse cx="42" cy="6" rx="8" ry="2.3" fill="none" stroke="#fef08a" strokeWidth="2.4" />
      )}
      {hat === 'mohawk' && (
        <path
          d="M35 13 L33 5 L38 10 L41 3 L44 10 L49 5 L47 13 Z"
          fill="#f472b6"
          stroke="#9d174d"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      )}
      {hat === 'beret' && (
        <path
          d="M32 13 C31 7, 46 6, 50 11 C46 13, 36 13, 32 13 Z"
          fill="#f43f5e"
          stroke="#881337"
          strokeWidth="1.5"
        />
      )}
      {hat === 'headband' && (
        <g>
          <path d="M32 14 L51 14" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
          <path
            d="M32 14 L26 11 M32 14 L27 17"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}
      {hat === 'flower' && (
        <g id={`fl-${uid}`}>
          <circle cx="38" cy="10" r="3" fill="#f9a8d4" stroke="#be185d" strokeWidth="1.1" />
          <circle cx="42" cy="10" r="3" fill="#f9a8d4" stroke="#be185d" strokeWidth="1.1" />
          <circle cx="40" cy="7.5" r="3" fill="#f9a8d4" stroke="#be185d" strokeWidth="1.1" />
          <circle cx="40" cy="9.5" r="1.6" fill="#fef08a" />
        </g>
      )}
    </svg>
  );
}
