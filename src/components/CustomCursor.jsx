import { useEffect, useRef, useState } from 'react';

export default function CustomCursor({
  themeMode = 'dark',
  isWorkspace = false,
  roadmapTheme = null,
}) {
  const ringRef = useRef(null);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pulses, setPulses] = useState([]);

  const isDark = themeMode === 'dark';

  // Resolve active palette: match roadmap theme in workspace, or Light/Dark UI palette on landing page
  const primaryColor = isWorkspace
    ? roadmapTheme?.primary || '#6366f1'
    : isDark
    ? '#6366f1'
    : '#4f46e5';

  const accentColor = isWorkspace
    ? roadmapTheme?.accents?.[0] || '#818cf8'
    : isDark
    ? '#a855f7'
    : '#7c3aed';

  const outlineColor = isDark ? '#ffffff' : '#0f172a';
  const innerSurface = isDark ? '#0f172a' : '#ffffff';

  // Dynamically generate sleek geometric SVG cursors that match the active theme & light/dark mode
  const defaultCursorSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
      <defs>
        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${accentColor}" />
        </linearGradient>
      </defs>
      <path d="M4 3 L21 10.5 L13.5 13.5 L10.5 21 Z" fill="url(#cg)" stroke="${outlineColor}" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>
  `);

  const pointerCursorSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${accentColor}" />
        </linearGradient>
      </defs>
      <path d="M4 3 L22 10.5 L14 14 L10.5 22 Z" fill="url(#pg)" stroke="${outlineColor}" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="19" cy="19" r="3.2" fill="${innerSurface}" stroke="${primaryColor}" stroke-width="1.8"/>
    </svg>
  `);

  useEffect(() => {
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      const interactive = Boolean(
        target?.closest?.(
          'button, a, input, select, textarea, label, [role="button"], [data-rnd-item="true"], [draggable="true"]'
        )
      );
      setIsHoveringInteractive(interactive);
    };

    const handleMouseDown = (e) => {
      setIsClicking(true);
      const id = `${Date.now()}-${Math.random()}`;
      setPulses((prev) => [
        ...prev.slice(-4),
        { id, x: e.clientX, y: e.clientY },
      ]);
      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.id !== id));
      }, 550);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = requestAnimationFrame(animateRing);
    };

    rafId = requestAnimationFrame(animateRing);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  return (
    <>
      {/* Dynamic CSS cursor rules matching active mode & roadmap theme */}
      <style>{`
        @media (pointer: fine) {
          html, body, * {
            cursor: url("data:image/svg+xml,${defaultCursorSvg}") 4 3, auto !important;
          }
          a, button, [role="button"], .cursor-pointer, input[type="checkbox"], input[type="color"], select, label, [data-rnd-item="true"], [draggable="true"], a *, button *, [role="button"] *, .cursor-pointer * {
            cursor: url("data:image/svg+xml,${pointerCursorSvg}") 4 3, pointer !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden hidden sm:block"
        aria-hidden="true"
      >
        {/* Click Pulse Rings */}
        {pulses.map((p) => (
          <span
            key={p.id}
            style={{
              left: p.x,
              top: p.y,
              borderColor: primaryColor,
            }}
            className="fixed -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 opacity-75 animate-ping"
          />
        ))}

        {/* Smooth Trailing Glassmorphic Halo Ring */}
        <div
          ref={ringRef}
          className={`fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-full transition-opacity duration-150 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            style={{
              borderColor: isHoveringInteractive ? accentColor : primaryColor,
              backgroundColor: isClicking
                ? `${primaryColor}33`
                : isHoveringInteractive
                ? `${accentColor}1a`
                : `${primaryColor}0d`,
              boxShadow: isHoveringInteractive || isClicking
                ? `0 0 16px -2px ${primaryColor}66`
                : 'none',
            }}
            className={`w-full h-full rounded-full border transition-transform duration-150 ${
              isClicking
                ? 'scale-75'
                : isHoveringInteractive
                ? 'scale-125'
                : 'scale-100'
            }`}
          />
        </div>
      </div>
    </>
  );
}
