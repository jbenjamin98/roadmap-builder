export default function GuardDuck({ moodTier, isHopping, isPressedAgainstGlass }) {
  return (
    <svg
      viewBox="0 0 180 175"
      className="w-72 h-72 sm:w-80 sm:h-80 drop-shadow-[0_18px_36px_rgba(0,0,0,0.6)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Luminous Storybook Golden Feather Gradients (Matching Sun & Landing Page Ducks) */}
        <radialGradient id="guardBodyG" cx="42%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="48%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <radialGradient id="guardHeadG" cx="40%" cy="26%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="52%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <linearGradient id="guardWingG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="guardBeakG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="guardBeardG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c5132" />
          <stop offset="50%" stopColor="#5c3a21" />
          <stop offset="100%" stopColor="#29180d" />
        </linearGradient>
        <linearGradient id="guardLensG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="55%" stopColor="#bae6fd" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Ground Shadow & Dirt Trail Pebbles Under His Waddling Feet */}
      <ellipse cx="90" cy="155" rx="62" ry="10" fill="rgba(28, 25, 23, 0.38)" />
      <ellipse cx="90" cy="155" rx="42" ry="6" fill="rgba(28, 25, 23, 0.52)" />
      <circle cx="46" cy="153" r="2.2" fill="#a8a29e" opacity="0.75" />
      <circle cx="135" cy="154" r="2.5" fill="#a8a29e" opacity="0.75" />
      <circle cx="124" cy="159" r="1.6" fill="#d6d3d1" opacity="0.7" />

      {/* Little Animated Webbed Feet Waddling Underneath */}
      <g className="animate-foot-left">
        <path
          d="M68 134 L64 148 M64 148 L52 154 L60 156 L66 158 L74 155 Z"
          fill="url(#guardBeakG)"
          stroke="#7c2d12"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g className="animate-foot-right">
        <path
          d="M112 134 L116 148 M116 148 L106 155 L114 158 L120 156 L128 154 Z"
          fill="url(#guardBeakG)"
          stroke="#7c2d12"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Plump Duck Body */}
      <path
        d="M38 108 C30 82, 54 68, 90 68 C126 68, 150 82, 142 108 C136 132, 116 142, 90 142 C64 142, 44 132, 38 108 Z"
        fill="url(#guardBodyG)"
        stroke="#78350f"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Luminous Specular Shoulder & Belly Highlights */}
      <path
        d="M48 86 C60 75, 76 72, 90 72"
        stroke="rgba(255,255,255,0.62)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M62 134 C78 139, 102 139, 118 134"
        stroke="rgba(254,240,138,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* CHEST TATTOOS (ALL BLACK INK) */}
      {/* 1. Large Black Handprint on His Left Chest (Viewer's Right) */}
      <g opacity="0.88" fill="#0f172a" stroke="#0f172a" strokeLinecap="round">
        <ellipse cx="107" cy="107" rx="5.5" ry="6" transform="rotate(8 107 107)" />
        <line x1="101" y1="106" x2="96" y2="102" strokeWidth="2.2" />
        <line x1="103" y1="101" x2="100" y2="93" strokeWidth="2.1" />
        <line x1="106.5" y1="100" x2="106" y2="91" strokeWidth="2.2" />
        <line x1="110" y1="101" x2="112" y2="92.5" strokeWidth="2.1" />
        <line x1="112.5" y1="103" x2="116.5" y2="96.5" strokeWidth="1.9" />
      </g>

      {/* 2. Two Small Black Handprints on His Right Chest (Viewer's Left) */}
      <g opacity="0.88" fill="#0f172a" stroke="#0f172a" strokeLinecap="round">
        <ellipse cx="66" cy="101" rx="3" ry="3.3" transform="rotate(-10 66 101)" />
        <line x1="69" y1="100" x2="72" y2="98" strokeWidth="1.3" />
        <line x1="68" y1="98" x2="69" y2="93.5" strokeWidth="1.3" />
        <line x1="66" y1="97.5" x2="65.5" y2="92.5" strokeWidth="1.3" />
        <line x1="64" y1="98" x2="62.5" y2="93.5" strokeWidth="1.2" />
        <line x1="62.5" y1="99.5" x2="60" y2="96" strokeWidth="1.1" />

        <ellipse cx="77" cy="110" rx="2.8" ry="3.1" transform="rotate(-5 77 110)" />
        <line x1="80" y1="109" x2="82.5" y2="107" strokeWidth="1.2" />
        <line x1="78.5" y1="107" x2="79.5" y2="103" strokeWidth="1.2" />
        <line x1="77" y1="106.5" x2="76.8" y2="102" strokeWidth="1.2" />
        <line x1="75" y1="107" x2="73.8" y2="103" strokeWidth="1.1" />
        <line x1="73.8" y1="108.5" x2="71.5" y2="105.5" strokeWidth="1.1" />
      </g>

      {/* HIS RIGHT ARM / WING (Viewer's Left Wing) -> DETAILED BLACK APPLE TREE TATTOO */}
      <path
        d="M40 88 C16 84, 12 114, 34 125 C47 130, 51 103, 40 88 Z"
        fill="url(#guardWingG)"
        stroke="#78350f"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Wing Top Rim Highlight */}
      <path
        d="M36 90 C26 89, 20 96, 20 105"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <g opacity="0.92" stroke="#0f172a" fill="#0f172a">
        {/* Scalloped Leafy Tree Canopy Silhouette & Internal Foliage Linework */}
        <path
          d="M23 102 C19.5 100, 19.5 95.5, 23 94 C23.5 90, 28 88.5, 31.5 90 C34.5 88, 39 89.5, 39.5 93.5 C43 95, 43 99.5, 39.5 101.5 C38 103.5, 35 104, 32 103.5 C28.5 104, 25 103.5, 23 102 Z"
          fill="rgba(15, 23, 42, 0.28)"
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M25 95.5 Q28 93 31 95 M32.5 94 Q35.5 92 38 95"
          fill="none"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        {/* Tapered Gnarled Trunk & Flaring Roots */}
        <path
          d="M26 122 Q30 119 30.8 113 L31.2 103 L33.2 103 L33.6 113 Q34.5 119 38.5 122 M28.5 121.5 L31.8 118.5 M35.8 121.5 L32.6 118.5 M32.2 119 L32.2 122.5"
          fill="#0f172a"
          stroke="#0f172a"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Reaching Primary & Secondary Boughs */}
        <path
          d="M32 105 C29.5 102, 26.5 99.5, 24 98.5 M28.5 101 L27 96.5 M32.2 104 L32 95.5 M32.5 105 C35 102, 37.5 99.5, 40 98.5 M35.5 101 L37 96.5"
          fill="none"
          strokeWidth="1.45"
          strokeLinecap="round"
        />
        {/* Hanging Black Apples */}
        <circle cx="24.2" cy="101.2" r="1.55" />
        <circle cx="28.8" cy="98.2" r="1.45" />
        <circle cx="32.2" cy="94.2" r="1.55" />
        <circle cx="35.8" cy="98.5" r="1.45" />
        <circle cx="39.2" cy="101.2" r="1.55" />
      </g>

      {/* HIS LEFT ARM / WING (Viewer's Right Wing) -> BLACK SG-400 DOUBLE-CUTAWAY HORNS GUITAR TATTOO */}
      <path
        d="M140 88 C164 84, 168 114, 146 125 C133 130, 129 103, 140 88 Z"
        fill="url(#guardWingG)"
        stroke="#78350f"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Wing Top Rim Highlight */}
      <path
        d="M144 90 C154 89, 160 96, 160 105"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <g opacity="0.92" transform="translate(147, 106) rotate(26)" stroke="#0f172a" fill="#0f172a">
        {/* SG Clipped-Ear Open-Book Headstock */}
        <path
          d="M-1.8 -18.5 L-2.2 -13.5 L2.2 -13.5 L1.8 -18.5 L0.7 -17.9 L0 -18.6 L-0.7 -17.9 Z"
          fill="#0f172a"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {/* 3+3 Tuning Pegs */}
        <line x1="-3.3" y1="-17.5" x2="-2" y2="-17.5" strokeWidth="1" strokeLinecap="round" />
        <line x1="-3.3" y1="-16" x2="-2" y2="-16" strokeWidth="1" strokeLinecap="round" />
        <line x1="-3.3" y1="-14.5" x2="-2" y2="-14.5" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="-17.5" x2="3.3" y2="-17.5" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="-16" x2="3.3" y2="-16" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="-14.5" x2="3.3" y2="-14.5" strokeWidth="1" strokeLinecap="round" />

        {/* Guitar Neck */}
        <rect x="-1.1" y="-13.5" width="2.2" height="14.5" fill="#0f172a" />

        {/* Iconic SG-400 Symmetrical Sharp Double-Cutaway Devil Horns Body */}
        <path
          d="M -1.2 0
             C -2.5 0.5, -4.2 -1.2, -5.6 -4.2
             C -6.8 -1.2, -6.5 2.5, -4.8 4.8
             C -7.5 7.5, -7.8 13.2, -3.5 15.2
             C -1.2 16, 1.2 16, 3.5 15.2
             C 7.8 13.2, 7.5 7.5, 4.8 4.8
             C 6.5 2.5, 6.8 -1.2, 5.4 -3.6
             C 4.0 -0.8, 2.5 0.5, 1.2 0 Z"
          fill="#0f172a"
          stroke="#0f172a"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* SG Batwing Pickguard Contour */}
        <path
          d="M 1.5 1.5 C 3.8 1.2, 4.5 4.2, 3.2 7.2"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.85"
          strokeLinecap="round"
        />

        {/* Dual Humbucker Pickups */}
        <rect
          x="-2.4"
          y="1.8"
          width="4.8"
          height="2.1"
          rx="0.4"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.9"
        />
        <rect
          x="-2.4"
          y="5.1"
          width="4.8"
          height="2.1"
          rx="0.4"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.9"
        />

        {/* Tune-O-Matic Bridge & Stopbar Tailpiece */}
        <line
          x1="-2.6"
          y1="9.2"
          x2="2.6"
          y2="9.2"
          stroke="#f59e0b"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="-2.3"
          y1="11.3"
          x2="2.3"
          y2="11.3"
          stroke="#f59e0b"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* 4 SG Control Knobs on Lower Right Bout */}
        <circle cx="3.3" cy="10.2" r="0.65" fill="#f59e0b" stroke="none" />
        <circle cx="4.8" cy="11.2" r="0.65" fill="#f59e0b" stroke="none" />
        <circle cx="2.7" cy="12.4" r="0.65" fill="#f59e0b" stroke="none" />
        <circle cx="4.2" cy="13.3" r="0.65" fill="#f59e0b" stroke="none" />
      </g>

      {/* Duck Head */}
      <circle cx="90" cy="52" r="31" fill="url(#guardHeadG)" stroke="#78350f" strokeWidth="3.5" />
      {/* Luminous Specular Crown Highlight */}
      <path
        d="M70 30 Q90 21 110 30"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Textured Full Brown Beard & Sideburns Wrapping the Jaw */}
      <path
        d="M59 49 C57 62, 62 78, 73 84 C81 89, 99 89, 107 84 C118 78, 123 62, 121 49 C118 54, 114 58, 109 61 C102 66, 78 66, 71 61 C66 58, 62 54, 59 49 Z"
        fill="url(#guardBeardG)"
        stroke="#29180d"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M64 56 C70 62, 80 65, 90 65 C100 65, 110 62, 116 56"
        stroke="#9a6b47"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M72 72 Q76 80 80 83 M90 73 L90 85 M108 72 Q104 80 100 83 M82 74 Q85 82 86 85 M98 74 Q95 82 94 85"
        stroke="#3d2412"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Expressive Eyes Behind Glasses */}
      <circle cx="74" cy="44" r="4.2" fill="#0f172a" />
      <circle cx="75.4" cy="42.4" r="1.6" fill="#ffffff" />
      <circle cx="72.8" cy="45.4" r="0.8" fill="#ffffff" opacity="0.8" />
      <circle cx="106" cy="44" r="4.2" fill="#0f172a" />
      <circle cx="107.4" cy="42.4" r="1.6" fill="#ffffff" />
      <circle cx="104.8" cy="45.4" r="0.8" fill="#ffffff" opacity="0.8" />

      {/* 4. Dynamic Mood Eyebrows Above His Glasses */}
      {moodTier === 'smooshed' && (
        /* Furrowed comic frustration eyebrows when smooshed */
        <g stroke="#29180d" strokeWidth="2.8" strokeLinecap="round">
          <line x1="65" y1="31" x2="82" y2="35.5" />
          <line x1="115" y1="31" x2="98" y2="35.5" />
        </g>
      )}
      {moodTier === 'mid' && (
        /* Determined raised eyebrows when mid-sized */
        <g stroke="#29180d" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M65 33 Q74 30 82 33.5" />
          <path d="M98 33.5 Q106 30 115 33" />
        </g>
      )}
      {moodTier === 'close' && (
        /* Happy arched eyebrows when almost at 1920px */
        <g stroke="#29180d" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M65 34 Q74 28 82 33" />
          <path d="M98 33 Q106 28 115 34" />
        </g>
      )}

      {/* Round Angled Glasses */}
      <g>
        <line
          x1="57"
          y1="42"
          x2="62"
          y2="43"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="123"
          y1="42"
          x2="118"
          y2="43"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Left Round-Angled Lens Frame */}
        <path
          d="M62 39 L72 34 L85 38 C87 45, 84 54, 74 54 C64 54, 60 46, 62 39 Z"
          fill="url(#guardLensG)"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Right Round-Angled Lens Frame */}
        <path
          d="M118 39 L108 34 L95 38 C93 45, 96 54, 106 54 C116 54, 120 46, 118 39 Z"
          fill="url(#guardLensG)"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Bridge */}
        <path d="M85 40 Q90 37 95 40" stroke="#1e293b" strokeWidth="3.2" strokeLinecap="round" />

        {/* Specular Lens Glare */}
        <line
          x1="65.5"
          y1="39.5"
          x2="70"
          y2="48.5"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1="99.5"
          y1="39.5"
          x2="104"
          y2="48.5"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Fogged Breath Condensation Ring on the Glass around his Beak when Smooshed */}
      {isPressedAgainstGlass && (
        <g opacity={isHopping ? '0.52' : '0.32'} style={{ transition: 'opacity 250ms ease' }}>
          <ellipse
            cx="90"
            cy="60"
            rx={isHopping ? '30' : '25'}
            ry={isHopping ? '14' : '11.5'}
            fill="rgba(255, 255, 255, 0.45)"
          />
          <ellipse cx="90" cy="60" rx="18" ry="8" fill="rgba(255, 255, 255, 0.35)" />
        </g>
      )}

      {/* Duck Beak (Smooshed wide & flat when pressed against the screen glass!) */}
      <g
        style={{
          transform: isPressedAgainstGlass ? 'scaleX(1.26) scaleY(0.84)' : 'scale(1)',
          transformOrigin: '90px 58px',
          transition: 'transform 150ms ease',
        }}
      >
        <path
          d="M71 55 C79 49, 101 49, 109 55 C113 60, 106 67, 90 67 C74 67, 67 60, 71 55 Z"
          fill="url(#guardBeakG)"
          stroke="#7c2d12"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path
          d="M77 61 C83 68, 97 68, 103 61"
          fill="#ef4444"
          stroke="#7c2d12"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Beak Top Specular Shine */}
        <path
          d="M78 53.5 Q90 50.5 102 53.5"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Smooshed Beak-Against-Glass Flat Contact Highlight */}
        {isPressedAgainstGlass && (
          <ellipse cx="90" cy="57.5" rx="11" ry="2.6" fill="rgba(255, 255, 255, 0.48)" />
        )}
      </g>
    </svg>
  );
}
