import { SPINE_WIDTH } from '../../constants/designOptions';
import { NO_WORD_BREAK, nbHyphen } from '../styleHelpers';
import { YellowDuckIcon } from './DuckParts';

/** Vertical (rotated 90°) section cap rendered to the LEFT of the section's rows. */
export function SectionSpine({
  styleId,
  accent,
  tokens,
  number,
  title,
  roundBottomLeft = 0,
  duckMode = false,
}) {
  let wrap = { backgroundColor: accent, color: '#ffffff' };
  if (styleId === 'rotated-outline') {
    wrap = {
      backgroundColor: `${accent}22`,
      border: `2px solid ${accent}`,
      color: accent,
    };
  } else if (styleId === 'rotated-pill') {
    wrap = { backgroundColor: tokens.stickyAltBg, color: '#ffffff', padding: '6px 5px' };
  } else if (styleId === 'rotated-gradient') {
    wrap = {
      background: `linear-gradient(180deg, ${accent} 0%, ${accent}88 100%)`,
      color: '#ffffff',
    };
  } else if (styleId === 'rotated-frost') {
    wrap = {
      backgroundColor: `${accent}2e`,
      borderLeft: `3px solid ${accent}`,
      borderRight: `1px solid ${accent}`,
      boxShadow: `inset 0 0 14px ${accent}44`,
      color: tokens.textMain,
    };
  } else if (styleId === 'rotated-badge') {
    wrap = { backgroundColor: tokens.stickyAltBg, color: tokens.textMain };
  } else if (styleId === 'rotated-rail') {
    wrap = {
      backgroundColor: tokens.stickyAltBg,
      borderRight: `4px solid ${accent}`,
      color: tokens.textMain,
    };
  } else if (styleId === 'rotated-accent-notch') {
    wrap = {
      backgroundColor: `${accent}18`,
      borderTop: `4px solid ${accent}`,
      borderRight: `1.5px solid ${accent}55`,
      color: tokens.textMain,
    };
  } else if (styleId === 'rotated-minimal') {
    wrap = {
      backgroundColor: 'transparent',
      borderRight: `1.5px solid ${tokens.gridBorder}`,
      color: tokens.textMain,
    };
  }

  const text = (
    <div className="flex-1 min-h-0 w-full flex items-center justify-center py-2 overflow-hidden">
      <span
        data-export-text="true"
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          maxHeight: '100%',
          textAlign: 'center',
          ...NO_WORD_BREAK,
        }}
        className="text-[10px] font-extrabold uppercase tracking-wider leading-tight whitespace-normal overflow-hidden"
      >
        {number && styleId !== 'rotated-badge' ? `${number} · ` : ''}
        {nbHyphen(title)}
      </span>
    </div>
  );

  return (
    <div
      style={{
        width: SPINE_WIDTH,
        ...wrap,
        borderBottomLeftRadius: roundBottomLeft || undefined,
      }}
      className="shrink-0 sticky left-0 z-[46] flex select-none"
    >
      {styleId === 'rotated-pill' ? (
        <div
          style={{ backgroundColor: accent }}
          className="flex-1 rounded-full flex flex-col text-white"
        >
          {text}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center">
          {styleId === 'rotated-badge' && (
            <span
              data-export-text="true"
              style={{ backgroundColor: accent }}
              className={`mt-2 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 ${
                number ? 'w-6 h-6' : duckMode ? 'w-6 h-6 bg-amber-400 p-0.5' : 'w-2.5 h-2.5'
              }`}
            >
              {number || (duckMode ? <YellowDuckIcon size={16} /> : '')}
            </span>
          )}
          {text}
        </div>
      )}
    </div>
  );
}
