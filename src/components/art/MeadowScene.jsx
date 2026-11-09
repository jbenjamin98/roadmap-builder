export default function MeadowScene() {
  return (
    <svg
      viewBox="0 0 1200 900"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        {/* Distant & Mid-Ground Rolling Hill Gradients */}
        <linearGradient id="farHillGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="meadowGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.92" />
          <stop offset="35%" stopColor="#059669" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="1" />
        </linearGradient>
        {/* Illustrated Pine & Oak Tree Gradients */}
        <linearGradient id="treeCanopyGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        {/* 3D Winding Dirt & Sandy Trail Gradients */}
        <linearGradient id="trailMainGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="trailInnerGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
        </linearGradient>
        {/* 3D Stepping Stones Gradient */}
        <linearGradient id="stoneGradGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="60%" stopColor="#a8a29e" />
          <stop offset="100%" stopColor="#57534e" />
        </linearGradient>
        {/* Distant Pond Gradients */}
        <linearGradient id="pondShoreGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="pondWaterGuard" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="65%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>

      {/* Distant Left & Right Rolling Hills on the Horizon */}
      <path
        d="M0,70 C180,10 410,30 600,68 C790,30 1020,10 1200,70 L1200,900 L0,900 Z"
        fill="url(#farHillGuard)"
        className="dark:opacity-65"
      />
      <path
        d="M0,70 C180,10 410,30 600,68 C790,30 1020,10 1200,70"
        stroke="rgba(167,243,208,0.45)"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Illustrated Pine & Oak Trees Flanking the Trailhead */}
      <g className="dark:opacity-75">
        {/* Left Horizon Trees */}
        <rect x="382" y="54" width="6" height="16" rx="2" fill="#78350f" />
        <circle
          cx="385"
          cy="40"
          r="22"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.8"
        />
        <path
          d="M372,30 C378,22 390,22 396,28"
          stroke="#6ee7b7"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />

        <rect x="405" y="56" width="5" height="14" rx="1.5" fill="#78350f" />
        <circle
          cx="408"
          cy="46"
          r="18"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.6"
        />

        <polygon
          points="440,58 454,16 468,58"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <polygon
          points="472,62 484,24 496,62"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Right Horizon Trees */}
        <polygon
          points="732,58 746,16 760,58"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <polygon
          points="704,62 716,24 728,62"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <rect x="789" y="56" width="5" height="14" rx="1.5" fill="#78350f" />
        <circle
          cx="792"
          cy="46"
          r="18"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.6"
        />

        <rect x="812" y="54" width="6" height="16" rx="2" fill="#78350f" />
        <circle
          cx="815"
          cy="40"
          r="22"
          fill="url(#treeCanopyGuard)"
          stroke="#064e3b"
          strokeWidth="1.8"
        />
        <path
          d="M802,30 C808,22 820,22 826,28"
          stroke="#6ee7b7"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </g>

      {/* Mid-Ground Lush Meadow Grass Slopes */}
      <path
        d="M0,110 C250,65 440,85 600,72 C760,85 950,65 1200,110 L1200,900 L0,900 Z"
        fill="url(#meadowGuard)"
        className="dark:opacity-75"
      />
      <path
        d="M0,110 C250,65 440,85 600,72 C760,85 950,65 1200,110"
        stroke="rgba(110,231,183,0.4)"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Outer Grassy Verge / Trail Border Winding Down from the Front Shore of the Distant Pond (y=162) */}
      <path
        d="M 578,162
           C 545,270 470,420 310,620
           C 210,745 110,840 30,900
           L 1170,900
           C 1090,840 990,745 890,620
           C 730,420 655,270 622,162 Z"
        className="fill-amber-950/50 dark:fill-stone-950/80"
      />

      {/* Main 3D Perspective Winding Dirt & Cobblestone Path */}
      <path
        d="M 584,162
           C 554,270 485,420 335,620
           C 240,745 145,840 70,900
           L 1130,900
           C 1055,840 960,745 865,620
           C 715,420 646,270 616,162 Z"
        fill="url(#trailMainGuard)"
        className="dark:opacity-75"
      />

      {/* Inner Warm Sandy Trail Center */}
      <path
        d="M 590,162
           C 566,273 510,425 380,625
           C 295,748 215,842 150,900
           L 1050,900
           C 985,842 905,748 820,625
           C 690,425 634,273 610,162 Z"
        fill="url(#trailInnerGuard)"
        className="dark:opacity-65"
      />

      {/* SMALL DISTANT POND NESTLED IN THE MEADOW ABOVE THE PATH (No overlap with path!) */}
      <g>
        {/* Distant Pond Sandy Shoreline Bank */}
        <ellipse
          cx="600"
          cy="138"
          rx="145"
          ry="24"
          fill="url(#pondShoreGuard)"
          stroke="#b45309"
          strokeWidth="1.5"
          className="dark:opacity-80"
        />
        {/* Distant Pond Shimmering Water Basin */}
        <ellipse
          cx="600"
          cy="137"
          rx="132"
          ry="19"
          fill="url(#pondWaterGuard)"
          stroke="#bae6fd"
          strokeWidth="2"
        />
        {/* Inner Deep Pond Water Reflection */}
        <ellipse cx="600" cy="137" rx="96" ry="11.5" fill="rgba(224,242,254,0.22)" />
        {/* Luminous Water Shimmer Lines on the Distant Pond */}
        <line
          x1="535"
          y1="133"
          x2="578"
          y2="133"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="612"
          y1="140"
          x2="665"
          y2="140"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Miniature Illustrated Lily Pads & Lotus in the Distant Pond */}
        <ellipse
          cx="520"
          cy="138"
          rx="9.5"
          ry="3.2"
          fill="#10b981"
          stroke="#065f46"
          strokeWidth="0.9"
        />
        <ellipse
          cx="672"
          cy="135"
          rx="10.5"
          ry="3.4"
          fill="#10b981"
          stroke="#065f46"
          strokeWidth="0.9"
        />
        <circle cx="672" cy="133.2" r="2.4" fill="#f472b6" stroke="#be185d" strokeWidth="0.6" />
        {/* Tiny Distant Duck Swimming in the Background Pond */}
        <ellipse
          cx="568"
          cy="134"
          rx="5"
          ry="2.6"
          fill="#fbbf24"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <circle cx="572.5" cy="131.2" r="2.4" fill="#fef08a" stroke="#78350f" strokeWidth="0.8" />
        <polygon points="574.8,131 577.5,131.6 574.8,132.4" fill="#f97316" />
        {/* Illustrated Cattail Reeds on the Pond Bank */}
        <g stroke="#065f46" strokeWidth="2" strokeLinecap="round">
          <line x1="468" y1="138" x2="464" y2="117" />
          <line x1="474" y1="140" x2="473" y2="120" />
          <line x1="726" y1="140" x2="728" y2="119" />
          <line x1="732" y1="138" x2="736" y2="117" />
        </g>
        {/* Velvety Brown Cattail Seed Heads */}
        <ellipse cx="464.8" cy="122" rx="1.8" ry="4.2" fill="#5c3a21" />
        <ellipse cx="473.2" cy="124" rx="1.6" ry="3.8" fill="#5c3a21" />
        <ellipse cx="727.6" cy="123" rx="1.6" ry="3.8" fill="#5c3a21" />
        <ellipse cx="735.2" cy="121" rx="1.8" ry="4.2" fill="#5c3a21" />
      </g>

      {/* Perspective 3D Shaded Stepping Stones & Cobblestones Scaling Up Along the Path */}
      <g fill="url(#stoneGradGuard)" stroke="#44403c" strokeWidth="2">
        <ellipse cx="600" cy="182" rx="10" ry="3.5" />
        <ellipse cx="594" cy="220" rx="16" ry="5" />
        <ellipse cx="608" cy="268" rx="24" ry="7.5" />
        <ellipse cx="585" cy="325" rx="34" ry="10.5" />
        <ellipse cx="618" cy="395" rx="48" ry="14" />
        <ellipse cx="572" cy="485" rx="66" ry="19" />
        <ellipse cx="628" cy="595" rx="88" ry="25" />
        <ellipse cx="560" cy="735" rx="115" ry="32" />
      </g>
      {/* Specular Rim Highlights on Stepping Stones */}
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M568,320 Q585,317 602,320" />
        <path d="M592,388 Q618,383 644,388" />
        <path d="M535,475 Q572,469 608,475" />
        <path d="M578,581 Q628,573 678,581" />
        <path d="M495,717 Q560,707 625,717" />
      </g>

      {/* Roadside Grass Tufts & Storybook Wildflowers Along the Path Edges */}
      <g
        className="stroke-emerald-800 dark:stroke-emerald-400/55"
        strokeWidth="3"
        strokeLinecap="round"
      >
        {/* Left Meadow Tufts */}
        <path d="M220,320 L212,298 M220,320 L222,295 M220,320 L230,302" />
        <path d="M150,520 L138,490 M150,520 L152,486 M150,520 L164,494" />
        <path d="M90,710 L75,672 M90,710 L92,668 M90,710 L106,676" />
        {/* Right Meadow Tufts */}
        <path d="M980,320 L970,302 M980,320 L978,295 M980,320 L988,298" />
        <path d="M1050,520 L1036,494 M1050,520 L1048,486 M1050,520 L1062,490" />
        <path d="M1110,710 L1094,676 M1110,710 L1108,668 M1110,710 L1125,672" />
      </g>
      {/* Colorful Meadow Wildflower Blossoms */}
      <g>
        <circle cx="212" cy="296" r="3.5" fill="#fbbf24" />
        <circle cx="230" cy="300" r="3" fill="#f472b6" />
        <circle cx="138" cy="488" r="4" fill="#f472b6" />
        <circle cx="164" cy="492" r="3.5" fill="#fef08a" />
        <circle cx="75" cy="670" r="4.5" fill="#fbbf24" />
        <circle cx="106" cy="674" r="4" fill="#c084fc" />
        <circle cx="970" cy="300" r="3.5" fill="#f472b6" />
        <circle cx="988" cy="296" r="3" fill="#fbbf24" />
        <circle cx="1036" cy="492" r="4" fill="#fef08a" />
        <circle cx="1062" cy="488" r="3.5" fill="#c084fc" />
        <circle cx="1094" cy="674" r="4.5" fill="#f472b6" />
        <circle cx="1125" cy="670" r="4" fill="#fbbf24" />
      </g>
    </svg>
  );
}
