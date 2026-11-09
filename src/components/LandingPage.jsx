import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import CelestialThemeToggle from './landing/CelestialThemeToggle';
import SkyCloudsDecor from './landing/SkyCloudsDecor';
import HorizonScene from './landing/HorizonScene';
import DuckPond from './landing/DuckPond';
import ShoreIsland from './landing/ShoreIsland';
import PrivacyModal from './PrivacyModal';
import DriveRoadmapsModal from './backup/DriveRoadmapsModal';
import OpenRoadmapModal from './OpenRoadmapModal';
import { MAX_IMPORT_BYTES, validateRoadmapImport } from '../data/roadmapSchema';
import { MAX_DUCKS, QUACK_PHRASES, pickRandom, createDuckData } from './art/duckData';

export default function LandingPage({
  onCreateRoadmap,
  onUploadRoadmap,
  onDriveRoadmapOpened,
  continueRoadmap,
  onContinueRoadmap,
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
  const [showPrivacy, setShowPrivacy] = useState(false);
  // Open Roadmap flow: null | 'choose' | 'drive'
  const [openStep, setOpenStep] = useState(null);

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
    const newDuck = { ...baseDuck, flying: true, facingLeft: baseDuck.pondX < 50 };
    setTimeout(() => {
      setDucks((prev) => {
        if (prev.length < MAX_DUCKS) {
          return [...prev, newDuck];
        }
        const replaceIdx = prev.length > 1 ? 1 + Math.floor(Math.random() * (prev.length - 1)) : 0;
        const next = [...prev];
        next[replaceIdx] = newDuck;
        return next;
      });
    }, 750);
  };

  const changeAligned = (next) => {
    setIsAligned((prev) => (typeof next === 'function' ? next(prev) : next));
    setIsRegrouping(true);
    clearTimeout(regroupTimer.current);
    regroupTimer.current = setTimeout(() => setIsRegrouping(false), 800);
  };

  useEffect(() => {
    if (isAligned) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    const swimTimer = setInterval(() => {
      if (document.hidden) return;
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
      if (document.hidden) return;
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
        setDucks((prev) => prev.map((d) => (d.diveToken === token ? { ...d, splash: false } : d)));
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
    setDucks((prev) =>
      prev.map((d) => (d.id === duckId ? { ...d, flying: false, splash: true } : d))
    );
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

    if (file.size > MAX_IMPORT_BYTES) {
      setUploadError('That file is too large to be a roadmap (over 50 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const result = validateRoadmapImport(parsed);
        if (!result.ok) {
          setUploadError(result.error);
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

  const count = ducks.length;
  const numRows = count <= 10 ? 1 : 2;
  const colsPerRow = Math.ceil(count / numRows);

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
      itemsInThisRow === 1 ? 46 : minX + (visualCol / Math.max(1, colsPerRow - 1)) * (maxX - minX);

    const minY = numRows === 1 ? 52 : 30;
    const maxY = numRows === 1 ? 52 : 76;
    const topPct = numRows === 1 ? 52 : minY + (row / Math.max(1, numRows - 1)) * (maxY - minY);

    return {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      scale: 1,
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
      data-testid="landing-root"
      className="h-screen relative overflow-auto bg-sky-300 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-500 select-none"
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

      {/* The scene never gets smaller than the smallest laptop (1280x720); smaller windows scroll. */}
      <div className="relative flex min-h-[max(100%,45rem)] min-w-[max(100%,80rem)] flex-col bg-gradient-to-b from-amber-100 via-sky-200 to-sky-300 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
        {/* SKY & GLASSMORPHIC CELESTIAL LAYER (anchored to the scene so it scrolls with the horizon) */}
        <SkyCloudsDecor />
        <CelestialThemeToggle
          isDark={isDark}
          onToggle={() => onChangeThemeMode(isDark ? 'light' : 'dark')}
        />
        <div className="relative z-20 shrink-0 h-[clamp(9rem,calc(max(100vh,720px)*0.15),10rem)] px-6 max-w-5xl w-full mx-auto flex flex-col items-center justify-end"></div>

        {/* STORYBOOK HORIZON */}
        <HorizonScene isDark={isDark} />

        {/* POND WATER BASIN */}
        <div className="relative flex-1 w-full flex flex-col overflow-x-clip bg-gradient-to-b from-sky-400 via-cyan-600 to-teal-900 dark:from-sky-900 dark:via-indigo-950 dark:to-slate-950">
          {/* Shimmer Ribbons */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-12 left-1/4 w-96 h-48 rounded-full bg-indigo-400/20 dark:bg-indigo-500/15 blur-3xl" />
            <div className="absolute bottom-8 right-1/4 w-96 h-48 rounded-full bg-emerald-300/20 dark:bg-teal-500/15 blur-3xl" />
            <div className="absolute top-[14%] left-[12%] w-40 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/65 to-transparent animate-wave-slow" />
            <div className="absolute top-[30%] right-[22%] w-52 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/55 to-transparent animate-wave-fast" />
            <div className="absolute top-[52%] left-[35%] w-60 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent animate-wave-slow" />
            <div className="absolute bottom-[18%] right-[15%] w-48 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-wave-fast" />
          </div>

          {/* Central Pond Stage */}
          <div className="relative z-20 max-w-5xl min-[1700px]:max-w-7xl w-full mx-auto px-3 sm:px-6 pt-2 pb-2 flex flex-col justify-center items-center gap-3 sm:gap-6 my-auto">
            {/* Header Card */}
            <div className="relative z-30 flex flex-col items-center text-center gap-1.5 sm:gap-2.5 mt-2 sm:mt-0 mb-0 sm:mb-1">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest text-white drop-shadow-[0_2px_6px_rgba(15,23,42,0.6)] bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-xl border border-white/50 dark:border-indigo-400/40 shadow-[0_12px_32px_rgba(15,23,42,0.35),inset_0_1px_2px_rgba(255,255,255,0.7)]">
                <span>Roadmap Builder</span>
              </div>

              <div
                onMouseEnter={() => changeAligned(true)}
                onMouseLeave={() => changeAligned(false)}
                onClick={() => changeAligned((prev) => !prev)}
                role="button"
                tabIndex={0}
                data-testid="align-ducks-trigger"
                className="group relative inline-block px-3 sm:px-7 py-1.5 sm:py-3 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                title="Hover over this title to watch all the ducks swim into aligned rows!"
              >
                <h1 className="relative text-2xl min-[480px]:text-3xl sm:text-4xl lg:text-5xl  font-extrabold tracking-tight text-white flex flex-wrap items-center justify-center gap-x-3 drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                  <span>
                    Get your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 underline decoration-amber-300/80 decoration-wavy underline-offset-4">
                      ducks in a row.
                    </span>
                  </span>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 group-hover:rotate-45 transition-transform shrink-0" />
                </h1>
              </div>
            </div>

            {/* Duck Pond with swimming ducks, lily pads, shore nest */}
            <DuckPond
              ducks={ducks}
              isAligned={isAligned}
              isRegrouping={isRegrouping}
              numRows={numRows}
              getDuckPosition={getDuckPosition}
              quacks={quacks}
              hoppingId={hoppingId}
              triggerQuack={triggerQuack}
              handleDuckLanded={handleDuckLanded}
              onCreateRoadmap={onCreateRoadmap}
              onOpenClick={() => setOpenStep('choose')}
              continueRoadmap={continueRoadmap}
              onContinue={onContinueRoadmap}
            />

            {uploadError && (
              <div
                role="alert"
                className="relative z-40 mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-100 bg-rose-950/80 border border-rose-500/40 backdrop-blur-md"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Island pinned to the bottom edge of the pond, */}
          <ShoreIsland onHatchEgg={handleHatchEgg} isEggHatching={isEggHatching} />

          {/* Foreground Waves */}
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

      <button
        type="button"
        onClick={() => setShowPrivacy(true)}
        data-testid="landing-privacy-btn"
        className="fixed bottom-3 left-4 z-30 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors backdrop-blur-md px-2.5 py-1 rounded-lg bg-white/40 dark:bg-slate-900/60 border border-white/50 dark:border-indigo-400/30 shadow-sm"
      >
        Privacy &amp; Security
      </button>

      {openStep === 'choose' && (
        <OpenRoadmapModal
          onClose={() => setOpenStep(null)}
          onChooseUpload={() => {
            setOpenStep(null);
            fileInputRef.current?.click();
          }}
          onChooseDrive={() => setOpenStep('drive')}
        />
      )}

      {openStep === 'drive' && (
        <DriveRoadmapsModal
          onClose={() => setOpenStep(null)}
          onBack={() => setOpenStep('choose')}
          onOpened={() => {
            setOpenStep(null);
            onDriveRoadmapOpened?.();
          }}
        />
      )}

      {showPrivacy && <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />}
    </div>
  );
}
