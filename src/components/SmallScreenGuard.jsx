import { useEffect, useState } from 'react';
import { Monitor, MoveHorizontal } from 'lucide-react';

const MIN_DESKTOP_WIDTH = 1920;
const FACE_CLOSEUP_WIDTH = 500;

const QUACKS_SMOOSHED = [
  'MY BEAK IS SMOOSHED ON THE GLASS!! 🦆',
  "HELP! I'M 100% FACE RIGHT NOW!",
  "I CAN'T EVEN FLAP MY WINGS IN HERE!",
  'TOO CRAMPED! NEED MORE POND!',
  'BACK ME UP! DRAG THE WINDOW WIDER!',
];

const QUACKS_MID = [
  'OKAY I CAN BREATHE A LITTLE...',
  'KEEP DRAGGING! MY TATTOOS NEED ROOM!',
  'GETTING WARMER! WADDLE ON! 🦆',
  'STILL TOO NARROW FOR TIMELINES!',
];

const QUACKS_CLOSE = [
  'ALMOST AT 1920PX! KEEP GOING!',
  'SO CLOSE! I CAN SEE THE OPEN POND!',
  'JUST A LITTLE WIDER! SHIP IT! 🦆',
];

function getMoodTier(width) {
  if (width < 950) return 'smooshed';
  if (width < 1500) return 'mid';
  return 'close';
}

function getPoolForTier(tier) {
  if (tier === 'smooshed') return QUACKS_SMOOSHED;
  if (tier === 'mid') return QUACKS_MID;
  return QUACKS_CLOSE;
}

export default function SmallScreenGuard() {
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [quackBubble, setQuackBubble] = useState(QUACKS_SMOOSHED[0]);
  const [isHopping, setIsHopping] = useState(false);

  const isTooSmall = windowWidth < MIN_DESKTOP_WIDTH;
  const moodTier = getMoodTier(windowWidth);

  useEffect(() => {
    const checkDeviceAndSize = () => {
      setWindowWidth(window.innerWidth);
      const ua = navigator.userAgent || '';
      const mobileRegex =
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isCoarse =
        window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      setIsMobileDevice(
        mobileRegex.test(ua) || (isCoarse && window.screen.width < 1024)
      );
    };

    checkDeviceAndSize();
    window.addEventListener('resize', checkDeviceAndSize);
    return () => window.removeEventListener('resize', checkDeviceAndSize);
  }, []);

  useEffect(() => {
    if (!isTooSmall) return;

    let idx = 0;
    const pool = getPoolForTier(moodTier);
    const interval = setInterval(() => {
      idx = (idx + 1) % pool.length;
      setQuackBubble(pool[idx]);
      setIsHopping(true);
      setTimeout(() => setIsHopping(false), 520);
    }, 2300);

    return () => clearInterval(interval);
  }, [isTooSmall, moodTier]);

  if (!isTooSmall) return null;

  // At <= 500px: closeness = 1.0 -> massive 9.5x scale anchored at his face (50% 30.5%) so his face fills the entire screen!
  // As window widens toward 1920px: closeness -> 0.0 -> smoothly backs away into the pond (scale ~ 1.15x)
  const clampedW = Math.max(
    FACE_CLOSEUP_WIDTH,
    Math.min(MIN_DESKTOP_WIDTH, windowWidth)
  );
  const closeness =
    (MIN_DESKTOP_WIDTH - clampedW) / (MIN_DESKTOP_WIDTH - FACE_CLOSEUP_WIDTH);
  const dynamicScale = (1.15 + Math.pow(closeness, 1.35) * 8.35).toFixed(3);
  const isPressedAgainstGlass = closeness > 0.35;

  const progressPct = Math.max(
    8,
    Math.min(99, Math.round((windowWidth / MIN_DESKTOP_WIDTH) * 100))
  );
  const pxRemaining = Math.max(0, MIN_DESKTOP_WIDTH - windowWidth);

  const meterGradient =
    moodTier === 'smooshed'
      ? 'from-rose-500 via-orange-500 to-amber-400'
      : moodTier === 'mid'
      ? 'from-amber-500 via-yellow-400 to-emerald-400'
      : 'from-emerald-400 via-teal-300 to-cyan-300';

  return (
    <div
      data-testid="small-screen-guard"
      className="fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none text-center bg-gradient-to-b from-amber-100 via-sky-200 to-sky-300 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 transition-colors duration-500"
    >
      {/* 1. SCENIC 3D PERSPECTIVE MEADOW & WINDING DIRT/STEPPING-STONE PATH */}
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        {/* Upper Sky Zone (~16% height so the trailhead starts on the hill crest, never in the sky) */}
        <div className="relative h-[16vh] w-full shrink-0 overflow-hidden">
          {/* Illustrated Sky Vector Clouds (Light Mode) & Twinkling 4-Point Stars (Dark Mode) */}
          <svg
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <linearGradient id="cloudGradGuard" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                <stop offset="70%" stopColor="#f0f9ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.78" />
              </linearGradient>
            </defs>

            {/* Light Mode Fluffy Storybook Vector Clouds */}
            <g className="dark:hidden">
              <g transform="translate(170, 26)">
                <path
                  d="M24,46 L126,46 C140,46 148,36 144,25 C140,15 128,14 122,17 C116,4 98,-2 82,4 C68,-4 46,2 40,16 C26,14 12,24 14,36 C15,42 19,46 24,46 Z"
                  fill="url(#cloudGradGuard)"
                  stroke="#e0f2fe"
                  strokeWidth="1.5"
                />
                <path
                  d="M42,18 C52,8 72,6 84,12"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              <g transform="translate(880, 32) scale(0.9)">
                <path
                  d="M24,46 L136,46 C150,46 158,36 154,25 C150,15 138,14 132,17 C126,4 108,-2 92,4 C78,-4 56,2 50,16 C36,14 18,24 20,36 C21,42 22,46 24,46 Z"
                  fill="url(#cloudGradGuard)"
                  stroke="#e0f2fe"
                  strokeWidth="1.5"
                />
              </g>
            </g>

            {/* Dark Mode Twinkling 4-Point Vector Stars */}
            <g className="hidden dark:block">
              <path
                d="M210,22 L213,30 L221,33 L213,36 L210,44 L207,36 L199,33 L207,30 Z"
                fill="#fef08a"
                opacity="0.9"
              />
              <path
                d="M520,38 L522,44 L528,46 L522,48 L520,54 L518,48 L512,46 L518,44 Z"
                fill="#e2e8f0"
                opacity="0.8"
              />
              <path
                d="M940,24 L943,31 L950,34 L943,37 L940,44 L937,37 L930,34 L937,31 Z"
                fill="#fef08a"
                opacity="0.85"
              />
              <path
                d="M1210,42 L1212,47 L1217,49 L1212,51 L1210,56 L1208,51 L1203,49 L1208,47 Z"
                fill="#bae6fd"
                opacity="0.85"
              />
              <circle cx="360" cy="28" r="1.8" fill="#fef9c3" opacity="0.75" />
              <circle cx="740" cy="24" r="2" fill="#e0f2fe" opacity="0.7" />
              <circle cx="1090" cy="30" r="1.6" fill="#fef08a" opacity="0.75" />
            </g>
          </svg>
        </div>

        {/* 3D Perspective Rolling Hills & Winding Trail Leading Straight to the Screen */}
        <div className="relative flex-1 w-full overflow-hidden">
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
              <circle cx="385" cy="40" r="22" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.8" />
              <path d="M372,30 C378,22 390,22 396,28" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

              <rect x="405" y="56" width="5" height="14" rx="1.5" fill="#78350f" />
              <circle cx="408" cy="46" r="18" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.6" />

              <polygon points="440,58 454,16 468,58" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.6" strokeLinejoin="round" />
              <polygon points="472,62 484,24 496,62" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.6" strokeLinejoin="round" />

              {/* Right Horizon Trees */}
              <polygon points="732,58 746,16 760,58" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.6" strokeLinejoin="round" />
              <polygon points="704,62 716,24 728,62" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.6" strokeLinejoin="round" />

              <rect x="789" y="56" width="5" height="14" rx="1.5" fill="#78350f" />
              <circle cx="792" cy="46" r="18" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.6" />

              <rect x="812" y="54" width="6" height="16" rx="2" fill="#78350f" />
              <circle cx="815" cy="40" r="22" fill="url(#treeCanopyGuard)" stroke="#064e3b" strokeWidth="1.8" />
              <path d="M802,30 C808,22 820,22 826,28" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
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
              <ellipse
                cx="600"
                cy="137"
                rx="96"
                ry="11.5"
                fill="rgba(224,242,254,0.22)"
              />
              {/* Luminous Water Shimmer Lines on the Distant Pond */}
              <line x1="535" y1="133" x2="578" y2="133" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
              <line x1="612" y1="140" x2="665" y2="140" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
              {/* Miniature Illustrated Lily Pads & Lotus in the Distant Pond */}
              <ellipse cx="520" cy="138" rx="9.5" ry="3.2" fill="#10b981" stroke="#065f46" strokeWidth="0.9" />
              <ellipse cx="672" cy="135" rx="10.5" ry="3.4" fill="#10b981" stroke="#065f46" strokeWidth="0.9" />
              <circle cx="672" cy="133.2" r="2.4" fill="#f472b6" stroke="#be185d" strokeWidth="0.6" />
              {/* Tiny Distant Duck Swimming in the Background Pond */}
              <ellipse cx="568" cy="134" rx="5" ry="2.6" fill="#fbbf24" stroke="#78350f" strokeWidth="0.8" />
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
            <g className="stroke-emerald-800 dark:stroke-emerald-400/55" strokeWidth="3" strokeLinecap="round">
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
        </div>
      </div>

      {/* TOP BAR: Viewport-Safe Quack Speech Bubble */}
      <div className="relative z-40 pt-4 px-4 sm:px-6 w-full flex items-center justify-center shrink-0 pointer-events-none">
        <div
          key={quackBubble}
          className="animate-quack-float relative mb-2 max-w-[88vw] sm:max-w-md px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white drop-shadow-[0_2px_6px_rgba(15,23,42,0.6)] break-words text-center bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-xl border border-white/50 dark:border-indigo-400/40 shadow-[0_12px_32px_rgba(15,23,42,0.35),inset_0_1px_2px_rgba(255,255,255,0.7)]"
        >
          {quackBubble}
          <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-900/90 dark:bg-slate-950/90 border-r border-b border-white/50 dark:border-indigo-400/40" />
        </div>
      </div>

      {/* 2. ANIMATED DUCK STAGE: Waddles down the dirt path from the hill crest and smooshes his face against the glass! */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full pointer-events-none">
        <div className="animate-duck-approach relative flex items-center justify-center">
          {/* Dynamic Proximity Wrapper: Anchored right between his glasses & beak (50% 30.5%) */}
          <div
            style={{
              transform: `scale(${dynamicScale})`,
              transformOrigin: '50% 30.5%',
              transition: 'transform 120ms ease-out',
            }}
            className="relative flex flex-col items-center pointer-events-auto"
          >
            <div
              onClick={() => {
                const pool = getPoolForTier(moodTier);
                setQuackBubble(pool[Math.floor(Math.random() * pool.length)]);
                setIsHopping(true);
                setTimeout(() => setIsHopping(false), 500);
              }}
              className={`cursor-pointer relative ${
                isHopping ? 'animate-duck-hop' : 'animate-duck-bob'
              }`}
              title="Click to quack!"
            >
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
                <ellipse
                  cx="90"
                  cy="155"
                  rx="62"
                  ry="10"
                  fill="rgba(28, 25, 23, 0.38)"
                />
                <ellipse
                  cx="90"
                  cy="155"
                  rx="42"
                  ry="6"
                  fill="rgba(28, 25, 23, 0.52)"
                />
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
                <g
                  opacity="0.88"
                  fill="#0f172a"
                  stroke="#0f172a"
                  strokeLinecap="round"
                >
                  <ellipse
                    cx="107"
                    cy="107"
                    rx="5.5"
                    ry="6"
                    transform="rotate(8 107 107)"
                  />
                  <line x1="101" y1="106" x2="96" y2="102" strokeWidth="2.2" />
                  <line x1="103" y1="101" x2="100" y2="93" strokeWidth="2.1" />
                  <line x1="106.5" y1="100" x2="106" y2="91" strokeWidth="2.2" />
                  <line x1="110" y1="101" x2="112" y2="92.5" strokeWidth="2.1" />
                  <line
                    x1="112.5"
                    y1="103"
                    x2="116.5"
                    y2="96.5"
                    strokeWidth="1.9"
                  />
                </g>

                {/* 2. Two Small Black Handprints on His Right Chest (Viewer's Left) */}
                <g
                  opacity="0.88"
                  fill="#0f172a"
                  stroke="#0f172a"
                  strokeLinecap="round"
                >
                  <ellipse
                    cx="66"
                    cy="101"
                    rx="3"
                    ry="3.3"
                    transform="rotate(-10 66 101)"
                  />
                  <line x1="69" y1="100" x2="72" y2="98" strokeWidth="1.3" />
                  <line x1="68" y1="98" x2="69" y2="93.5" strokeWidth="1.3" />
                  <line x1="66" y1="97.5" x2="65.5" y2="92.5" strokeWidth="1.3" />
                  <line x1="64" y1="98" x2="62.5" y2="93.5" strokeWidth="1.2" />
                  <line x1="62.5" y1="99.5" x2="60" y2="96" strokeWidth="1.1" />

                  <ellipse
                    cx="77"
                    cy="110"
                    rx="2.8"
                    ry="3.1"
                    transform="rotate(-5 77 110)"
                  />
                  <line x1="80" y1="109" x2="82.5" y2="107" strokeWidth="1.2" />
                  <line
                    x1="78.5"
                    y1="107"
                    x2="79.5"
                    y2="103"
                    strokeWidth="1.2"
                  />
                  <line x1="77" y1="106.5" x2="76.8" y2="102" strokeWidth="1.2" />
                  <line x1="75" y1="107" x2="73.8" y2="103" strokeWidth="1.1" />
                  <line
                    x1="73.8"
                    y1="108.5"
                    x2="71.5"
                    y2="105.5"
                    strokeWidth="1.1"
                  />
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
                <g
                  opacity="0.92"
                  transform="translate(147, 106) rotate(26)"
                  stroke="#0f172a"
                  fill="#0f172a"
                >
                  {/* SG Clipped-Ear Open-Book Headstock */}
                  <path
                    d="M-1.8 -18.5 L-2.2 -13.5 L2.2 -13.5 L1.8 -18.5 L0.7 -17.9 L0 -18.6 L-0.7 -17.9 Z"
                    fill="#0f172a"
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                  />
                  {/* 3+3 Tuning Pegs */}
                  <line
                    x1="-3.3"
                    y1="-17.5"
                    x2="-2"
                    y2="-17.5"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <line
                    x1="-3.3"
                    y1="-16"
                    x2="-2"
                    y2="-16"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <line
                    x1="-3.3"
                    y1="-14.5"
                    x2="-2"
                    y2="-14.5"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <line
                    x1="2"
                    y1="-17.5"
                    x2="3.3"
                    y2="-17.5"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <line
                    x1="2"
                    y1="-16"
                    x2="3.3"
                    y2="-16"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <line
                    x1="2"
                    y1="-14.5"
                    x2="3.3"
                    y2="-14.5"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />

                  {/* Guitar Neck */}
                  <rect
                    x="-1.1"
                    y="-13.5"
                    width="2.2"
                    height="14.5"
                    fill="#0f172a"
                  />

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
                <circle
                  cx="90"
                  cy="52"
                  r="31"
                  fill="url(#guardHeadG)"
                  stroke="#78350f"
                  strokeWidth="3.5"
                />
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
                  <path
                    d="M85 40 Q90 37 95 40"
                    stroke="#1e293b"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

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
                  <g
                    opacity={isHopping ? '0.52' : '0.32'}
                    style={{ transition: 'opacity 250ms ease' }}
                  >
                    <ellipse
                      cx="90"
                      cy="60"
                      rx={isHopping ? '30' : '25'}
                      ry={isHopping ? '14' : '11.5'}
                      fill="rgba(255, 255, 255, 0.45)"
                    />
                    <ellipse
                      cx="90"
                      cy="60"
                      rx="18"
                      ry="8"
                      fill="rgba(255, 255, 255, 0.35)"
                    />
                  </g>
                )}

                {/* Duck Beak (Smooshed wide & flat when pressed against the screen glass!) */}
                <g
                  style={{
                    transform: isPressedAgainstGlass
                      ? 'scaleX(1.26) scaleY(0.84)'
                      : 'scale(1)',
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
                    <ellipse
                      cx="90"
                      cy="57.5"
                      rx="11"
                      ry="2.6"
                      fill="rgba(255, 255, 255, 0.48)"
                    />
                  )}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 5. STAKED WOODEN TRAIL SIGNPOST WITH LIVE POND EXPANSION METER */}
      <div className="relative z-40 pb-6 pt-3 px-4 sm:px-8 w-full flex justify-center shrink-0">
        <div className="relative w-full max-w-lg flex flex-col items-center">
          {/* Nailed Horizontal Wooden Plank Signboard */}
          <div className="relative z-10 w-full rounded-3xl px-6 py-4 text-white bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-xl border border-white/50 dark:border-indigo-400/40 shadow-[0_12px_32px_rgba(15,23,42,0.35),inset_0_1px_2px_rgba(255,255,255,0.7)]">
            <div className="relative z-10 space-y-2">
              {/* Carved Trailhead Badge Pill */}
              <div className="inline-flex items-center gap-2 text-amber-200 text-[11px] font-extrabold uppercase tracking-wider">
                {isMobileDevice ? (
                  <>
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop Pond Required</span>
                  </>
                ) : (
                  <>
                    <MoveHorizontal className="w-3.5 h-3.5 animate-pulse" />
                    <span>
                      {moodTier === 'smooshed'
                        ? 'Smooshed Against the Glass!'
                        : moodTier === 'mid'
                        ? 'Trail Still Too Narrow'
                        : 'Almost Back to the Pond!'}
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-amber-50 leading-snug drop-shadow-sm">
                {isMobileDevice
                  ? 'This is a terrible experience on mobile.'
                  : 'This is a terrible experience at this window size.'}
              </h2>

              <p className="text-xs text-amber-100 leading-relaxed">
                {isMobileDevice
                  ? 'Multi-track timelines and drag-and-drop roadmaps need a full 1920px desktop pond to spread their wings!'
                  : 'My face is squished against your screen! Drag your browser window wider so I can waddle back up the trail to the pond.'}
              </p>

              {/* 3. Interactive Live "Pond Expansion Meter" Progress Bar with Carved Wooden Duck */}
              {!isMobileDevice && (
                <div className="pt-2 space-y-1.5">
                  <div className="relative h-5 w-full rounded-full bg-slate-950/85 border border-amber-500/40 p-0.5 shadow-inner flex items-center">
                    {/* Animated Fill Track */}
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${meterGradient} transition-all duration-150 relative flex items-center`}
                    >
                      {/* Carved Wooden Duck Decoy Riding the Slider Thumb (Luminous Vector Style) */}
                      <div className="absolute -right-3.5 -top-2.5 w-8 h-8 flex items-center justify-center drop-shadow-[0_3px_5px_rgba(0,0,0,0.7)]">
                        <svg
                          viewBox="0 0 36 32"
                          className="w-7 h-7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <radialGradient id="decoyBodyG" cx="40%" cy="30%" r="70%">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="55%" stopColor="#b45309" />
                              <stop offset="100%" stopColor="#78350f" />
                            </radialGradient>
                            <linearGradient id="decoyWingG" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#d97706" />
                              <stop offset="100%" stopColor="#78350f" />
                            </linearGradient>
                            <linearGradient id="decoyBeakG" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#92400e" />
                              <stop offset="100%" stopColor="#451a03" />
                            </linearGradient>
                          </defs>
                          {/* Carved Oak Duck Body */}
                          <path
                            d="M5 20 C4 15, 9 13, 16 14 C20 14.5, 24 13, 25 10 C26 14, 28 20, 24 24.5 C20 28, 10 28, 6.5 24 C5.5 23, 5 21, 5 20 Z"
                            fill="url(#decoyBodyG)"
                            stroke="#451a03"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                          {/* Specular Polished Wood Back Highlight */}
                          <path
                            d="M8 15.5 Q14 14.5 19 15.5"
                            stroke="rgba(254,243,199,0.55)"
                            strokeWidth="1"
                            strokeLinecap="round"
                          />
                          {/* Wood Grain Lines on Body */}
                          <path
                            d="M8 21 Q15 19 22 21 M10 24 Q16 23 21 24"
                            stroke="#451a03"
                            strokeWidth="1"
                            strokeLinecap="round"
                            opacity="0.65"
                          />
                          {/* Carved Wing */}
                          <path
                            d="M10 17.5 C14 16, 19 17, 19 20.5 C19 22.5, 14 23.5, 10 21.5 Z"
                            fill="url(#decoyWingG)"
                            stroke="#451a03"
                            strokeWidth="1.3"
                          />
                          {/* Carved Wooden Head */}
                          <circle
                            cx="23"
                            cy="10.5"
                            r="5.2"
                            fill="url(#decoyBodyG)"
                            stroke="#451a03"
                            strokeWidth="1.6"
                          />
                          {/* Head Crown Specular Shine */}
                          <path
                            d="M20.5 7.2 Q23 6 25.5 7.2"
                            stroke="rgba(254,243,199,0.65)"
                            strokeWidth="1"
                            strokeLinecap="round"
                          />
                          {/* Dark Walnut Beak */}
                          <path
                            d="M27.5 9.5 C31 9.5, 33 11, 31.5 12.5 C30 13.5, 27.5 13, 27.5 13 Z"
                            fill="url(#decoyBeakG)"
                            stroke="#451a03"
                            strokeWidth="1.3"
                          />
                          {/* Gleaming Brass Pin Eye */}
                          <circle
                            cx="24.5"
                            cy="9.5"
                            r="1.3"
                            fill="#fde047"
                            stroke="#451a03"
                            strokeWidth="0.7"
                          />
                          <circle cx="24.2" cy="9.2" r="0.45" fill="#ffffff" />
                        </svg>
                      </div>
                    </div>
                    {/* Target 1920px Launch Buoy Gem Marker on Right Edge */}
                    <span
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-amber-200 via-amber-400 to-orange-600 border border-amber-100 shadow"
                      title="Target: 1920px"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-200/90 px-1">
                    <span>
                      Current:{' '}
                      <strong className="text-amber-300">{windowWidth}px</strong>
                    </span>
                    <span className="text-emerald-300 font-bold">
                      ← +{pxRemaining}px to {MIN_DESKTOP_WIDTH}px →
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
