import { useRef, useState } from 'react';
import {
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const MAX_DUCKS = 40;

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
  { name: 'Classic Gold', body: '#fbbf24', head: '#fbbf24', wing: '#f59e0b', beak: '#f97316', pattern: 'solid' },
  { name: 'Mallard', body: '#a8a29e', head: '#047857', wing: '#0d9488', beak: '#eab308', pattern: 'mallard' },
  { name: 'Cyber Neon', body: '#22d3ee', head: '#06b6d4', wing: '#ec4899', beak: '#fde047', pattern: 'stripes' },
  { name: 'Sakura Pink', body: '#f9a8d4', head: '#f472b6', wing: '#fb7185', beak: '#fb923c', pattern: 'dots' },
  { name: 'Royal Lavender', body: '#c084fc', head: '#a855f7', wing: '#6366f1', beak: '#fbbf24', pattern: 'stars' },
  { name: 'Tuxedo', body: '#1e293b', head: '#0f172a', wing: '#334155', beak: '#f97316', pattern: 'tuxedo' },
  { name: 'Mint Matcha', body: '#6ee7b7', head: '#34d399', wing: '#059669', beak: '#fb923c', pattern: 'dots' },
  { name: 'Sunset Coral', body: '#fb7185', head: '#f43f5e', wing: '#f59e0b', beak: '#fde047', pattern: 'solid' },
  { name: 'Oceanic Frost', body: '#38bdf8', head: '#0284c7', wing: '#818cf8', beak: '#fbbf24', pattern: 'stripes' },
  { name: 'Snowy White', body: '#f8fafc', head: '#ffffff', wing: '#bae6fd', beak: '#f97316', pattern: 'solid' },
  { name: 'Magma Flame', body: '#fb923c', head: '#ea580c', wing: '#facc15', beak: '#dc2626', pattern: 'stars' },
  { name: 'Galaxy Cosmic', body: '#4f46e5', head: '#312e81', wing: '#d946ef', beak: '#38bdf8', pattern: 'stars' },
  { name: 'Punk Lime', body: '#a3e635', head: '#84cc16', wing: '#ec4899', beak: '#f97316', pattern: 'stripes' },
  { name: 'Sunshine Lemon', body: '#fde047', head: '#facc15', wing: '#fb923c', beak: '#ea580c', pattern: 'dots' },
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

  // Organic free-swim coordinates strictly inside the pond water surface
  const pondX = isLeader
    ? 70
    : Math.floor(14 + Math.random() * 64);
  const pondY = isLeader
    ? 52
    : Math.floor(24 + Math.random() * 60);
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

  return (
    <svg
      viewBox="0 0 68 64"
      style={{ width: isLeader ? 60 : 50, height: isLeader ? 56 : 46 }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Water wake ripple ring around duck in the water */}
      <ellipse
        cx="32"
        cy="54"
        rx={isLeader ? '26' : '22'}
        ry="5.5"
        fill="rgba(255, 255, 255, 0.22)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1"
      />
      <ellipse
        cx="32"
        cy="54"
        rx={isLeader ? '19' : '16'}
        ry="3.5"
        fill="rgba(14, 165, 233, 0.45)"
      />

      {/* Duck Body */}
      <path
        d="M12 41 C10 32, 18 28, 30 30 C37 31, 45 29, 48 23 C50 30, 52 41, 45 49 C38 55, 20 55, 14 48 C12 46, 12 43, 12 41 Z"
        fill={palette.body}
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Body Patterns */}
      {palette.pattern === 'tuxedo' && (
        <path
          d="M34 31 C42 31, 47 36, 45 46 C41 51, 33 50, 32 43 Z"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="1.5"
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
        <g fill="rgba(255,255,255,0.65)">
          <circle cx="20" cy="39" r="2" />
          <circle cx="27" cy="46" r="1.8" />
          <circle cx="17" cy="45" r="1.5" />
        </g>
      )}
      {palette.pattern === 'stripes' && (
        <g stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round">
          <path d="M16 37 L26 35" />
          <path d="M15 42 L25 40" />
        </g>
      )}
      {palette.pattern === 'stars' && (
        <g fill="#fde047">
          <circle cx="19" cy="38" r="1.8" />
          <circle cx="25" cy="46" r="1.4" />
          <circle cx="39" cy="44" r="1.6" />
        </g>
      )}

      {/* Duck Head */}
      <circle
        cx="42"
        cy="22"
        r="10.5"
        fill={palette.head}
        stroke="#0f172a"
        strokeWidth="2.2"
      />

      {/* Rosy Cheek */}
      <circle cx="44.5" cy="25.5" r="2.2" fill="#fb7185" opacity="0.75" />

      {/* Duck Beak */}
      <path
        d="M51 20.5 C57 20, 61 22.5, 58.5 25 C56.5 27, 51 26, 51 26 Z"
        fill={palette.beak}
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Duck Eye */}
      {eyewear !== 'sunglasses' && eyewear !== 'starshades' && eyewear !== 'eyepatch' && (
        <g>
          <circle cx="45" cy="20" r="2.1" fill="#0f172a" />
          <circle cx="45.7" cy="19.3" r="0.7" fill="#ffffff" />
        </g>
      )}

      {/* Eyewear */}
      {eyewear === 'sunglasses' && (
        <g>
          <rect x="41" y="17.5" width="9" height="5" rx="1.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
          <line x1="34" y1="19" x2="41" y2="19" stroke="#0f172a" strokeWidth="1.8" />
        </g>
      )}
      {eyewear === 'roundglasses' && (
        <g>
          <circle cx="45.5" cy="20" r="3.6" fill="rgba(255,255,255,0.2)" stroke="#0f172a" strokeWidth="1.6" />
          <line x1="36" y1="20" x2="41.9" y2="20" stroke="#0f172a" strokeWidth="1.4" />
        </g>
      )}
      {eyewear === 'monocle' && (
        <g>
          <circle cx="45.5" cy="20" r="3.8" fill="rgba(253, 224, 71, 0.2)" stroke="#fbbf24" strokeWidth="1.8" />
          <path d="M45.5 23.8 Q44 30 41 33" stroke="#fbbf24" strokeWidth="1.2" />
        </g>
      )}
      {eyewear === 'starshades' && (
        <g>
          <polygon
            points="45.5,15.5 47,18.5 50.5,19 48,21.2 48.6,24.5 45.5,22.8 42.4,24.5 43,21.2 40.5,19 44,18.5"
            fill="#ec4899"
            stroke="#0f172a"
            strokeWidth="1.3"
          />
        </g>
      )}
      {eyewear === 'eyepatch' && (
        <g>
          <circle cx="45.5" cy="20" r="3.2" fill="#0f172a" />
          <line x1="34" y1="16" x2="51" y2="22" stroke="#0f172a" strokeWidth="1.8" />
        </g>
      )}

      {/* Folded Wing */}
      <path
        d="M21 37 C27 34, 36 36, 36 42 C36 46, 27 48, 20 44 C18 42, 19 38, 21 37 Z"
        fill={palette.wing}
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Neck Accessories */}
      {accessory === 'bowtie' && (
        <g>
          <polygon points="39,29 44,32 39,35" fill="#e11d48" stroke="#0f172a" strokeWidth="1.2" />
          <polygon points="49,29 44,32 49,35" fill="#e11d48" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="44" cy="32" r="1.6" fill="#fb7185" stroke="#0f172a" strokeWidth="1" />
        </g>
      )}
      {accessory === 'scarf' && (
        <g>
          <path d="M33 28 Q42 33 49 29" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M36 30 L34 39" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {accessory === 'chain' && (
        <path
          d="M34 29 Q42 35 48 29"
          stroke="#fbbf24"
          strokeWidth="2.5"
          strokeDasharray="2 2"
          strokeLinecap="round"
        />
      )}
      {accessory === 'bandana' && (
        <polygon points="35,28 49,28 43,36" fill="#ef4444" stroke="#0f172a" strokeWidth="1.4" />
      )}

      {/* Hats & Headgear */}
      {hat === 'captain' && (
        <g>
          <path d="M33 13 C35 7, 47 7, 49 13 Z" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <path d="M31 13 L53 13" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="41.5" cy="8.5" r="1.6" fill="#fbbf24" />
        </g>
      )}
      {hat === 'crown' && (
        <polygon
          points="34,13 35,5 39,10 42,4 45,10 49,5 50,13"
          fill="#fde047"
          stroke="#0f172a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
      {hat === 'wizard' && (
        <g>
          <polygon points="32,14 42,1 51,14" fill="#7e22ce" stroke="#0f172a" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M29 14 L54 14" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="42" cy="9" r="1.4" fill="#fde047" />
        </g>
      )}
      {hat === 'tophat' && (
        <g>
          <rect x="35" y="3" width="13" height="10" rx="1.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.8" />
          <rect x="35" y="10" width="13" height="2.5" fill="#ef4444" />
          <path d="M31 13 L52 13" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {hat === 'cowboy' && (
        <g>
          <path d="M34 13 C35 6, 40 8, 42 6 C44 8, 48 6, 49 13 Z" fill="#b45309" stroke="#0f172a" strokeWidth="1.8" />
          <path d="M29 12 Q42 16 54 12" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      )}
      {hat === 'party' && (
        <g>
          <polygon points="36,13 42,2 48,13" fill="#ec4899" stroke="#0f172a" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="42" cy="2" r="2.2" fill="#fde047" />
        </g>
      )}
      {hat === 'viking' && (
        <g>
          <path d="M34 14 C31 8, 30 5, 33 4 C34 8, 36 10, 37 12" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.6" />
          <path d="M49 14 C52 8, 53 5, 50 4 C49 8, 47 10, 46 12" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.6" />
          <path d="M34 13 C35 7, 48 7, 49 13 Z" fill="#64748b" stroke="#0f172a" strokeWidth="1.8" />
        </g>
      )}
      {hat === 'chef' && (
        <g>
          <path
            d="M34 13 C31 9, 34 4, 38 6 C40 3, 45 3, 46 6 C50 4, 52 9, 49 13 Z"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </g>
      )}
      {hat === 'pirate' && (
        <g>
          <path d="M31 14 C35 6, 48 6, 53 14 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1.4" />
          <circle cx="42" cy="11" r="1.8" fill="#ffffff" />
        </g>
      )}
      {hat === 'propeller' && (
        <g>
          <path d="M34 13 C35 8, 48 8, 49 13 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.8" />
          <line x1="41.5" y1="8" x2="41.5" y2="4" stroke="#0f172a" strokeWidth="2" />
          <ellipse cx="41.5" cy="4" rx="6" ry="1.6" fill="#ef4444" stroke="#0f172a" strokeWidth="1.2" />
        </g>
      )}
      {hat === 'halo' && (
        <ellipse
          cx="42"
          cy="6"
          rx="8"
          ry="2.3"
          fill="none"
          stroke="#fde047"
          strokeWidth="2.4"
        />
      )}
      {hat === 'mohawk' && (
        <path
          d="M35 13 L33 5 L38 10 L41 3 L44 10 L49 5 L47 13 Z"
          fill="#ec4899"
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {hat === 'beret' && (
        <path
          d="M32 13 C31 7, 46 6, 50 11 C46 13, 36 13, 32 13 Z"
          fill="#e11d48"
          stroke="#0f172a"
          strokeWidth="1.8"
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
          <circle cx="38" cy="10" r="3" fill="#f472b6" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="42" cy="10" r="3" fill="#f472b6" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="40" cy="7.5" r="3" fill="#f472b6" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="40" cy="9.5" r="1.6" fill="#fde047" />
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
    createDuckData(3, false),
    createDuckData(4, false),
    createDuckData(5, false),
  ]);
  const [isAligned, setIsAligned] = useState(false);
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
    const quackId = `${Date.now()}-${Math.random()}`;
    setQuacks((prev) => [...prev.slice(-6), { id: quackId, duckId, phrase }]);
    setTimeout(() => {
      setQuacks((prev) => prev.filter((q) => q.id !== quackId));
    }, 1100);
  };

  const handleHatchEgg = () => {
    setIsEggHatching(true);
    setTimeout(() => setIsEggHatching(false), 520);

    const newDuck = createDuckData(ducks.length + 1, false);
    setDucks((prev) => {
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
    });
    setTimeout(() => triggerQuack(newDuck.id, 'Cheep! 🐣'), 80);
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
    count <= 8 ? 1 : count <= 18 ? 2 : count <= 30 ? 3 : 4;
  const colsPerRow = Math.ceil(count / numRows);
  const alignedScale =
    count <= 8 ? 1 : count <= 18 ? 0.84 : count <= 30 ? 0.72 : 0.62;

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
    const minX = 14;
    const maxX = 80;
    const leftPct =
      itemsInThisRow === 1
        ? 46
        : minX + (visualCol / Math.max(1, colsPerRow - 1)) * (maxX - minX);

    const minY = numRows === 1 ? 54 : 26;
    const maxY = numRows === 1 ? 54 : 80;
    const topPct =
      numRows === 1
        ? 54
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
        <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-md border-4 border-dashed border-amber-400 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-3xl animate-bounce">
            🦆
          </div>
          <div className="text-xl font-extrabold text-white">
            Drop your Roadmap JSON into the Pond!
          </div>
        </div>
      )}

      {/* SKY & HORIZON TRANSITION LAYER */}
      <div className="relative z-20 shrink-0 h-[20vh] px-6 max-w-5xl w-full mx-auto flex flex-col items-center justify-end">
        {/* Ambient Sky Stars / Clouds */}
        <div className="pointer-events-none fixed inset-x-0 top-0 h-[24vh] overflow-hidden">
          <span className="hidden dark:block absolute top-8 left-[18%] w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          <span className="hidden dark:block absolute top-16 left-[42%] w-1 h-1 rounded-full bg-amber-200/80 animate-ping" />
          <span className="hidden dark:block absolute top-10 left-[66%] w-1.5 h-1.5 rounded-full bg-indigo-200/80 animate-pulse" />
          <span className="hidden dark:block absolute top-20 left-[82%] w-1 h-1 rounded-full bg-white/70 animate-pulse" />
          <div className="dark:hidden absolute top-8 left-[20%] w-40 h-10 rounded-full bg-white/75 blur-md" />
          <div className="dark:hidden absolute top-14 left-[56%] w-48 h-12 rounded-full bg-white/65 blur-md" />
        </div>

        {/* Right Sky: Clickable Sun / Moon in the Sky */}
        <button
          type="button"
          onClick={() => onChangeThemeMode(isDark ? 'light' : 'dark')}
          data-testid="celestial-theme-toggle"
          className="absolute top-8 right-8 z-20 group w-20 h-20 flex items-center justify-center rounded-full focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95"
          title={isDark ? 'Click the Moon to switch to Light Mode' : 'Click the Sun to switch to Dark Mode'}
        >
          {isDark ? (
            /* Glowing Crescent Moon */
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="w-13 h-13 rounded-full bg-amber-200 shadow-[0_0_42px_rgba(253,224,71,0.8)] group-hover:shadow-[0_0_56px_rgba(253,224,71,1)] transition-shadow" />
              <div className="absolute -top-0.5 right-0.5 w-9 h-9 rounded-full bg-indigo-950 transition-transform group-hover:translate-x-0.5" />
            </div>
          ) : (
            /* Radiant Golden Sun */
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full bg-amber-300/60 animate-ping"
                style={{ animationDuration: '3.5s' }}
              />
              <div className="w-13 h-13 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 shadow-[0_0_44px_rgba(251,191,36,0.95)] border-2 border-white/80" />
            </div>
          )}
          <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 right-1/2 translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-white shadow">
            {isDark ? '☀️ Day' : '🌙 Night'}
          </span>
        </button>
      </div>

      {/* SEAMLESS SKY-TO-POND SHORELINE & MIST TRANSITION */}
      <div className="relative w-full h-14 shrink-0 pointer-events-none select-none z-10 -mb-1">
        {/* Soft atmospheric horizon mist blending sky into water */}
        <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-transparent via-sky-300/60 to-sky-400/90 dark:via-indigo-950/70 dark:to-sky-900/90 blur-sm" />

        {/* Distant grassy pond bank & cattail silhouettes along the shoreline */}
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className=" absolute inset-x-0 bottom-0 w-full h-16"
        >
          {/* Distant rolling shoreline bank */}
          <path
            d="M0,55 C240,22 480,68 740,42 C1020,16 1240,56 1440,34 L1440,90 L0,90 Z"
            className="fill-emerald-600/35 dark:fill-emerald-950/60"
          />
          {/* Back water wave */}
          <path
            d="M0,48 C200,74 440,26 720,52 C1000,76 1220,30 1440,50 L1440,90 L0,90 Z"
            className="fill-sky-400/65 dark:fill-sky-800/55 animate-wave-slow"
          />
          {/* Front water shoreline wave */}
          <path
            d="M0,62 C260,36 520,80 820,54 C1100,32 1300,72 1440,58 L1440,90 L0,90 Z"
            className="fill-sky-400 dark:fill-sky-900"
          />
          {/* Shoreline foam crest */}
          <path
            d="M0,62 C260,36 520,80 820,54 C1100,32 1300,72 1440,58"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      {/* POND WATER BASIN (Fills the rest of the screen below the shoreline transition) */}
      <div className="relative flex-1 w-full flex flex-col justify-center overflow-y-auto overflow-x-hidden bg-gradient-to-b from-sky-400 via-cyan-600 to-teal-900 dark:from-sky-900 dark:via-indigo-950 dark:to-slate-950">
        {/* Ambient Water Shimmer Lines inside the Pond */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35 dark:opacity-25">
          <div className="absolute top-[14%] left-[12%] w-36 h-1 rounded-full bg-white/50 animate-wave-slow" />
          <div className="absolute top-[30%] right-[22%] w-48 h-1 rounded-full bg-white/40 animate-wave-fast" />
          <div className="absolute top-[52%] left-[35%] w-56 h-1 rounded-full bg-white/30 animate-wave-slow" />
          <div className="absolute bottom-[18%] right-[15%] w-44 h-1 rounded-full bg-white/35 animate-wave-fast" />
        </div>

        {/* CENTRALIZED POND STAGE: Heading + Ducks + Hatching Egg Nest + Centered Organic Lily Pads */}
        <div className="relative z-20 max-w-5xl w-full mx-auto px-6 pt-2 pb-8 flex flex-col justify-center items-center gap-4 my-auto">
          {/* Centered Site Brand + "Get your ducks in a row." above the ducks */}
          <div className="relative z-30 flex flex-col items-center text-center gap-1 -mt-6 mb-4">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white/90 dark:text-indigo-200 drop-shadow">
              <span>🦆 Roadmap Builder</span>
            </div>

            <div
              onMouseEnter={() => setIsAligned(true)}
              onMouseLeave={() => setIsAligned(false)}
              onClick={() => setIsAligned((prev) => !prev)}
              role="button"
              tabIndex={0}
              data-testid="align-ducks-trigger"
              className="group inline-block rounded-2xl px-4 py-0.5 transition-all"
              title="Hover over this title to watch all the ducks swim into aligned rows!"
            >
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
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

          {/* 1. Open Pond Swimming Area (No boxy border so ducks swim naturally in the pond water) */}
          <div className="relative h-52 sm:h-60 w-full">
            {/* Subtle Alignment Swim Lanes shown when hovering "Get your ducks in a row" */}
            {isAligned &&
              Array.from({ length: numRows }).map((_, rIdx) => {
                const minY = numRows === 1 ? 54 : 26;
                const maxY = numRows === 1 ? 54 : 80;
                const topPct =
                  numRows === 1
                    ? 54
                    : minY + (rIdx / Math.max(1, numRows - 1)) * (maxY - minY);
                return (
                  <div
                    key={rIdx}
                    style={{ top: `${topPct + 5}%` }}
                    className="pointer-events-none absolute left-20 right-24 border-b border-dashed border-white/60 dark:border-amber-300/45 transition-opacity duration-500"
                  />
                );
              })}

            {/* Clickable Duck Egg in a Floating Lily-Pad Nest (Left Bank of the Pond) */}
            <button
              type="button"
              onClick={handleHatchEgg}
              data-testid="hatch-egg-btn"
              className="group absolute left-2 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center focus:outline-none -rotate-2 hover:rotate-0 transition-transform"
              title="Click the egg to hatch another duck into the pond!"
            >
              <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-300 text-slate-950 shadow-md border border-amber-500/40 group-hover:scale-105 transition-transform">
                Hatch Duck
              </span>
              <div className={isEggHatching ? 'animate-egg-wobble' : 'animate-duck-bob'}>
                <svg
                  viewBox="0 0 72 68"
                  className="w-16 h-15 drop-shadow-lg group-hover:scale-110 transition-transform"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Water ripple under egg nest */}
                  <ellipse cx="36" cy="57" rx="33" ry="8" fill="rgba(255,255,255,0.25)" />
                  {/* Floating Lily Pad & Nest Base */}
                  <ellipse cx="36" cy="54" rx="30" ry="9" fill="#15803d" stroke="#052e16" strokeWidth="2" />
                  <ellipse cx="36" cy="51" rx="23" ry="7" fill="#a16207" stroke="#451a03" strokeWidth="1.8" />
                  <path d="M16 50 Q36 56 56 50" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />

                  {/* Speckled Duck Egg */}
                  <path
                    d="M36 12 C25 12, 20 28, 22 42 C23 50, 49 50, 50 42 C52 28, 47 12, 36 12 Z"
                    fill="#fef9c3"
                    stroke="#0f172a"
                    strokeWidth="2.4"
                  />
                  {/* Egg Speckles */}
                  <circle cx="31" cy="24" r="1.8" fill="#d97706" opacity="0.65" />
                  <circle cx="41" cy="29" r="2.2" fill="#d97706" opacity="0.55" />
                  <circle cx="33" cy="36" r="1.5" fill="#b45309" opacity="0.6" />
                  <circle cx="42" cy="20" r="1.3" fill="#b45309" opacity="0.6" />

                  {/* Zigzag Crack Line */}
                  <path
                    d="M24 31 L31 28 L35 34 L41 29 L48 33"
                    stroke="#0f172a"
                    strokeWidth={isEggHatching ? '2.6' : '1.5'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isEggHatching ? '1' : '0.45'}
                  />
                </svg>
              </div>
            </button>

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
                      'left 650ms cubic-bezier(0.22, 1, 0.36, 1), top 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
                    zIndex: Math.round(pos.top ? parseFloat(pos.top) : 10),
                  }}
                  className="absolute"
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
                        className="animate-quack-float pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-md border border-slate-900/20 z-30"
                      >
                        {q.phrase}
                      </span>
                    ))}

                    <div
                      style={{
                        transform: `scaleX(${pos.flipX})`,
                        transition: 'transform 450ms ease',
                      }}
                      className="group-hover:scale-110 transition-transform"
                    >
                      <DuckSvg duck={duck} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating Milestone Diamond Buoy on the Right */}
            <div
              onClick={() => ducks[0] && triggerQuack(ducks[0].id)}
              role="button"
              tabIndex={0}
              className="hidden sm:flex flex-col items-center group cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-20 rotate-2 hover:rotate-0 transition-transform"
              title="Target Launch Milestone Buoy"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 mb-1 shadow-sm">
                Launch Gate
              </span>
              <div className="w-7 h-7 rotate-45 rounded-[6px] bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-2.5 h-2.5 rounded-[1px] bg-white" />
              </div>
              <div className="w-10 h-2.5 rounded-full bg-white/35 -mt-1" />
            </div>
          </div>

          {/* Error Alert if JSON upload fails */}
          {uploadError && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-500/25 backdrop-blur-md border border-rose-300/50 text-white text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* 2. Centered Organic Pond Actions: Staggered Floating Lily Pads flanked by Ambient Driftwood Logs */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 pt-2">
            {/* Decorative Left Mossy Driftwood Log in the Water */}
            <div className="hidden lg:flex items-center relative w-40 h-11 rounded-full bg-gradient-to-b from-amber-800 via-amber-900 to-stone-950 border-2 border-amber-950 shadow-[0_8px_18px_rgba(0,0,0,0.4)] -rotate-6 translate-y-4 opacity-90 pointer-events-none">
              <span className="absolute inset-x-2 -bottom-1.5 h-2 rounded-full border-b-2 border-white/30" />
              <span className="absolute -top-1 left-10 w-10 h-2.5 rounded-full bg-emerald-500/85" />
              {/* Full-Height Cylindrical Cut Wood-Ring End Cap */}
              <div className="absolute -left-2 -inset-y-[2px] w-7 rounded-[50%] bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 border-2 border-amber-950 flex items-center justify-center shadow-inner">
                <div className="w-4 h-[70%] rounded-[50%] border border-amber-800/60 flex items-center justify-center">
                  <div className="w-1.5 h-[40%] rounded-[50%] bg-amber-900/75" />
                </div>
              </div>
            </div>

            {/* Create Roadmap Floating Lotus Lily Pad (slightly higher & angled -2deg) */}
            <button
              type="button"
              onClick={onCreateRoadmap}
              data-testid="create-roadmap-btn"
              style={{ animationDelay: '0.15s' }}
              className="animate-duck-bob group relative w-60 -rotate-2 hover:rotate-0 -translate-y-1 flex flex-col items-center text-center px-6 py-5 rounded-[3.25rem] bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-800 hover:from-emerald-400 hover:to-teal-700 text-white border-2 border-emerald-300/75 shadow-[0_14px_32px_rgba(6,78,59,0.5)] transition-all hover:scale-105"
            >
              {/* Water ripple ring under the lily pad */}
              <span className="pointer-events-none absolute -inset-1.5 rounded-[3.5rem] border-2 border-white/30 opacity-70 group-hover:scale-105 transition-transform" />

              {/* Blooming Lotus Flower SVG on Lily Pad */}
              <svg viewBox="0 0 64 44" className="w-16 h-11 mb-1.5 group-hover:scale-110 transition-transform">
                <ellipse cx="32" cy="34" rx="26" ry="8" fill="#10b981" stroke="#064e3b" strokeWidth="2" />
                <path d="M32 34 L56 31" stroke="#064e3b" strokeWidth="2" />
                {/* Lotus Petals */}
                <path d="M32 10 C26 18, 24 28, 32 32 C40 28, 38 18, 32 10 Z" fill="#f472b6" stroke="#831843" strokeWidth="1.6" />
                <path d="M21 16 C20 24, 25 30, 32 32 C29 24, 26 19, 21 16 Z" fill="#fb7185" stroke="#831843" strokeWidth="1.5" />
                <path d="M43 16 C44 24, 39 30, 32 32 C35 24, 38 19, 43 16 Z" fill="#fb7185" stroke="#831843" strokeWidth="1.5" />
                <circle cx="32" cy="24" r="3" fill="#fde047" />
              </svg>

              <span className="font-extrabold text-base tracking-tight text-white drop-shadow-sm">
                Create Roadmap
              </span>
              <span className="text-xs text-emerald-100/95 mt-0.5">
                Start a blank map
              </span>
            </button>

            {/* Upload Roadmap Floating Bottle Lily Pad (staggered lower & angled +2.5deg) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-roadmap-btn"
              style={{ animationDelay: '0.85s' }}
              className="animate-duck-bob group relative w-60 rotate-2 hover:rotate-0 translate-y-2.5 flex flex-col items-center text-center px-6 py-5 rounded-[3.25rem] bg-gradient-to-b from-teal-500 via-cyan-700 to-teal-950 hover:from-teal-400 hover:to-cyan-800 text-white border-2 border-cyan-300/75 shadow-[0_14px_32px_rgba(8,145,178,0.5)] transition-all hover:scale-105"
            >
              <span className="pointer-events-none absolute -inset-1.5 rounded-[3.5rem] border-2 border-white/30 opacity-70 group-hover:scale-105 transition-transform" />

              {/* Floating Message-in-a-Bottle on Lily Pad SVG */}
              <svg viewBox="0 0 64 44" className="w-16 h-11 mb-1.5 group-hover:scale-110 transition-transform">
                <ellipse cx="32" cy="34" rx="26" ry="8" fill="#14b8a6" stroke="#134e4a" strokeWidth="2" />
                {/* Floating Glass Bottle with Scroll */}
                <g transform="rotate(-18 32 24)">
                  <rect x="20" y="17" width="22" height="12" rx="5" fill="rgba(224, 242, 254, 0.85)" stroke="#0f172a" strokeWidth="1.8" />
                  <rect x="41" y="20" width="5" height="6" rx="1" fill="rgba(224, 242, 254, 0.85)" stroke="#0f172a" strokeWidth="1.6" />
                  <rect x="45" y="20.5" width="3.5" height="5" rx="1" fill="#b45309" stroke="#0f172a" strokeWidth="1.2" />
                  {/* Rolled JSON Map Scroll inside */}
                  <rect x="24" y="20.5" width="14" height="5" rx="1.5" fill="#fde68a" stroke="#92400e" strokeWidth="1.2" />
                </g>
              </svg>

              <span className="font-extrabold text-base tracking-tight text-white drop-shadow-sm">
                Upload Roadmap
              </span>
              <span className="text-xs text-cyan-100/95 mt-0.5">
                Click or drop .json
              </span>
            </button>

            {/* Decorative Right Mossy Driftwood Log in the Water */}
            <div className="hidden lg:flex items-center justify-end relative w-40 h-11 rounded-full bg-gradient-to-b from-amber-800 via-amber-900 to-stone-950 border-2 border-amber-950 shadow-[0_8px_18px_rgba(0,0,0,0.4)] rotate-3 -translate-y-2 opacity-90 pointer-events-none">
              <span className="absolute inset-x-2 -bottom-1.5 h-2 rounded-full border-b-2 border-white/30" />
              <span className="absolute -top-1 right-12 w-9 h-2.5 rounded-full bg-emerald-500/85" />
              {/* Full-Height Cylindrical Cut Wood-Ring End Cap */}
              <div className="absolute -right-2 -inset-y-[2px] w-7 rounded-[50%] bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 border-2 border-amber-950 flex items-center justify-center shadow-inner">
                <div className="w-4 h-[70%] rounded-[50%] border border-amber-800/60 flex items-center justify-center">
                  <div className="w-1.5 h-[40%] rounded-[50%] bg-amber-900/75" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Foreground Bottom Waves */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 overflow-hidden opacity-40">
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className="w-[115%] h-full animate-wave-fast"
          >
            <path
              d="M0,30 C220,5 420,55 660,25 C900,0 1060,50 1200,25 L1200,60 L0,60 Z"
              fill="#0284c7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
