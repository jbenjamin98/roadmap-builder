// Renders uniform roadmap milestone markers in 9 shapes with custom color & border styles.

export default function MilestoneMarker({
  milestoneDesign,
  size = 22,
  effects = {},
  isLight = false,
  className = '',
  title,
}) {
  const shape = milestoneDesign?.shape || 'diamond';
  const color = milestoneDesign?.color || '#f59e0b';
  const borderStyle = milestoneDesign?.borderStyle || 'solid';
  const rawBorder = milestoneDesign?.borderColor || 'auto';
  // 'auto' picks a border that contrasts with the canvas (dark on light, white on dark).
  const borderColor = rawBorder === 'auto' ? (isLight ? '#0f172a' : '#ffffff') : rawBorder;
  const borderWidth =
    borderStyle === 'none'
      ? 0
      : Math.max(1, Math.min(4, Number(milestoneDesign?.borderWidth) || 2));

  const flat = Boolean(effects?.flat);
  const useGrad = !flat && (effects?.gradients ?? true);
  const useShadow = !flat && (effects?.shadows ?? true);
  const useNeon = !flat && Boolean(effects?.neon || effects?.spotlight);
  const useBrutalist = !flat && Boolean(effects?.brutalist);
  const ink = isLight ? '#090d16' : '#f8fafc';

  const boxShadow = useBrutalist
    ? `2.5px 2.5px 0px ${ink}`
    : useNeon
      ? `0 0 14px ${color}, 0 0 5px ${borderColor}`
      : useShadow
        ? `0 5px 14px -2px ${color}99`
        : 'none';

  const cssBorder = useBrutalist
    ? `2px solid ${ink}`
    : borderStyle === 'none'
      ? 'none'
      : `${borderWidth}px ${borderStyle} ${borderColor}`;

  const bgFill = useGrad ? `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` : color;

  // SVG-based shapes: triangle, star, flag, hexagon, shield, duck-egg, yellow-duck
  if (
    shape === 'triangle' ||
    shape === 'star' ||
    shape === 'flag' ||
    shape === 'hexagon' ||
    shape === 'shield' ||
    shape === 'cross' ||
    shape === 'duck-egg' ||
    shape === 'yellow-duck' ||
    shape === 'appian-flag' ||
    shape === 'map-pin' ||
    shape === 'push-pin'
  ) {
    const holeColor = borderStyle === 'none' ? '#ffffff' : borderColor;
    const strokeDasharray =
      borderStyle === 'dashed' ? '3,2' : borderStyle === 'double' ? '1,0' : undefined;
    const strokeCol = useBrutalist ? ink : borderStyle === 'none' ? 'none' : borderColor;

    return (
      <span
        title={title}
        data-milestone-shape={shape}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          filter: useBrutalist
            ? `drop-shadow(2px 2px 0px ${ink})`
            : useNeon
              ? `drop-shadow(0 0 7px ${color})`
              : useShadow
                ? `drop-shadow(0 2px 5px ${color}77)`
                : undefined,
        }}
        className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      >
        <svg viewBox="0 0 24 24" width={size} height={size} className="overflow-visible">
          {shape === 'triangle' && (
            <polygon
              points="12,2 22,20 2,20"
              fill={color}
              stroke={strokeCol}
              strokeWidth={Math.max(1.5, borderWidth * 1.1)}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          )}
          {shape === 'star' && (
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={color}
              stroke={strokeCol}
              strokeWidth={Math.max(1.3, borderWidth)}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          )}
          {shape === 'flag' && (
            <g>
              <line
                x1="5"
                y1="3"
                x2="5"
                y2="21"
                stroke={borderStyle === 'none' ? color : borderColor}
                strokeWidth="2.3"
                strokeLinecap="round"
              />
              <path
                d="M5,3.5 L20,6.5 L16.5,10.5 L20,14.5 L5,14.5 Z"
                fill={color}
                stroke={strokeCol}
                strokeWidth={Math.max(1.2, borderWidth * 0.9)}
                strokeDasharray={strokeDasharray}
                strokeLinejoin="round"
              />
            </g>
          )}
          {shape === 'hexagon' && (
            <polygon
              points="12,2 21,7 21,17 12,22 3,17 3,7"
              fill={color}
              stroke={strokeCol}
              strokeWidth={Math.max(1.5, borderWidth)}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          )}
          {shape === 'cross' && (
            <polygon
              points="9,2 15,2 15,9 22,9 22,15 15,15 15,22 9,22 9,15 2,15 2,9 9,9"
              fill={color}
              stroke={strokeCol}
              strokeWidth={Math.max(1.5, borderWidth)}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          )}
          {shape === 'shield' && (
            <path
              d="M12,2 L20,5.5 L20,11.5 C20,16.8 16.5,20.5 12,22 C7.5,20.5 4,16.8 4,11.5 L4,5.5 Z"
              fill={color}
              stroke={strokeCol}
              strokeWidth={Math.max(1.5, borderWidth)}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          )}
          {shape === 'map-pin' && (
            // Classic teardrop location pin with a round hole.
            <g>
              <path
                d="M12 2C7.6 2 4 5.5 4 9.8c0 5.6 8 12.2 8 12.2s8-6.6 8-12.2C20 5.5 16.4 2 12 2Z"
                fill={color}
                stroke={strokeCol}
                strokeWidth={Math.max(1.2, borderWidth * 0.8)}
                strokeDasharray={strokeDasharray}
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9.8" r="3.2" fill={holeColor} />
            </g>
          )}
          {shape === 'push-pin' && (
            // Round-headed push pin: a head with a highlight and a short needle.
            <g>
              <path d="M12 13.5V22" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
              <circle
                cx="12"
                cy="8"
                r="6"
                fill={color}
                stroke={strokeCol}
                strokeWidth={Math.max(1.2, borderWidth * 0.8)}
                strokeDasharray={strokeDasharray}
              />
              <path
                d="M9 6.2C9.6 5 10.8 4.4 12 4.4"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}
          {shape === 'appian-flag' && (
            // Brand flag: one solid shape (pole + pennant, pennant end cut at 45 degrees). The
            // pole is thick and the outline is bold, drawn outside the fill (paint-order) so the
            // flag stays readable on bars and canvases of any color.
            <path
              d="M4 2H20.5V9.5L14.5 15.5H7.4V22H4Z"
              fill={color}
              stroke={strokeCol}
              strokeWidth={Math.max(3.4, borderWidth * 2)}
              paintOrder="stroke"
              strokeLinejoin="miter"
            />
          )}
          {shape === 'duck-egg' && (
            <g>
              <path
                d="M12,2.5 C7.5,2.5 4,8 4,14 C4,18.5 7.5,21.5 12,21.5 C16.5,21.5 20,18.5 20,14 C20,8 16.5,2.5 12,2.5 Z"
                fill={color}
                stroke={strokeCol}
                strokeWidth={Math.max(1.5, borderWidth)}
                strokeDasharray={strokeDasharray}
                strokeLinejoin="round"
              />
              <path
                d="M8.5,7.5 C9,6 11,5 13,5"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          )}
          {shape === 'yellow-duck' && (
            <g>
              <path
                d="M5,15 C4,11 8,9.5 13,10.5 C16,11 19,10 20,7 C21,10 21.5,15 18.5,18 C15,20.5 8,20.5 5.5,18 Z"
                fill={color}
                stroke={strokeCol}
                strokeWidth={Math.max(1.2, borderWidth)}
                strokeLinejoin="round"
              />
              <circle
                cx="17"
                cy="6.5"
                r="4.2"
                fill={color}
                stroke={strokeCol}
                strokeWidth={Math.max(1.2, borderWidth)}
              />
              <circle cx="18" cy="5.8" r="0.9" fill="#0f172a" />
              <path
                d="M21,5.8 C23.5,5.5 24.5,6.8 23.5,8 C22.5,8.8 20.5,8.2 20.5,8.2 Z"
                fill="#f97316"
                stroke="#c2410c"
                strokeWidth="0.8"
              />
            </g>
          )}
        </svg>
      </span>
    );
  }

  // CSS box-based shapes: diamond, circle, square, rounded
  const radius =
    shape === 'circle'
      ? '9999px'
      : shape === 'square'
        ? '2px'
        : shape === 'rounded'
          ? '7px'
          : '5px'; // diamond

  const innerDotSize = Math.max(4, Math.round(size * 0.28));

  return (
    <span
      title={title}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: bgFill,
        border: cssBorder,
        borderRadius: radius,
        boxShadow,
        transform: shape === 'diamond' ? 'rotate(45deg)' : undefined,
      }}
      data-milestone-shape={shape}
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <span
        style={{
          width: `${innerDotSize}px`,
          height: `${innerDotSize}px`,
          borderRadius: shape === 'circle' ? '9999px' : '1.5px',
          backgroundColor: 'rgba(255,255,255,0.9)',
        }}
      />
    </span>
  );
}
