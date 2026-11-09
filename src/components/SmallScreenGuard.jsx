import { useEffect, useState } from 'react';
import { Monitor, MoveHorizontal } from 'lucide-react';
import SkyClouds from './art/SkyClouds';
import MeadowScene from './art/MeadowScene';
import GuardDuck from './art/GuardDuck';
import DuckDecoy from './art/DuckDecoy';

/**
 * Narrowest window the layout works in (the Tailwind `xl` breakpoint, measured: below it the grid
 * is cramped). Desktop users under this can dismiss the guard; real mobile devices cannot.
 */
export const MIN_DESKTOP_WIDTH = 1280;
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
  'ALMOST AT THE POND! KEEP GOING!',
  'SO CLOSE! I CAN SEE THE OPEN POND!',
  'JUST A LITTLE WIDER! SHIP IT! 🦆',
];

function getMoodTier(width) {
  if (width < 800) return 'smooshed';
  if (width < 1080) return 'mid';
  return 'close';
}

function getPoolForTier(tier) {
  if (tier === 'smooshed') return QUACKS_SMOOSHED;
  if (tier === 'mid') return QUACKS_MID;
  return QUACKS_CLOSE;
}

export default function SmallScreenGuard() {
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : MIN_DESKTOP_WIDTH
  );
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  // "Continue anyway" only lasts until the page is reloaded, so the warning returns every visit.
  const [dismissed, setDismissed] = useState(false);
  const [quackBubble, setQuackBubble] = useState(QUACKS_SMOOSHED[0]);
  const [isHopping, setIsHopping] = useState(false);

  // Real mobile devices are always blocked; narrow desktop windows can continue anyway.
  const isTooSmall = isMobileDevice || (windowWidth < MIN_DESKTOP_WIDTH && !dismissed);
  const handleContinueAnyway = () => setDismissed(true);
  const moodTier = getMoodTier(windowWidth);

  useEffect(() => {
    const checkDeviceAndSize = () => {
      setWindowWidth(window.innerWidth);
      const ua = navigator.userAgent || '';
      const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      setIsMobileDevice(mobileRegex.test(ua) || (isCoarse && window.screen.width < 1024));
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
      if (document.hidden) return;
      idx = (idx + 1) % pool.length;
      setQuackBubble(pool[idx]);
      setIsHopping(true);
      setTimeout(() => setIsHopping(false), 520);
    }, 2300);

    return () => clearInterval(interval);
  }, [isTooSmall, moodTier]);

  if (!isTooSmall) return null;

  // At <= 500px: closeness = 1.0 -> massive 5.5x scale anchored at his face (50% 30.5%) so his face fills the entire screen!
  // As window widens toward the minimum width: closeness -> 0.0 -> smoothly backs away into the pond (scale ~ 1.15x)
  const clampedW = Math.max(FACE_CLOSEUP_WIDTH, Math.min(MIN_DESKTOP_WIDTH, windowWidth));
  const closeness = (MIN_DESKTOP_WIDTH - clampedW) / (MIN_DESKTOP_WIDTH - FACE_CLOSEUP_WIDTH);
  const dynamicScale = (1.15 + Math.pow(closeness, 1.35) * 4.35).toFixed(3);
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
          <SkyClouds />
        </div>

        {/* 3D Perspective Rolling Hills & Winding Trail Leading Straight to the Screen */}
        <div className="relative flex-1 w-full overflow-hidden">
          <MeadowScene />
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
              <GuardDuck
                moodTier={moodTier}
                isHopping={isHopping}
                isPressedAgainstGlass={isPressedAgainstGlass}
              />
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
                  ? 'Multi-track timelines and drag-and-drop roadmaps need a full-size desktop pond to spread their wings!'
                  : 'My face is squished against your screen! Drag your browser window wider so I can waddle back up the trail to the pond.'}
              </p>
              {!isMobileDevice && (
                <button
                  type="button"
                  onClick={handleContinueAnyway}
                  data-testid="guard-continue-btn"
                  className="mt-1 inline-flex items-center rounded-lg border border-amber-300/50 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-100 transition-colors hover:bg-amber-300/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                >
                  Continue anyway (it will be cramped)
                </button>
              )}

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
                        <DuckDecoy />
                      </div>
                    </div>
                    {/* Target-width Launch Buoy Gem Marker on Right Edge */}
                    <span
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-amber-200 via-amber-400 to-orange-600 border border-amber-100 shadow"
                      title={`Target: ${MIN_DESKTOP_WIDTH}px`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-200/90 px-1">
                    <span>
                      Current: <strong className="text-amber-300">{windowWidth}px</strong>
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
