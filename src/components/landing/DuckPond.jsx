import DuckSvg from '../art/DuckSvg';
import ContinuePad from './ContinuePad';

export default function DuckPond({
  ducks,
  isAligned,
  isRegrouping,
  numRows,
  getDuckPosition,
  quacks,
  hoppingId,
  triggerQuack,
  handleDuckLanded,
  onCreateRoadmap,
  onOpenClick,
  continueRoadmap,
  onContinue,
}) {
  return (
    <>
      {/* 1. Open Pond Swimming Area */}
      <div className="relative h-[clamp(4.5rem,calc(max(100vh,720px)*0.15),20rem)] w-full">
        {/* Frosted Glass Alignment Swim Lanes (matching Workspace Timeline Tracks) */}
        {isAligned &&
          Array.from({ length: numRows }).map((_, rIdx) => {
            const minY = numRows === 1 ? 52 : 30;
            const maxY = numRows === 1 ? 52 : 76;
            const topPct =
              numRows === 1 ? 52 : minY + (rIdx / Math.max(1, numRows - 1)) * (maxY - minY);
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
                  <ellipse
                    className="splash-ring"
                    cx="80"
                    cy="30"
                    rx="34"
                    ry="9"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="2.5"
                  />
                  <ellipse
                    className="splash-ring"
                    style={{ animationDelay: '0.12s' }}
                    cx="80"
                    cy="30"
                    rx="34"
                    ry="9"
                    stroke="rgba(186,230,253,0.9)"
                    strokeWidth="2"
                  />
                  <ellipse
                    className="splash-ring"
                    style={{ animationDelay: '0.25s' }}
                    cx="80"
                    cy="30"
                    rx="34"
                    ry="9"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.5"
                  />
                </svg>
              )}

              {/* Speech bubbles for quacks */}
              {activeQuacks.map((q) => (
                <div
                  key={q.id}
                  className="animate-quack-float pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 px-3.5 py-1.5 rounded-2xl text-[12px] font-black tracking-tight backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-400/50 shadow-[0_10px_25px_rgba(15,23,42,0.35),0_0_12px_rgba(251,191,36,0.35)]"
                >
                  <span>{q.phrase}</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white/95 dark:bg-slate-900/95 border-r border-b border-amber-300/60 dark:border-amber-400/50" />
                </div>
              ))}

              <div
                className={duck.flying ? 'animate-duck-fly' : undefined}
                style={{ '--fx': `${Math.round((50 - duck.pondX) * 9)}px` }}
                onAnimationEnd={(e) => {
                  if (duck.flying && e.target === e.currentTarget) handleDuckLanded(duck.id);
                }}
              >
                <div
                  style={{
                    transform: `scaleX(${pos.flipX})`,
                    transition: 'transform 450ms ease-in-out',
                  }}
                >
                  <div
                    style={{ animationDelay: isHopping ? '0s' : duck.delay }}
                    className={`relative ${isHopping ? 'animate-duck-hop' : 'animate-duck-bob'}`}
                  >
                    <div
                      className={
                        duck.dive === 'tail'
                          ? 'animate-duck-dive-tail'
                          : duck.dive
                            ? 'animate-duck-dive-under'
                            : undefined
                      }
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerQuack(duck.id);
                        }}
                        className="relative block cursor-pointer transition-transform duration-200 hover:scale-115 active:scale-95 focus:outline-none"
                        aria-label={duck.isLeader ? 'Leader Duck' : 'Pond Duck'}
                        title={
                          duck.isLeader
                            ? 'Quack! Click to make me quack.'
                            : 'Click to make this duck quack!'
                        }
                      >
                        <DuckSvg duck={duck} />
                      </button>
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
                              <g
                                key={x}
                                className="duck-leg-wiggle"
                                style={{
                                  transformOrigin: `${x}px 52px`,
                                  animationDelay: `${k * 0.13}s`,
                                }}
                              >
                                <path
                                  d={`M${x} 52 L${x} 24`}
                                  stroke="#c2410c"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                                <path
                                  d={`M${x} 24 L${x - 10} 8 L${x - 4} 12 L${x} 4 L${x + 4} 12 L${x + 10} 8 Z`}
                                  fill="#f97316"
                                  stroke="#9a3412"
                                  strokeWidth="1.4"
                                  strokeLinejoin="round"
                                />
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

      {/* 2. Glassmorphic Lily Pad Action Cards */}
      <div className="relative z-30 flex flex-nowrap items-center justify-center gap-3 sm:gap-[clamp(2rem,6vw,7rem)] mt-1 sm:mt-2">
        {/* Start with Blank Canvas Floating Glassmorphic Lotus Lily Pad */}
        <button
          type="button"
          onClick={onCreateRoadmap}
          onMouseEnter={() => import('../ConfigModal')}
          data-testid="create-roadmap-btn"
          className="animate-duck-bob group relative w-28 sm:w-48 -rotate-1 hover:rotate-0 flex flex-col items-center text-center px-1 sm:px-3 py-2 sm:py-3 text-white transition-all duration-300 hover:scale-105"
        >
          <svg
            viewBox="0 0 76 52"
            className="relative w-[4.5rem] h-[3.4rem] sm:w-28 sm:h-[5.25rem] mb-1 group-hover:scale-110 transition-transform overflow-visible drop-shadow-[0_6px_12px_rgba(16,185,129,0.4)]"
          >
            <defs>
              <linearGradient id="lotusPadGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.92" />
                <stop offset="55%" stopColor="#10b981" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="lotusSidePetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#fbcfe8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="lotusCenterPetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="50%" stopColor="#f472b6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#db2777" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <path
              d="M38 39 L7 35 A32 10 0 1 0 10 31 Z"
              fill="url(#lotusPadGrad)"
              stroke="rgba(255,255,255,0.88)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M22 20 C19 29, 26 36, 38 38 C33 29, 28 23, 22 20 Z"
              fill="url(#lotusSidePetal)"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.2"
            />
            <path
              d="M54 20 C57 29, 50 36, 38 38 C43 29, 48 23, 54 20 Z"
              fill="url(#lotusSidePetal)"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.2"
            />
            <path
              d="M38 9 C30 19, 28 32, 38 38 C48 32, 46 19, 38 9 Z"
              fill="url(#lotusCenterPetal)"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="1.4"
            />
            <circle cx="38" cy="28" r="3.8" fill="#fef08a" stroke="#ffffff" strokeWidth="1.1" />
          </svg>
          <span className="relative font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-sm">
            Create Roadmap
          </span>
        </button>

        {continueRoadmap && (
          <ContinuePad
            name={continueRoadmap.name}
            hasUnbackedChanges={continueRoadmap.hasUnbackedChanges}
            onContinue={onContinue}
          />
        )}

        {/* Open Roadmap (upload a file or open from Google Drive) Bottle Lily Pad */}
        <button
          type="button"
          onClick={onOpenClick}
          data-testid="open-roadmap-btn"
          style={{ animationDelay: '0.85s' }}
          className="animate-duck-bob group relative w-28 sm:w-48 rotate-2 hover:rotate-0 translate-y-2.5 flex flex-col items-center text-center px-1 sm:px-3 py-2 sm:py-3 text-white transition-all duration-300 hover:scale-105"
        >
          <svg
            viewBox="0 0 76 52"
            className="relative w-[4.5rem] h-[3.4rem] sm:w-28 sm:h-[5.25rem] mb-1 group-hover:scale-110 transition-transform overflow-visible drop-shadow-[0_6px_12px_rgba(8,145,178,0.4)]"
          >
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
            <path
              d="M38 39 L69 35 A32 10 0 1 1 66 31 Z"
              fill="url(#bottlePadGrad)"
              stroke="rgba(255,255,255,0.88)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <g transform="rotate(-16 38 26)">
              <rect
                x="21"
                y="18"
                width="26"
                height="14"
                rx="6"
                fill="url(#glassBottleGrad)"
                stroke="rgba(255,255,255,0.92)"
                strokeWidth="1.6"
              />
              <rect
                x="46"
                y="21.5"
                width="6"
                height="7"
                rx="1.5"
                fill="url(#glassBottleGrad)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.4"
              />
              <rect
                x="51"
                y="22.2"
                width="4.5"
                height="5.6"
                rx="1.2"
                fill="#f59e0b"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="1.1"
              />
              <rect
                x="25"
                y="22"
                width="17"
                height="6"
                rx="2"
                fill="url(#scrollMapGrad)"
                stroke="#d97706"
                strokeWidth="1"
              />
              <line x1="33" y1="22" x2="33" y2="28" stroke="#ec4899" strokeWidth="1.6" />
              <line
                x1="25"
                y1="20"
                x2="42"
                y2="20"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>
          </svg>
          <span className="relative font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-sm">
            Open Roadmap
          </span>
        </button>
      </div>
    </>
  );
}
