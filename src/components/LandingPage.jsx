import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const MAX_DUCKS = 20;

const QUACK_PHRASES = [
  'Quack!',
  'Cheep! 🐣',
  'Ship it! 🦆',
  'Ducks in a row!',
  'On track!',
  'Zero blockers!',
  'Waddle on!',
  'Milestone hit!',
  'All aligned!',
  'LGTM! 🦆',
];

const DUCK_PALETTES = [
  { name: 'Classic Gold', body: '#fbbf24', bodyShade: '#d97706', head: '#fde047', wing: '#f59e0b', beak: '#f97316', stroke: '#78350f', pattern: 'solid' },
  { name: 'Mallard', body: '#a8a29e', bodyShade: '#57534e', head: '#10b981', wing: '#0d9488', beak: '#eab308', stroke: '#064e3b', pattern: 'mallard' },
  { name: 'Cyber Neon', body: '#22d3ee', bodyShade: '#0284c7', head: '#67e8f9', wing: '#ec4899', beak: '#fde047', stroke: '#1e3a8a', pattern: 'stripes' },
  { name: 'Sakura Pink', body: '#f9a8d4', bodyShade: '#db2777', head: '#fbcfe8', wing: '#fb7185', beak: '#fb923c', stroke: '#831843', pattern: 'dots' },
  { name: 'Royal Lavender', body: '#c084fc', bodyShade: '#7e22ce', head: '#d8b4fe', wing: '#6366f1', beak: '#fbbf24', stroke: '#3b0764', pattern: 'stars' },
  { name: 'Tuxedo', body: '#334155', bodyShade: '#0f172a', head: '#1e293b', wing: '#475569', beak: '#f97316', stroke: '#020617', pattern: 'tuxedo' },
  { name: 'Mint Matcha', body: '#6ee7b7', bodyShade: '#059669', head: '#a7f3d0', wing: '#10b981', beak: '#fb923c', stroke: '#064e3b', pattern: 'dots' },
  { name: 'Sunset Coral', body: '#fb7185', bodyShade: '#e11d48', head: '#fda4af', wing: '#f59e0b', beak: '#fde047', stroke: '#881337', pattern: 'solid' },
  { name: 'Oceanic Frost', body: '#38bdf8', bodyShade: '#0369a1', head: '#7dd3fc', wing: '#818cf8', beak: '#fbbf24', stroke: '#0c4a6e', pattern: 'stripes' },
  { name: 'Snowy White', body: '#f8fafc', bodyShade: '#94a3b8', head: '#ffffff', wing: '#bae6fd', beak: '#f97316', stroke: '#334155', pattern: 'solid' },
  { name: 'Magma Flame', body: '#fb923c', bodyShade: '#c2410c', head: '#fdba74', wing: '#facc15', beak: '#dc2626', stroke: '#7c2d12', pattern: 'stars' },
  { name: 'Galaxy Cosmic', body: '#6366f1', bodyShade: '#312e81', head: '#818cf8', wing: '#d946ef', beak: '#38bdf8', stroke: '#1e1b4b', pattern: 'stars' },
  { name: 'Punk Lime', body: '#a3e635', bodyShade: '#4d7c0f', head: '#bef264', wing: '#ec4899', beak: '#f97316', stroke: '#365314', pattern: 'stripes' },
  { name: 'Sunshine Lemon', body: '#fde047', bodyShade: '#ca8a04', head: '#fef08a', wing: '#fb923c', beak: '#ea580c', stroke: '#713f12', pattern: 'dots' },
];

const HAT_STYLES = [
  'captain',
  'crown',
  'wizard',
  'tophat',
  'cowboy',
  'party',
  'viking',
  'chef',
  'pirate',
  'propeller',
  'halo',
  'mohawk',
  'beret',
  'headband',
  'flower',
  'none',
];

const EYEWEAR_STYLES = [
  'sunglasses',
  'monocle',
  'roundglasses',
  'starshades',
  'eyepatch',
  'none',
  'none',
];

const ACCESSORY_STYLES = [
  'bowtie',
  'scarf',
  'chain',
  'bandana',
  'none',
  'none',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createDuckData(index, isLeader = false) {
  const palette = isLeader ? DUCK_PALETTES[0] : pickRandom(DUCK_PALETTES);
  const hat = isLeader ? 'captain' : pickRandom(HAT_STYLES);
  const eyewear = isLeader ? 'sunglasses' : pickRandom(EYEWEAR_STYLES);
  const accessory = isLeader
    ? 'bowtie'
    : palette.pattern === 'tuxedo'
    ? 'bowtie'
    : pickRandom(ACCESSORY_STYLES);

  const pondX = isLeader ? 70 : Math.floor(8 + Math.random() * 84);
  const pondY = isLeader ? 50 : Math.floor(24 + Math.random() * 52);
  const facingLeft = isLeader ? false : Math.random() < 0.38;

  return {
    id: `duck-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    isLeader,
    palette,
    hat,
    eyewear,
    accessory,
    pondX,
    pondY,
    facingLeft,
    delay: `${((index % 10) * 0.25).toFixed(2)}s`,
  };
}

function DuckSvg({ duck }) {
  const { palette, hat, eyewear, accessory, isLeader } = duck;
  const uid = duck.id;
  const rim = palette.stroke || '#78350f';

  return (
    <svg
      viewBox="0 0 68 64"
      style={{ width: isLeader ? 124 : 104, height: isLeader ? 116 : 96 }}
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
      <circle
        cx="42"
        cy="22"
        r="10.5"
        fill={palette.head}
        stroke={rim}
        strokeWidth="1.8"
      />
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
          <rect x="41" y="17.5" width="9" height="5" rx="1.5" fill="#0f172a" stroke="#fde047" strokeWidth="1.1" />
          <line x1="42.5" y1="18.5" x2="44.5" y2="21.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1" strokeLinecap="round" />
          <line x1="34" y1="19" x2="41" y2="19" stroke="#0f172a" strokeWidth="1.6" />
        </g>
      )}
      {eyewear === 'roundglasses' && (
        <g>
          <circle cx="45.5" cy="20" r="3.6" fill="rgba(255,255,255,0.25)" stroke="#451a03" strokeWidth="1.5" />
          <line x1="36" y1="20" x2="41.9" y2="20" stroke="#451a03" strokeWidth="1.3" />
        </g>
      )}
      {eyewear === 'monocle' && (
        <g>
          <circle cx="45.5" cy="20" r="3.8" fill="rgba(253, 224, 71, 0.22)" stroke="#fbbf24" strokeWidth="1.6" />
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
          <polygon points="32,14 42,1 51,14" fill="#9333ea" stroke="#3b0764" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M29 14 L54 14" stroke="#3b0764" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="42" cy="9" r="1.5" fill="#fef08a" />
        </g>
      )}
      {hat === 'tophat' && (
        <g>
          <rect x="35" y="3" width="13" height="10" rx="1.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.6" />
          <rect x="35" y="10" width="13" height="2.5" fill="#f43f5e" />
          <path d="M31 13 L52 13" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}
      {hat === 'cowboy' && (
        <g>
          <path d="M34 13 C35 6, 40 8, 42 6 C44 8, 48 6, 49 13 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.6" />
          <path d="M29 12 Q42 16 54 12" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
      {hat === 'party' && (
        <g>
          <polygon points="36,13 42,2 48,13" fill="#f472b6" stroke="#831843" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="42" cy="2" r="2.2" fill="#fef08a" />
        </g>
      )}
      {hat === 'viking' && (
        <g>
          <path d="M34 14 C31 8, 30 5, 33 4 C34 8, 36 10, 37 12" fill="#fef9c3" stroke="#78350f" strokeWidth="1.4" />
          <path d="M49 14 C52 8, 53 5, 50 4 C49 8, 47 10, 46 12" fill="#fef9c3" stroke="#78350f" strokeWidth="1.4" />
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
          <ellipse cx="41.5" cy="4" rx="6" ry="1.6" fill="#fb7185" stroke="#881337" strokeWidth="1.1" />
        </g>
      )}
      {hat === 'halo' && (
        <ellipse
          cx="42"
          cy="6"
          rx="8"
          ry="2.3"
          fill="none"
          stroke="#fef08a"
          strokeWidth="2.4"
        />
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
          <path d="M32 14 L26 11 M32 14 L27 17" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
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

export default function LandingPage({
  onCreateRoadmap,
  onUploadRoadmap,
  themeMode,
  onChangeThemeMode,
}) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [ducks, setDucks] = useState(() => [
    createDuckData(0, true),
    createDuckData(1, false),
    createDuckData(2, false),
  ]);
  const [isAligned, setIsAligned] = useState(false);
  const [isRegrouping, setIsRegrouping] = useState(false);
  const regroupTimer = useRef(null);
  const quackSeq = useRef(0);
  const [hoppingId, setHoppingId] = useState(null);
  const [quacks, setQuacks] = useState([]);
  const [isEggHatching, setIsEggHatching] = useState(false);

  const isDark = themeMode === 'dark';

  const triggerQuack = (duckId, customPhrase) => {
    setHoppingId(duckId);
    setTimeout(() => {
      setHoppingId((prev) => (prev === duckId ? null : prev));
    }, 550);

    const phrase = customPhrase || pickRandom(QUACK_PHRASES);
    quackSeq.current += 1;
    const quackId = `quack-${quackSeq.current}`;
    setQuacks((prev) => [...prev.slice(-6), { id: quackId, duckId, phrase }]);
    setTimeout(() => {
      setQuacks((prev) => prev.filter((q) => q.id !== quackId));
    }, 1100);
  };

  const handleHatchEgg = () => {
    if (isEggHatching) return;
    setIsEggHatching(true);
    setTimeout(() => setIsEggHatching(false), 900);

    const baseDuck = createDuckData(ducks.length + 1, false);
    // Fly in from the horizon heading toward the pond spot, facing the direction of travel
    const newDuck = { ...baseDuck, flying: true, facingLeft: baseDuck.pondX < 50 };
    setTimeout(() => setDucks((prev) => {
      if (prev.length < MAX_DUCKS) {
        return [...prev, newDuck];
      }
      const replaceIdx =
        prev.length > 1
          ? 1 + Math.floor(Math.random() * (prev.length - 1))
          : 0;
      const next = [...prev];
      next[replaceIdx] = newDuck;
      return next;
    }), 750);
  };

  const changeAligned = (next) => {
    setIsAligned((prev) => (typeof next === 'function' ? next(prev) : next));
    setIsRegrouping(true);
    clearTimeout(regroupTimer.current);
    regroupTimer.current = setTimeout(() => setIsRegrouping(false), 800);
  };

  // Ducks paddle around the pond, and every so often dive under or dabble tail-up
  useEffect(() => {
    if (isAligned) return undefined;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    const swimTimer = setInterval(() => {
      setDucks((prev) => {
        const movers = new Set();
        const n = Math.max(1, Math.round(prev.length / 4));
        while (movers.size < Math.min(n, prev.length)) {
          movers.add(Math.floor(Math.random() * prev.length));
        }
        return prev.map((d, i) => {
          if (!movers.has(i) || d.flying || d.dive) return d;
          const pondX = clamp(d.pondX + (Math.random() * 2 - 1) * 18, 8, 92);
          const pondY = clamp(d.pondY + (Math.random() * 2 - 1) * 14, 22, 78);
          return {
            ...d,
            pondX,
            pondY,
            facingLeft: pondX < d.pondX,
            swimMs: Math.round(2800 + Math.random() * 2200),
          };
        });
      });
    }, 2600);

    const diveTimer = setInterval(() => {
      const r = Math.random();
      const kind = Math.random() < 0.3 ? 'tail' : 'under';
      const token = Math.random();
      setDucks((prev) => {
        const idxs = prev.map((d, i) => (!d.flying && !d.dive ? i : -1)).filter((i) => i >= 0);
        if (!idxs.length) return prev;
        const pick = idxs[Math.floor(r * idxs.length)];
        return prev.map((d, i) =>
          i === pick ? { ...d, dive: kind, diveToken: token, splash: true } : d
        );
      });
      setTimeout(() => {
        setDucks((prev) =>
          prev.map((d) => (d.diveToken === token ? { ...d, splash: false } : d))
        );
      }, 1000);
      setTimeout(() => {
        setDucks((prev) =>
          prev.map((d) => (d.diveToken === token ? { ...d, dive: null, splash: true } : d))
        );
        setTimeout(() => {
          setDucks((prev) =>
            prev.map((d) => (d.diveToken === token ? { ...d, splash: false } : d))
          );
        }, 1000);
      }, 2700);
    }, 3800);

    return () => {
      clearInterval(swimTimer);
      clearInterval(diveTimer);
    };
  }, [isAligned]);

  const handleDuckLanded = (duckId) => {
    setDucks((prev) => prev.map((d) => (d.id === duckId ? { ...d, flying: false, splash: true } : d)));
    setTimeout(() => {
      setDucks((prev) => prev.map((d) => (d.id === duckId ? { ...d, splash: false } : d)));
    }, 1000);
    triggerQuack(duckId, 'Cheep! 🐣');
  };

  const handleFileProcess = (file) => {
    if (!file) return;
    setUploadError('');

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setUploadError('Please select a valid .json roadmap file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object' || (!parsed.config && !parsed.sections)) {
          setUploadError(
            'Invalid roadmap JSON schema. Expected config, sections, tasks, and timelineItems.'
          );
          return;
        }
        onUploadRoadmap(parsed);
      } catch {
        setUploadError('Could not parse JSON file. Please verify the file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFileProcess(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleFileProcess(file);
  };

  // Compute multi-row alignment grid & zoom scale when hovering "Get your ducks in a row"
  const count = ducks.length;
  const numRows =
    count <= 10 ? 1 : 2;
  const colsPerRow = Math.ceil(count / numRows);
  const alignedScale =
    1;

  const getDuckPosition = (duck, index) => {
    if (!isAligned) {
      return {
        left: `${duck.pondX}%`,
        top: `${duck.pondY}%`,
        scale: 1,
        flipX: duck.facingLeft ? -1 : 1,
      };
    }

    const row = Math.floor(index / colsPerRow);
    const col = index % colsPerRow;
    const itemsInThisRow = Math.min(colsPerRow, count - row * colsPerRow);

    const visualCol = itemsInThisRow - 1 - col;
    const minX = 7;
    const maxX = 93;
    const leftPct =
      itemsInThisRow === 1
        ? 46
        : minX + (visualCol / Math.max(1, colsPerRow - 1)) * (maxX - minX);

    const minY = numRows === 1 ? 52 : 30;
    const maxY = numRows === 1 ? 52 : 76;
    const topPct =
      numRows === 1
        ? 52
        : minY + (row / Math.max(1, numRows - 1)) * (maxY - minY);

    return {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      scale: alignedScale,
      flipX: 1,
    };
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setIsDraggingOver(false);
        }
      }}
      onDrop={handleDrop}
      className="min-h-screen h-screen relative overflow-hidden flex flex-col bg-gradient-to-b from-amber-100 via-sky-200 to-sky-300 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-500 select-none"
    >
      {/* Hidden File Input for JSON Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        data-testid="upload-json-input"
      />

      {/* Full-Pond JSON Drag-and-Drop Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xl border-4 border-dashed border-indigo-400/70 flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className="px-8 py-6 rounded-3xl bg-white/15 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-indigo-400/40 shadow-[0_20px_50px_rgba(15,23,42,0.6),inset_0_1px_2px_rgba(255,255,255,0.65)] flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/25 border border-indigo-300/50 shadow-inner flex items-center justify-center text-3xl animate-bounce">
              🦆
            </div>
            <div className="text-xl font-extrabold text-white tracking-tight drop-shadow">
              Drop your Roadmap JSON into the Pond!
            </div>
            <div className="text-xs font-medium text-indigo-200">
              Release anywhere to load your roadmap into the workspace
            </div>
          </div>
        </div>
      )}

      {/* SKY & GLASSMORPHIC CELESTIAL LAYER */}
      <div className="relative z-20 shrink-0 h-[18vh] px-6 max-w-5xl w-full mx-auto flex flex-col items-center justify-end">
        {/* Frosted Glass Sky Clouds (Light Mode) & Luminous 4-Point Stars (Dark Mode) */}
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          className="pointer-events-none fixed inset-x-0 top-0 w-full h-[26vh]"
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
            <path d="M210 38 L213 46 L221 49 L213 52 L210 60 L207 52 L199 49 L207 46 Z" fill="#fef08a" stroke="rgba(255,255,255,0.75)" strokeWidth="0.8" opacity="0.9" />
            <path d="M580 26 L582 32 L588 34 L582 36 L580 42 L578 36 L572 34 L578 32 Z" fill="#c7d2fe" stroke="rgba(255,255,255,0.75)" strokeWidth="0.8" opacity="0.85" />
            <path d="M980 44 L983 51 L990 54 L983 57 L980 64 L977 57 L970 54 L977 51 Z" fill="#fde047" stroke="rgba(255,255,255,0.75)" strokeWidth="0.8" opacity="0.85" />
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

        {/* Right Sky: Clickable Glassmorphic Sun / Crescent Moon (Hidden on smaller resolutions) */}
        <button
          type="button"
          onClick={() => onChangeThemeMode(isDark ? 'light' : 'dark')}
          data-testid="celestial-theme-toggle"
          className="hidden xl:flex fixed top-7 right-10 z-30 group w-24 h-24 items-center justify-center rounded-full focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95"
          title={isDark ? 'Click the Moon to switch to Light Mode' : 'Click the Sun to switch to Dark Mode'}
        >
          {isDark ? (
            /* Sculpted Glassmorphic Crescent Moon with Lunar Craters & Twinkling Stars */
            <div className="relative w-20 h-20 flex items-center justify-center drop-shadow-[0_0_24px_rgba(253,224,71,0.65)]">
              <svg
                viewBox="0 0 88 88"
                className="w-20 h-20 overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="moonGrad" x1="16" y1="12" x2="68" y2="74" gradientUnits="userSpaceOnUse">
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
                <circle cx="44" cy="44" r="32" fill="rgba(129, 140, 248, 0.16)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                <path
                  d="M 52 14
                     A 30 30 0 1 0 74 56
                     A 23 23 0 1 1 52 14 Z"
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
                <circle cx="31" cy="40" r="3.8" fill="url(#moonCraterGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" />
                <circle cx="36" cy="54" r="5" fill="url(#moonCraterGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" />
                <circle cx="27" cy="51" r="2.3" fill="url(#moonCraterGrad)" />
                <circle cx="48" cy="64" r="3.1" fill="url(#moonCraterGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
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
            <div className="relative w-20 h-20 flex items-center justify-center drop-shadow-[0_0_28px_rgba(251,191,36,0.85)]">
              <svg
                viewBox="0 0 88 88"
                className="w-20 h-20 overflow-visible"
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
                <circle cx="44" cy="44" r="34" fill="rgba(254, 240, 138, 0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                <g className="origin-center group-hover:rotate-45 transition-transform duration-700">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = i * 22.5;
                    const isLong = i % 2 === 0;
                    return (
                      <polygon
                        key={angle}
                        points={
                          isLong
                            ? '44,3 40.2,19 47.8,19'
                            : '44,9 41.2,19.5 46.8,19.5'
                        }
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
      </div>

      {/* GLASSMORPHIC STORYBOOK HORIZON: TRANSLUCENT HILLS, CATTAILS & LAYERED SEA-GLASS WAVES */}
      <div className="relative w-full h-20 shrink-0 pointer-events-none select-none z-10 -mb-1">
        {/* Distant Mountain Ranges behind the hills */}
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-10 w-full h-28">
          <path d="M0,120 L0,78 L120,40 L200,66 L330,18 L430,60 L520,38 L640,72 L760,30 L880,66 L1010,22 L1120,64 L1230,40 L1340,70 L1440,48 L1440,120 Z" fill={isDark ? '#334155' : '#a5b4fc'} opacity="0.85" />
          <g fill="#ffffff" opacity={isDark ? '0.7' : '0.9'}>
            <path d="M330,18 L305,40 L322,36 L330,44 L342,35 L356,40 Z" />
            <path d="M760,30 L738,50 L752,47 L760,54 L772,46 L784,50 Z" />
            <path d="M1010,22 L988,43 L1002,40 L1010,48 L1022,39 L1034,43 Z" />
            <path d="M120,40 L102,56 L114,54 L120,60 L130,53 L138,56 Z" />
          </g>
          <path d="M0,120 L0,96 L90,70 L170,92 L280,58 L390,96 L520,74 L640,100 L760,62 L890,98 L1000,72 L1130,100 L1260,66 L1360,92 L1440,80 L1440,120 Z" fill={isDark ? '#1e293b' : '#6366f1'} opacity="0.8" />
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
          <g stroke={isDark ? '#34d399' : '#064e3b'} strokeWidth="2.2" strokeLinecap="round" opacity="0.85">
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

      {/* POND WATER BASIN */}
      <div className="relative flex-1 w-full flex flex-col justify-center overflow-y-auto overflow-x-hidden bg-gradient-to-b from-sky-400 via-cyan-600 to-teal-900 dark:from-sky-900 dark:via-indigo-950 dark:to-slate-950">
        {/* Ambient Frosted Glass Shimmer Ribbons & Aurora Glows inside the Pond */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 left-1/4 w-96 h-48 rounded-full bg-indigo-400/20 dark:bg-indigo-500/15 blur-3xl" />
          <div className="absolute bottom-8 right-1/4 w-96 h-48 rounded-full bg-emerald-300/20 dark:bg-teal-500/15 blur-3xl" />
          <div className="absolute top-[14%] left-[12%] w-40 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/65 to-transparent animate-wave-slow" />
          <div className="absolute top-[30%] right-[22%] w-52 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/55 to-transparent animate-wave-fast" />
          <div className="absolute top-[52%] left-[35%] w-60 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent animate-wave-slow" />
          <div className="absolute bottom-[18%] right-[15%] w-48 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-wave-fast" />
        </div>

        {/* CENTRALIZED POND STAGE: Glassmorphic Hero Header + Ducks + Hatching Egg Nest + Glassmorphic Lily Pads */}
        <div className="relative z-20 max-w-5xl w-full mx-auto px-6 pt-2 pb-4 flex flex-col justify-center items-center gap-4 my-auto">
          {/* Centered Glassmorphic Brand Badge + "Get your ducks in a row." Hero Card above the ducks */}
          <div className="relative z-30 flex flex-col items-center text-center gap-2.5 -mt-6 mb-3">
            {/* Workspace-Cohesive Frosted Glass Pill Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest text-white drop-shadow-[0_2px_6px_rgba(15,23,42,0.6)] bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-xl border border-white/50 dark:border-indigo-400/40 shadow-[0_12px_32px_rgba(15,23,42,0.35),inset_0_1px_2px_rgba(255,255,255,0.7)]">
              <span>Roadmap Builder</span>
            </div>

            {/* Interactive Aurora Glass Hero Banner */}
            <div
              onMouseEnter={() => changeAligned(true)}
              onMouseLeave={() => changeAligned(false)}
              onClick={() => changeAligned((prev) => !prev)}
              role="button"
              tabIndex={0}
              data-testid="align-ducks-trigger"
              className="group relative inline-block px-7 py-3 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              title="Hover over this title to watch all the ducks swim into aligned rows!"
            >

              <h1 className="relative text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3 drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                <span>
                  Get your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 underline decoration-amber-300/80 decoration-wavy underline-offset-4">
                    ducks in a row.
                  </span>
                </span>
                <Sparkles className="w-6 h-6 text-amber-300 group-hover:rotate-45 transition-transform shrink-0" />
              </h1>
            </div>
          </div>

          {/* 1. Open Pond Swimming Area */}
          <div className="relative h-64 sm:h-80 w-full">
            {/* Frosted Glass Alignment Swim Lanes (matching Workspace Timeline Tracks) */}
            {isAligned &&
              Array.from({ length: numRows }).map((_, rIdx) => {
                const minY = numRows === 1 ? 52 : 30;
                const maxY = numRows === 1 ? 52 : 76;
                const topPct =
                  numRows === 1
                    ? 52
                    : minY + (rIdx / Math.max(1, numRows - 1)) * (maxY - minY);
                return (
                  <div
                    key={rIdx}
                    style={{ top: `${topPct + 3}%` }}
                    className="pointer-events-none absolute left-6 right-6 h-2.5 rounded-full backdrop-blur-md bg-white/20 dark:bg-indigo-500/15 border border-white/50 dark:border-indigo-400/35 shadow-[0_4px_12px_rgba(15,23,42,0.15),inset_0_1px_1px_rgba(255,255,255,0.55)] transition-opacity duration-500"
                  />
                );
              })}


            {/* Swimming Ducks in the Pond Water */}
            {ducks.map((duck, idx) => {
              const pos = getDuckPosition(duck, idx);
              const activeQuacks = quacks.filter((q) => q.duckId === duck.id);
              const isHopping = hoppingId === duck.id;

              return (
                <div
                  key={duck.id}
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: `translate(-50%, -50%) scale(${pos.scale})`,
                    transition:
                      isAligned || isRegrouping
                        ? 'left 650ms cubic-bezier(0.22, 1, 0.36, 1), top 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1)'
                        : `left ${duck.swimMs || 4000}ms ease-in-out, top ${duck.swimMs || 4000}ms ease-in-out, transform 500ms ease`,
                    zIndex: Math.round(pos.top ? parseFloat(pos.top) : 10),
                  }}
                  className="absolute"
                >
                  {duck.splash && (
                    <svg
                      viewBox="0 0 160 60"
                      className="pointer-events-none absolute left-1/2 top-[86%] -translate-x-1/2 -translate-y-1/2 w-44 h-16 overflow-visible z-30"
                      fill="none"
                    >
                      <ellipse className="splash-ring" cx="80" cy="30" rx="34" ry="9" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" />
                      <ellipse className="splash-ring" style={{ animationDelay: '0.12s' }} cx="80" cy="30" rx="34" ry="9" stroke="rgba(186,230,253,0.9)" strokeWidth="2" />
                      <ellipse className="splash-ring" style={{ animationDelay: '0.25s' }} cx="80" cy="30" rx="34" ry="9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                      {[[-44, -34], [-26, -50], [-10, -40], [10, -42], [28, -52], [46, -32]].map(([dx, dy], i) => (
                        <circle
                          key={i}
                          className="splash-drop"
                          style={{ '--dx': `${dx}px`, '--dy': `${dy}px` }}
                          cx={80 + dx * 0.15}
                          cy="32"
                          r={i % 2 ? 3 : 4}
                          fill="rgba(224,242,254,0.95)"
                          stroke="rgba(255,255,255,0.9)"
                          strokeWidth="1"
                        />
                      ))}
                    </svg>
                  )}
                  <div
                    className={duck.flying ? 'animate-duck-fly' : undefined}
                    style={{ '--fx': `${Math.round((50 - duck.pondX) * 9)}px` }}
                    onAnimationEnd={(e) => {
                      if (duck.flying && e.target === e.currentTarget) handleDuckLanded(duck.id);
                    }}
                  >
                  <div
                    onClick={() => triggerQuack(duck.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') triggerQuack(duck.id);
                    }}
                    style={{ animationDelay: isHopping ? '0s' : duck.delay }}
                    className={`relative group focus:outline-none ${
                      isHopping ? 'animate-duck-hop' : 'animate-duck-bob'
                    }`}
                    title={`${duck.palette.name} Duck — Click to quack!`}
                  >
                    {activeQuacks.map((q) => (
                      <span
                        key={q.id}
                        className="animate-quack-float pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-xl bg-white/80 dark:bg-slate-900/85 text-slate-900 dark:text-amber-200 shadow-[0_8px_20px_rgba(15,23,42,0.3),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/80 dark:border-amber-400/45 z-30"
                      >
                        {q.phrase}
                      </span>
                    ))}

                    <div
                      style={{
                        transform: `scaleX(${pos.flipX})`,
                        transition: 'transform 450ms ease',
                      }}
                      className="group-hover:scale-110 transition-transform drop-shadow-[0_8px_16px_rgba(15,23,42,0.28)]"
                    >
                      <div
                        className={duck.dive ? 'animate-duck-dive-under' : undefined}
                      >
                        <DuckSvg duck={duck} />
                      </div>

                    {duck.dive && (
                      <svg
                        viewBox="0 0 96 70"
                        className="pointer-events-none absolute left-[47%] top-[78%] -translate-x-1/2 -translate-y-1/2 w-24 h-[4.4rem] overflow-visible"
                        fill="none"
                      >
                        <g className="duck-shadow">
                          <ellipse cx="48" cy="54" rx="34" ry="11" fill="rgba(4,30,56,0.5)" />
                          <ellipse cx="48" cy="54" rx="22" ry="7" fill="rgba(2,16,34,0.65)" />
                        </g>
                        {duck.dive === 'tail' && (
                          <g className="duck-legs-up">
                            {[38, 58].map((x, k) => (
                              <g key={x} className="duck-leg-wiggle" style={{ transformOrigin: `${x}px 52px`, animationDelay: `${k * 0.13}s` }}>
                                <path d={`M${x} 52 L${x} 24`} stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
                                <path d={`M${x} 24 L${x - 10} 8 L${x - 4} 12 L${x} 4 L${x + 4} 12 L${x + 10} 8 Z`} fill="#f97316" stroke="#9a3412" strokeWidth="1.4" strokeLinejoin="round" />
                              </g>
                            ))}
                          </g>
                        )}
                      </svg>
                    )}
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Error Alert if JSON upload fails */}
          {uploadError && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-500/25 backdrop-blur-xl border border-rose-300/60 shadow-[0_8px_24px_rgba(244,63,94,0.25),inset_0_1px_1px_rgba(255,255,255,0.5)] text-white text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* 2. Centered Glassmorphic Pond Actions: Staggered Floating Glass Lily Pads Flanked by Glazed Driftwood Logs */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 pt-2">
            {/* Left Glazed Glassmorphic Driftwood Log in the Water */}
            <svg
              viewBox="0 0 180 62"
              className="hidden lg:block w-44 h-15 -rotate-6 translate-y-4 drop-shadow-[0_12px_24px_rgba(15,23,42,0.38)] pointer-events-none overflow-visible"
              fill="none"
            >
              <defs>
                <linearGradient id="logBarkLeft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.88" />
                  <stop offset="45%" stopColor="#b45309" stopOpacity="0.86" />
                  <stop offset="100%" stopColor="#451a03" stopOpacity="0.92" />
                </linearGradient>
                <radialGradient id="logRingLeft" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#78350f" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#fcd34d" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#fef3c7" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
                </radialGradient>
              </defs>
              {/* Frosted Glass Water Ripple Under Log */}
              <ellipse cx="92" cy="46" rx="84" ry="11" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
              {/* Cylindrical Glazed Timber Body */}
              <path
                d="M24 14 L156 14 A14 19 0 0 1 156 52 L24 52 Z"
                fill="url(#logBarkLeft)"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="1.8"
              />
              {/* Specular Glass Bark Highlight & Grain */}
              <path d="M38 19 L148 19" stroke="rgba(255,255,255,0.8)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M44 35 L142 35 M36 44 L130 44" stroke="rgba(254,243,199,0.45)" strokeWidth="1.4" strokeLinecap="round" />
              {/* Full-Height Cut Wood-Ring End Cap */}
              <ellipse cx="24" cy="33" rx="13" ry="19" fill="url(#logRingLeft)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" />
              <ellipse cx="24" cy="33" rx="8" ry="12" stroke="#92400e" strokeWidth="1.2" opacity="0.65" />
              <ellipse cx="24" cy="33" rx="3.5" ry="5.5" fill="#78350f" />
              {/* Translucent Sea-Glass Moss Cushion on Top */}
              <path
                d="M52 15 C56 7, 74 7, 82 13 C90 8, 108 9, 112 15 Z"
                fill="rgba(52, 211, 153, 0.88)"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="1.4"
              />
            </svg>

            {/* Create Roadmap Floating Glassmorphic Lotus Lily Pad (Emerald Nebula Glass Theme) */}
            <button
              type="button"
              onClick={onCreateRoadmap}
              data-testid="create-roadmap-btn"
              style={{ animationDelay: '0.15s' }}
              className="animate-duck-bob group relative w-64 -rotate-2 hover:rotate-0 -translate-y-1 flex flex-col items-center text-center px-6 py-5 text-white transition-all duration-300 hover:scale-105"
            >

              {/* Sculpted Glassmorphic Blooming Lotus Flower on Veined Lily Pad SVG */}
              <svg viewBox="0 0 76 52" className="relative w-18 h-13 mb-1 group-hover:scale-110 transition-transform overflow-visible drop-shadow-[0_6px_12px_rgba(6,78,59,0.4)]">
                <defs>
                  <linearGradient id="lotusPadGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.92" />
                    <stop offset="55%" stopColor="#10b981" stopOpacity="0.88" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="lotusCenterPetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                    <stop offset="45%" stopColor="#f9a8d4" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#db2777" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="lotusSidePetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.95" />
                    <stop offset="55%" stopColor="#fb7185" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.94" />
                  </linearGradient>
                </defs>
                {/* Notched Glass Lily Pad with Specular Veins */}
                <path
                  d="M38 39 L69 35 A32 10 0 1 1 66 31 Z"
                  fill="url(#lotusPadGrad)"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M38 39 L16 36 M38 39 L24 44 M38 39 L52 44" stroke="rgba(255,255,255,0.7)" strokeWidth="1.1" strokeLinecap="round" />
                {/* Back & Side Glass Lotus Petals */}
                <path d="M22 20 C19 29, 26 36, 38 38 C33 29, 28 23, 22 20 Z" fill="url(#lotusSidePetal)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
                <path d="M54 20 C57 29, 50 36, 38 38 C43 29, 48 23, 54 20 Z" fill="url(#lotusSidePetal)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
                {/* Center Glass Lotus Petal */}
                <path d="M38 9 C30 19, 28 32, 38 38 C48 32, 46 19, 38 9 Z" fill="url(#lotusCenterPetal)" stroke="rgba(255,255,255,0.92)" strokeWidth="1.4" />
                {/* Glowing Golden Lotus Core */}
                <circle cx="38" cy="28" r="3.8" fill="#fef08a" stroke="#ffffff" strokeWidth="1.1" />
              </svg>

              <span className="relative font-extrabold text-base tracking-tight text-white drop-shadow-sm">
                Create Roadmap
              </span>
            </button>

            {/* Upload Roadmap Floating Glassmorphic Bottle Lily Pad (Oceanic Frost / Aurora Glass Theme) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-roadmap-btn"
              style={{ animationDelay: '0.85s' }}
              className="animate-duck-bob group relative w-64 rotate-2 hover:rotate-0 translate-y-2.5 flex flex-col items-center text-center px-6 py-5 text-white transition-all duration-300 hover:scale-105"
            >

              {/* Sculpted Glassmorphic Message-in-a-Bottle on Veined Lily Pad SVG */}
              <svg viewBox="0 0 76 52" className="relative w-18 h-13 mb-1 group-hover:scale-110 transition-transform overflow-visible drop-shadow-[0_6px_12px_rgba(8,145,178,0.4)]">
                <defs>
                  <linearGradient id="bottlePadGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.92" />
                    <stop offset="55%" stopColor="#14b8a6" stopOpacity="0.88" />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="glassBottleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.78" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="scrollMapGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                {/* Notched Glass Lily Pad */}
                <path
                  d="M38 39 L69 35 A32 10 0 1 1 66 31 Z"
                  fill="url(#bottlePadGrad)"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Crystalline Glass Bottle with Golden Map Scroll */}
                <g transform="rotate(-16 38 26)">
                  <rect x="21" y="18" width="26" height="14" rx="6" fill="url(#glassBottleGrad)" stroke="rgba(255,255,255,0.92)" strokeWidth="1.6" />
                  <rect x="46" y="21.5" width="6" height="7" rx="1.5" fill="url(#glassBottleGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" />
                  {/* Cork Stopper */}
                  <rect x="51" y="22.2" width="4.5" height="5.6" rx="1.2" fill="#f59e0b" stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" />
                  {/* Rolled Golden Scroll Inside */}
                  <rect x="25" y="22" width="17" height="6" rx="2" fill="url(#scrollMapGrad)" stroke="#d97706" strokeWidth="1" />
                  <line x1="33" y1="22" x2="33" y2="28" stroke="#ec4899" strokeWidth="1.6" />
                  {/* Specular Glass Highlight */}
                  <line x1="25" y1="20" x2="42" y2="20" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                </g>
              </svg>

              <span className="relative font-extrabold text-base tracking-tight text-white drop-shadow-sm">
                Upload Roadmap
              </span>
            </button>

            {/* Right Glazed Glassmorphic Driftwood Log in the Water */}
            <svg
              viewBox="0 0 180 62"
              className="hidden lg:block w-44 h-15 rotate-3 -translate-y-2 drop-shadow-[0_12px_24px_rgba(15,23,42,0.38)] pointer-events-none overflow-visible"
              fill="none"
            >
              <defs>
                <linearGradient id="logBarkRight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.88" />
                  <stop offset="45%" stopColor="#b45309" stopOpacity="0.86" />
                  <stop offset="100%" stopColor="#451a03" stopOpacity="0.92" />
                </linearGradient>
                <radialGradient id="logRingRight" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#78350f" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#fcd34d" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#fef3c7" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
                </radialGradient>
              </defs>
              <ellipse cx="88" cy="46" rx="84" ry="11" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
              <path
                d="M24 14 L156 14 L156 52 L24 52 A14 19 0 0 1 24 14 Z"
                fill="url(#logBarkRight)"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="1.8"
              />
              <path d="M32 19 L142 19" stroke="rgba(255,255,255,0.8)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M38 35 L136 35 M48 44 L142 44" stroke="rgba(254,243,199,0.45)" strokeWidth="1.4" strokeLinecap="round" />
              <ellipse cx="156" cy="33" rx="13" ry="19" fill="url(#logRingRight)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" />
              <ellipse cx="156" cy="33" rx="8" ry="12" stroke="#92400e" strokeWidth="1.2" opacity="0.65" />
              <ellipse cx="156" cy="33" rx="3.5" ry="5.5" fill="#78350f" />
              <path
                d="M68 15 C72 7, 90 7, 98 13 C106 8, 124 9, 128 15 Z"
                fill="rgba(52, 211, 153, 0.88)"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="1.4"
              />
            </svg>
          </div>
        </div>

{/* SHORE: Little peninsula jutting up from the bottom of the screen, holding the egg nest */}
        <div className="relative z-20 shrink-0 w-full h-36 sm:h-44 pointer-events-none select-none">
          <svg viewBox="0 0 1440 176" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none">
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
            {/* Shallow water ripple halo around the point */}
            <path d="M90 176 C300 170 420 70 580 66 L860 66 C1020 70 1140 170 1350 176 Z" fill="rgba(224,242,254,0.2)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
            {/* Sandy beach */}
            <path d="M170 176 C340 172 440 90 590 86 L850 86 C1000 90 1100 172 1270 176 Z" fill="url(#shoreSandGrad)" stroke="#92400e" strokeWidth="2" strokeLinejoin="round" />
            {/* Grassy top */}
            <path d="M230 176 C380 174 470 106 600 102 L840 102 C970 106 1060 174 1210 176 Z" fill="url(#shoreGrassGrad)" stroke="#14532d" strokeWidth="2" strokeLinejoin="round" />
            <path d="M440 144 Q520 110 640 106 L800 106" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
            {/* Cattails & reeds */}
            <g stroke="#15803d" strokeWidth="3" strokeLinecap="round">
              <path d="M350 170 Q344 132 352 102 M372 172 Q372 140 368 114 M1090 170 Q1096 132 1088 104 M1068 172 Q1068 142 1072 118" />
            </g>
            <g fill="#78350f" stroke="#451a03" strokeWidth="1">
              <ellipse cx="352" cy="106" rx="4" ry="11" />
              <ellipse cx="368" cy="118" rx="3.6" ry="9" />
              <ellipse cx="1088" cy="108" rx="4" ry="11" />
              <ellipse cx="1072" cy="122" rx="3.6" ry="9" />
            </g>
            {/* Wildflowers & pebbles */}
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
                        {/* Twig Nest holding the clickable egg, resting on the shore */}
            <button
              type="button"
              onClick={handleHatchEgg}
              data-testid="hatch-egg-btn"
              aria-label="Hatch a new duck"
              className="group absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-5 z-10 focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
              title="Click the egg to hatch another duck into the pond!"
            >
              <svg
                viewBox="12 14 96 80"
                className="w-32 h-28 sm:w-40 sm:h-36 overflow-visible drop-shadow-[0_10px_18px_rgba(15,23,42,0.35)]"
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
                  <linearGradient id="shoreMoundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="55%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#14532d" />
                  </linearGradient>
                  <radialGradient id="eggGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Nest: back rim + dark hollow */}
                <ellipse cx="60" cy="74" rx="34" ry="11" fill="#92400e" stroke="#451a03" strokeWidth="1.4" />
                <path d="M28 72 Q60 60 92 72 M31 68 Q60 58 89 68" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
                <ellipse cx="60" cy="73" rx="27" ry="7.5" fill="#451a03" opacity="0.85" />

                {/* Soft glow pulsing behind the egg to invite a click */}
                <circle cx="60" cy="50" r="30" fill="url(#eggGlowGrad)" className={isEggHatching ? 'egg-burst' : 'animate-pulse'} />

                {/* The Egg (wobbles + cracks when hatching) */}
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
                  <path d="M52 29 C49 36, 48 44, 49 50" stroke="rgba(255,255,255,0.95)" strokeWidth="2.6" strokeLinecap="round" />
                  <circle cx="55" cy="36" r="1.8" fill="#d97706" opacity="0.65" />
                  <circle cx="66" cy="42" r="2.2" fill="#d97706" opacity="0.55" />
                  <circle cx="57" cy="52" r="1.5" fill="#b45309" opacity="0.6" />
                  <circle cx="67" cy="32" r="1.3" fill="#b45309" opacity="0.6" />
                  <circle cx="63" cy="60" r="1.6" fill="#b45309" opacity="0.5" />
                  {isEggHatching && (
                    <g>
                      <path className="egg-crack" pathLength="100" d="M45 46 L54 41 L59 50 L66 42 L75 47" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path className="egg-crack" pathLength="100" style={{ animationDelay: '0.25s' }} d="M59 50 L57 60 M66 42 L68 32 M54 41 L52 31" stroke="#78350f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}
                </g>

                {/* Nest front rim: layered twigs, straw & feather */}
                <path d="M26 73 C28 90, 92 90, 94 73 C86 82, 34 82, 26 73 Z" fill="url(#twigNestGrad)" stroke="#451a03" strokeWidth="1.4" strokeLinejoin="round" />
                <g strokeLinecap="round" fill="none">
                  <path d="M28 75 Q60 87 92 75" stroke="#78350f" strokeWidth="1.8" />
                  <path d="M31 79 Q60 89 89 79" stroke="#b45309" strokeWidth="1.6" />
                  <path d="M34 76 L48 83 M46 80 L66 85 M64 84 L84 77 M40 81 L56 86" stroke="#fde68a" strokeWidth="1.2" opacity="0.9" />
                  <path d="M26 72 L19 66 M27 76 L18 77 M94 72 L101 66 M93 76 L102 78" stroke="#92400e" strokeWidth="2" />
                  <path d="M84 72 Q91 64 96 59 Q91 68 86 75 Z" stroke="#ffffff" strokeWidth="0.8" fill="rgba(255,255,255,0.85)" />
                </g>

                {/* Hatch flash */}
                {isEggHatching && (
                  <circle className="egg-burst" cx="60" cy="52" r="28" fill="rgba(255,251,200,0.85)" style={{ transformOrigin: '60px 52px' }} />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Foreground Translucent Sea-Glass Bottom Waves */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 overflow-hidden opacity-65">
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className="w-[115%] h-full animate-wave-fast"
          >
            <path
              d="M0,30 C220,5 420,55 660,25 C900,0 1060,50 1200,25 L1200,60 L0,60 Z"
              fill="rgba(2, 132, 199, 0.55)"
            />
            <path
              d="M0,30 C220,5 420,55 660,25 C900,0 1060,50 1200,25"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2.2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
