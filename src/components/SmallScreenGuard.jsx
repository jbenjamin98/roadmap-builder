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
        <div className="relative h-[16vh] w-full shrink-0">
          {/* Sky Stars / Clouds */}
          <span className="hidden dark:block absolute top-5 left-[16%] w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          <span className="hidden dark:block absolute top-9 left-[44%] w-1 h-1 rounded-full bg-amber-200/80 animate-ping" />
          <span className="hidden dark:block absolute top-6 left-[72%] w-1.5 h-1.5 rounded-full bg-indigo-200/80 animate-pulse" />
          <div className="dark:hidden absolute top-5 left-[18%] w-36 h-8 rounded-full bg-white/70 blur-md" />
          <div className="dark:hidden absolute top-7 left-[58%] w-44 h-9 rounded-full bg-white/60 blur-md" />
        </div>

        {/* 3D Perspective Rolling Hills & Winding Trail Leading Straight to the Screen */}
        <div className="relative flex-1 w-full overflow-hidden">
          <svg
            viewBox="0 0 1200 900"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* Distant Left & Right Rolling Hills on the Horizon */}
            <path
              d="M0,70 C180,10 410,30 600,68 C790,30 1020,10 1200,70 L1200,900 L0,900 Z"
              className="fill-emerald-700 dark:fill-emerald-950"
            />

            {/* Distant Pine & Oak Tree Silhouettes Flanking the Trailhead */}
            <g className="fill-emerald-900/75 dark:fill-slate-950/85">
              {/* Left Horizon Trees */}
              <polygon points="440,56 454,18 468,56" />
              <polygon points="472,60 484,26 496,60" />
              <circle cx="385" cy="42" r="22" />
              <circle cx="408" cy="48" r="18" />
              {/* Right Horizon Trees */}
              <polygon points="732,56 746,18 760,56" />
              <polygon points="704,60 716,26 728,60" />
              <circle cx="815" cy="42" r="22" />
              <circle cx="792" cy="48" r="18" />
            </g>

            {/* Mid-Ground Lush Meadow Grass Slopes */}
            <path
              d="M0,110 C250,65 440,85 600,72 C760,85 950,65 1200,110 L1200,900 L0,900 Z"
              className="fill-emerald-600 dark:fill-emerald-900/90"
            />

            {/* SMALL DISTANT POND WAY OFF IN THE BACKGROUND (Where the Trail Starts!) */}
            <g>
              {/* Distant Pond Sandy / Muddy Shoreline Bank */}
              <ellipse
                cx="600"
                cy="86"
                rx="145"
                ry="24"
                className="fill-amber-200/80 dark:fill-amber-950/90"
              />
              {/* Distant Pond Shimmering Water Basin */}
              <ellipse
                cx="600"
                cy="85"
                rx="132"
                ry="19"
                className="fill-sky-400 dark:fill-sky-700 stroke-sky-200/60 dark:stroke-sky-400/35"
                strokeWidth="2"
              />
              {/* Inner Deep Pond Water Reflection */}
              <ellipse
                cx="600"
                cy="85"
                rx="98"
                ry="12"
                className="fill-cyan-500/65 dark:fill-indigo-900/75"
              />
              {/* Tiny Water Shimmer Lines on the Distant Pond */}
              <line x1="535" y1="81" x2="575" y2="81" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="615" y1="88" x2="665" y2="88" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" strokeLinecap="round" />
              {/* Miniature Floating Lily Pads in the Distant Pond */}
              <ellipse cx="520" cy="86" rx="9" ry="3" fill="#10b981" />
              <ellipse cx="672" cy="83" rx="10" ry="3.2" fill="#10b981" />
              <circle cx="672" cy="81.5" r="2" fill="#f472b6" />
              {/* Tiny Distant Duck Silhouette Swimming in the Background Pond */}
              <ellipse cx="568" cy="82" rx="4.5" ry="2.4" fill="#fbbf24" />
              <circle cx="572" cy="79.5" r="2.2" fill="#fbbf24" />
              {/* Tiny Cattail Reeds on the Pond Bank */}
              <g className="stroke-emerald-900 dark:stroke-emerald-400/50" strokeWidth="2" strokeLinecap="round">
                <line x1="468" y1="86" x2="464" y2="68" />
                <line x1="474" y1="88" x2="473" y2="71" />
                <line x1="726" y1="88" x2="728" y2="70" />
                <line x1="732" y1="86" x2="736" y2="68" />
              </g>
            </g>

            {/* Outer Grassy Verge / Trail Border Winding Down from the Front Shore of the Distant Pond */}
            <path
              d="M 578,100
                 C 545,225 470,390 310,605
                 C 210,735 110,835 30,900
                 L 1170,900
                 C 1090,835 990,735 890,605
                 C 730,390 655,225 622,100 Z"
              className="fill-amber-900/45 dark:fill-stone-950/75"
            />

            {/* Main 3D Perspective Winding Dirt & Cobblestone Path */}
            <path
              d="M 584,100
                 C 554,225 485,390 335,605
                 C 240,735 145,835 70,900
                 L 1130,900
                 C 1055,835 960,735 865,605
                 C 715,390 646,225 616,100 Z"
              className="fill-amber-200 dark:fill-amber-950"
            />

            {/* Inner Warm Sandy Trail Center */}
            <path
              d="M 590,100
                 C 566,228 510,395 380,610
                 C 295,740 215,838 150,900
                 L 1050,900
                 C 985,838 905,740 820,610
                 C 690,395 634,228 610,100 Z"
              className="fill-amber-300/80 dark:fill-amber-900/80"
            />

            {/* Perspective Stepping Stones & Cobblestones Scaling Up Along the Path */}
            <g className="fill-stone-400/70 dark:fill-stone-700/65 stroke-stone-600/40 dark:stroke-stone-950/60" strokeWidth="2">
              <ellipse cx="600" cy="115" rx="10" ry="3.5" />
              <ellipse cx="594" cy="155" rx="16" ry="5" />
              <ellipse cx="608" cy="205" rx="24" ry="7.5" />
              <ellipse cx="585" cy="270" rx="34" ry="10.5" />
              <ellipse cx="618" cy="350" rx="48" ry="14" />
              <ellipse cx="572" cy="450" rx="66" ry="19" />
              <ellipse cx="628" cy="575" rx="88" ry="25" />
              <ellipse cx="560" cy="725" rx="115" ry="32" />
            </g>

            {/* Roadside Grass Tufts & Wildflowers Along the Path Edges */}
            <g className="stroke-emerald-800 dark:stroke-emerald-500/40" strokeWidth="3" strokeLinecap="round">
              {/* Left Meadow Tufts */}
              <path d="M220,320 L212,298 M220,320 L222,295 M220,320 L230,302" />
              <path d="M150,520 L138,490 M150,520 L152,486 M150,520 L164,494" />
              <path d="M90,710 L75,672 M90,710 L92,668 M90,710 L106,676" />
              {/* Right Meadow Tufts */}
              <path d="M980,320 L970,302 M980,320 L978,295 M980,320 L988,298" />
              <path d="M1050,520 L1036,494 M1050,520 L1048,486 M1050,520 L1062,490" />
              <path d="M1110,710 L1094,676 M1110,710 L1108,668 M1110,710 L1125,672" />
            </g>
          </svg>
        </div>
      </div>

      {/* TOP BAR: Viewport-Safe Quack Speech Bubble */}
      <div className="relative z-40 pt-4 px-4 sm:px-6 w-full flex items-center justify-center shrink-0 pointer-events-none">
        <div
          key={quackBubble}
          className="animate-quack-float max-w-[88vw] sm:max-w-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-amber-300 text-slate-950 shadow-[0_10px_25px_rgba(0,0,0,0.45)] border-2 border-slate-900 break-words text-center"
        >
          {quackBubble}
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
                <circle cx="46" cy="153" r="2.2" fill="#78716c" opacity="0.7" />
                <circle cx="135" cy="154" r="2.5" fill="#78716c" opacity="0.7" />
                <circle cx="124" cy="159" r="1.6" fill="#a8a29e" opacity="0.65" />

                {/* Little Animated Webbed Feet Waddling Underneath */}
                <g className="animate-foot-left">
                  <path
                    d="M68 134 L64 148 M64 148 L52 154 L60 156 L66 158 L74 155 Z"
                    fill="#f97316"
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <g className="animate-foot-right">
                  <path
                    d="M112 134 L116 148 M116 148 L106 155 L114 158 L120 156 L128 154 Z"
                    fill="#f97316"
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Plump Duck Body */}
                <path
                  d="M38 108 C30 82, 54 68, 90 68 C126 68, 150 82, 142 108 C136 132, 116 142, 90 142 C64 142, 44 132, 38 108 Z"
                  fill="#fbbf24"
                  stroke="#0f172a"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {/* CHEST TATTOOS (ALL BLACK INK) */}
                {/* 1. Large Black Handprint on His Left Chest (Viewer's Right) */}
                <g
                  opacity="0.86"
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
                  opacity="0.86"
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
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
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
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
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
                  fill="#fbbf24"
                  stroke="#0f172a"
                  strokeWidth="4"
                />

                {/* Textured Full Brown Beard & Sideburns Wrapping the Jaw */}
                <path
                  d="M59 49 C57 62, 62 78, 73 84 C81 89, 99 89, 107 84 C118 78, 123 62, 121 49 C118 54, 114 58, 109 61 C102 66, 78 66, 71 61 C66 58, 62 54, 59 49 Z"
                  fill="#5c3a21"
                  stroke="#29180d"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M64 56 C70 62, 80 65, 90 65 C100 65, 110 62, 116 56"
                  stroke="#7c5132"
                  strokeWidth="2.5"
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
                <circle cx="75.4" cy="42.5" r="1.5" fill="#ffffff" />
                <circle cx="106" cy="44" r="4.2" fill="#0f172a" />
                <circle cx="107.4" cy="42.5" r="1.5" fill="#ffffff" />

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
                    fill="rgba(255, 255, 255, 0.16)"
                    stroke="#1e293b"
                    strokeWidth="3.4"
                    strokeLinejoin="round"
                  />
                  {/* Right Round-Angled Lens Frame */}
                  <path
                    d="M118 39 L108 34 L95 38 C93 45, 96 54, 106 54 C116 54, 120 46, 118 39 Z"
                    fill="rgba(255, 255, 255, 0.16)"
                    stroke="#1e293b"
                    strokeWidth="3.4"
                    strokeLinejoin="round"
                  />

                  {/* Bridge */}
                  <path
                    d="M85 40 Q90 37 95 40"
                    stroke="#1e293b"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Lens Glare */}
                  <line
                    x1="66"
                    y1="40"
                    x2="70"
                    y2="48"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="100"
                    y1="40"
                    x2="104"
                    y2="48"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="2"
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
                    fill="#f97316"
                    stroke="#0f172a"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M77 61 C83 68, 97 68, 103 61"
                    fill="#ef4444"
                    stroke="#0f172a"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  {/* Smooshed Beak-Against-Glass Flat Contact Highlight */}
                  {isPressedAgainstGlass && (
                    <ellipse
                      cx="90"
                      cy="57.5"
                      rx="11"
                      ry="2.6"
                      fill="rgba(255, 255, 255, 0.42)"
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
          {/* Vertical Wooden Signpost Stake (Top Cap Peeking Above + Post Planted Into Ground Below) */}
          <div className="pointer-events-none absolute -top-4 -bottom-8 left-1/2 -translate-x-1/2 w-10 sm:w-12 flex flex-col items-center z-0">
            {/* Pointed Pyramid Post Top Cap */}
            <div
              className="w-12 sm:w-14 h-3.5 bg-gradient-to-b from-amber-700 to-amber-950 border-2 border-amber-950 rounded-t-md shadow-md"
              style={{ clipPath: 'polygon(14% 0%, 86% 0%, 100% 100%, 0% 100%)' }}
            />
            {/* Main Vertical Timber Stake */}
            <div className="w-full flex-1 bg-gradient-to-r from-amber-950 via-amber-800 to-stone-950 border-x-[3px] border-amber-950 shadow-[0_10px_25px_rgba(0,0,0,0.7)] relative overflow-hidden">
              {/* Vertical Wood Grain Lines on Post */}
              <span className="absolute inset-y-0 left-2.5 w-[1px] bg-amber-950/70" />
              <span className="absolute inset-y-0 right-3 w-[1px] bg-amber-600/20" />
            </div>
            {/* Grass Tufts & Dirt Mound at the Base of the Post */}
            <svg
              viewBox="0 0 80 24"
              className="absolute -bottom-1 w-20 h-6"
              fill="none"
            >
              <ellipse cx="40" cy="20" rx="34" ry="5" fill="#292524" opacity="0.85" />
              <path
                d="M18 20 L12 8 M24 20 L21 6 M30 20 L29 10 M50 20 L52 9 M56 20 L60 6 M62 20 L68 9"
                stroke="#15803d"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Nailed Horizontal Wooden Plank Signboard */}
          <div className="relative z-10 w-full rounded-2xl bg-gradient-to-b from-amber-800 via-amber-900 to-stone-950 border-[3px] border-amber-950 px-6 py-4 shadow-[0_18px_38px_rgba(0,0,0,0.7)] text-amber-50 overflow-hidden">
            {/* Horizontal Timber Plank Seams */}
            <span className="pointer-events-none absolute inset-x-0 top-1/3 h-[2px] bg-amber-950/75 border-b border-amber-600/15" />
            <span className="pointer-events-none absolute inset-x-0 top-2/3 h-[2px] bg-amber-950/75 border-b border-amber-600/15" />

            {/* Top Edge Bevel Highlight */}
            <span className="pointer-events-none absolute inset-x-3 top-1 h-[1px] bg-amber-400/25 rounded-full" />

            {/* 4 Forged Iron Corner Nail / Bolt Heads + 2 Center Post Bolts */}
            <span className="pointer-events-none absolute top-2.5 left-3 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-950 shadow-inner" />
            <span className="pointer-events-none absolute top-2.5 right-3 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-950 shadow-inner" />
            <span className="pointer-events-none absolute bottom-2.5 left-3 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-950 shadow-inner" />
            <span className="pointer-events-none absolute bottom-2.5 right-3 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-950 shadow-inner" />
            <span className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-stone-600 border border-stone-950 shadow" />
            <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-stone-600 border border-stone-950 shadow" />

            {/* Little Moss Patch on the Top-Left Corner of the Signboard */}
            <span className="pointer-events-none absolute -top-1 left-8 w-12 h-2.5 rounded-full bg-emerald-600/85" />

            <div className="relative z-10 space-y-2">
              {/* Carved Trailhead Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-950/85 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
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

              <p className="text-xs text-amber-200/95 leading-relaxed">
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
                      {/* Carved Wooden Duck Decoy Riding the Slider Thumb */}
                      <div className="absolute -right-3.5 -top-2.5 w-8 h-8 flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]">
                        <svg
                          viewBox="0 0 36 32"
                          className="w-7 h-7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Carved Oak Duck Body */}
                          <path
                            d="M5 20 C4 15, 9 13, 16 14 C20 14.5, 24 13, 25 10 C26 14, 28 20, 24 24.5 C20 28, 10 28, 6.5 24 C5.5 23, 5 21, 5 20 Z"
                            fill="#b45309"
                            stroke="#451a03"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          {/* Wood Grain Lines on Body */}
                          <path
                            d="M8 21 Q15 19 22 21 M10 24 Q16 23 21 24"
                            stroke="#78350f"
                            strokeWidth="1.1"
                            strokeLinecap="round"
                          />
                          {/* Carved Wing */}
                          <path
                            d="M10 17.5 C14 16, 19 17, 19 20.5 C19 22.5, 14 23.5, 10 21.5 Z"
                            fill="#92400e"
                            stroke="#451a03"
                            strokeWidth="1.4"
                          />
                          {/* Carved Wooden Head */}
                          <circle
                            cx="23"
                            cy="10.5"
                            r="5.2"
                            fill="#b45309"
                            stroke="#451a03"
                            strokeWidth="1.8"
                          />
                          {/* Dark Walnut Beak */}
                          <path
                            d="M27.5 9.5 C31 9.5, 33 11, 31.5 12.5 C30 13.5, 27.5 13, 27.5 13 Z"
                            fill="#78350f"
                            stroke="#451a03"
                            strokeWidth="1.4"
                          />
                          {/* Brass Pin Eye */}
                          <circle
                            cx="24.5"
                            cy="9.5"
                            r="1.2"
                            fill="#fde047"
                            stroke="#451a03"
                            strokeWidth="0.7"
                          />
                        </svg>
                      </div>
                    </div>
                    {/* Target 1920px Launch Buoy Marker on Right Edge */}
                    <span
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-amber-400 border border-white shadow"
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
