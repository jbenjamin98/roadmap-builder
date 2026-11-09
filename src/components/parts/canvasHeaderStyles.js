// Styling helpers and variant configurations for Canvas Header styles.
import { NO_WORD_BREAK } from '../styleHelpers';

/**
 * Computes container styles and classes for the given header styleId.
 */
export function getHeaderContainerVisuals(styleId, tokens, primaryColor) {
  const isLight = tokens.isLight;

  switch (styleId) {
    case 'clean-minimal':
      return {
        className: 'px-6 py-5 border-b flex flex-row items-stretch justify-between gap-4',
        style: {
          background: 'transparent',
          borderColor: `${tokens.gridBorder}55`,
        },
      };

    case 'floating-card':
      return {
        className:
          'm-3 sm:m-4 p-5 rounded-2xl border shadow-sm flex flex-row items-stretch justify-between gap-4 transition-all',
        style: {
          backgroundColor: tokens.chipBg,
          borderColor: tokens.gridBorder,
        },
      };

    case 'editorial-split':
      return {
        className: 'px-6 py-5 border-b border-t flex flex-row items-stretch justify-between gap-6',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasSplitDivider: true,
      };

    case 'left-accent-rail':
      return {
        className:
          'px-6 py-5 border-b border-l-[6px] flex flex-row items-stretch justify-between gap-4',
        style: {
          background: `linear-gradient(90deg, ${primaryColor}14 0%, transparent 80%)`,
          borderBottomColor: tokens.gridBorder,
          borderLeftColor: primaryColor,
        },
      };

    case 'top-accent-bar':
      return {
        className:
          'px-6 py-5 border-b border-t-[4px] flex flex-row items-stretch justify-between gap-4',
        style: {
          background: tokens.headerGradient,
          borderBottomColor: tokens.gridBorder,
          borderTopColor: primaryColor,
        },
      };

    case 'two-tone':
      return {
        className: 'border-b flex flex-row items-stretch justify-between',
        style: {
          borderColor: tokens.gridBorder,
        },
        isTwoTone: true,
      };

    case 'pill-capsule':
      return {
        className: 'px-6 py-5 border-b flex flex-row items-stretch justify-between gap-4',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasTitlePill: true,
      };

    case 'terminal-dark':
      return {
        className: 'px-6 py-5 border-b flex flex-row items-stretch justify-between gap-4 font-mono',
        style: {
          background: isLight ? '#0f172a' : '#020617',
          borderColor: `${primaryColor}55`,
          color: '#f8fafc',
        },
        isTerminal: true,
      };

    case 'compact-bar':
      return {
        className:
          'px-5 py-2.5 border-b flex flex-row items-center justify-between gap-4 flex-wrap',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        isCompact: true,
      };

    case 'hero-centered':
      return {
        className: 'px-6 py-6 border-b flex flex-col items-center text-center gap-3',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        isCentered: true,
      };

    case 'underlined-rule':
      return {
        className: 'px-6 py-5 border-b flex flex-row items-stretch justify-between gap-4',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasTitleUnderline: true,
      };

    case 'glass-frosted':
      return {
        className:
          'm-3 sm:m-4 p-5 rounded-2xl border shadow-lg backdrop-blur-md flex flex-row items-stretch justify-between gap-4 transition-all',
        style: {
          background: isLight ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.65)',
          borderColor: `${primaryColor}44`,
          boxShadow: isLight
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        },
        hasFrostedCard: true,
      };

    case 'outline-card':
    case 'badge-spotlight': // backwards-compatibility alias
      return {
        className:
          'm-3 sm:m-4 p-5 rounded-2xl border-2 flex flex-row items-stretch justify-between gap-4 transition-all',
        style: {
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.35)',
          borderColor: `${primaryColor}55`,
        },
        hasOutlineCard: true,
      };

    case 'brutalist-block':
      return {
        className:
          'px-6 py-5 border-b-2 flex flex-row items-stretch justify-between gap-4 rounded-none',
        style: {
          background: isLight ? '#ffffff' : '#0f172a',
          borderColor: tokens.textMain,
          boxShadow: `0 3px 0 0 ${tokens.textMain}`,
        },
        isBrutalist: true,
      };

    case 'brand-hero':
      return {
        className: 'px-6 py-5 border-b flex flex-row items-stretch justify-between gap-6',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasBrandHero: true,
      };

    case 'logo-showcase':
      return {
        className:
          'm-3 sm:m-4 p-5 rounded-2xl border shadow-md flex flex-row items-center justify-between gap-6 transition-all',
        style: {
          backgroundColor: tokens.chipBg,
          borderColor: tokens.gridBorder,
        },
        hasLogoShowcase: true,
      };

    case 'stacked-emblem':
      return {
        className: 'px-6 py-7 border-b flex flex-col items-center text-center gap-3.5',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasStackedEmblem: true,
        isCentered: true,
      };

    case 'media-banner':
      return {
        className: 'px-7 py-5 border-b flex flex-row items-stretch justify-between gap-6',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasMediaBanner: true,
      };

    case 'floating-crest':
      return {
        className:
          'm-3 sm:m-4 p-5 rounded-2xl border shadow-lg flex flex-row items-center justify-between gap-6 transition-all',
        style: {
          backgroundColor: tokens.chipBg,
          borderColor: `${primaryColor}44`,
          boxShadow: isLight
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.35)',
        },
        hasFloatingCrest: true,
      };

    case 'executive-billboard':
      return {
        className: 'px-7 py-6 border-b flex flex-row items-stretch justify-between gap-6',
        style: {
          background: isLight
            ? `linear-gradient(135deg, ${primaryColor}0d 0%, #ffffff 100%)`
            : `linear-gradient(135deg, ${primaryColor}18 0%, #0f172a 100%)`,
          borderColor: tokens.gridBorder,
        },
        hasExecutiveBillboard: true,
      };

    case 'crest-minimal':
      return {
        className: 'px-6 py-6 border-b flex flex-col items-center text-center gap-3',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasCrestMinimal: true,
        isCentered: true,
      };

    case 'badge-strip':
      return {
        className: 'px-6 py-5 border-b flex flex-row items-center justify-between gap-5',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
        hasBadgeStrip: true,
      };

    case 'split-billboard':
      return {
        className:
          'm-3 sm:m-4 p-5 rounded-2xl border shadow-md flex flex-row items-stretch justify-between gap-6 transition-all',
        style: {
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(15, 23, 42, 0.55)',
          borderColor: tokens.gridBorder,
        },
        hasSplitBillboard: true,
      };

    case 'duck-pond':
      return {
        className:
          'm-3 sm:m-4 p-5 rounded-3xl border-2 shadow-xl flex flex-row items-center justify-between gap-6 transition-all',
        style: {
          background: isLight
            ? 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)'
            : 'linear-gradient(135deg, #082f49 0%, #064e3b 100%)',
          borderColor: '#f59e0b',
        },
        hasDuckPond: true,
      };

    case 'gradient-banner':
    default:
      return {
        className: 'px-6 py-5 border-b flex flex-row items-stretch justify-between gap-4',
        style: {
          background: tokens.headerGradient,
          borderColor: tokens.gridBorder,
        },
      };
  }
}

export { NO_WORD_BREAK };
