/** Numbering badge: one of 12 looks, shared by sections (X), sub-sections (X.X) and tasks (X.X.X). */
export function NumBadge({
  label,
  accent,
  solid = false,
  radius,
  numStyle = 'soft-tint',
  className = '',
}) {
  const a = solid ? '#ffffff' : accent;
  const fill = solid ? 'rgba(0,0,0,0.3)' : accent;
  let text = String(label);
  let style;
  let shape = 'rounded-md px-1.5 py-0.5';

  switch (numStyle) {
    case 'solid-chip':
      style = { backgroundColor: fill, color: '#ffffff' };
      break;
    case 'outlined':
      style = { border: `1.5px solid ${a}`, color: a };
      break;
    case 'plain':
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'circle':
      style = {
        backgroundColor: `${a}24`,
        border: `1px solid ${a}66`,
        color: a,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
      };
      shape = 'rounded-full px-1.5';
      break;
    case 'underline':
      style = { borderBottom: `2px solid ${a}`, color: a };
      shape = 'px-0.5 py-0.5';
      break;
    case 'bracket':
      text = `[${label}]`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'paren':
      text = `(${label})`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'dot-suffix':
      text = `${label}.`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'pill-solid':
      style = { backgroundColor: fill, color: '#ffffff' };
      shape = 'rounded-full px-2 py-0.5';
      break;
    case 'hash-prefix':
      text = `#${label}`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'side-rule':
      style = {
        borderLeft: `3px solid ${a}`,
        backgroundColor: `${a}16`,
        color: a,
      };
      shape = 'rounded-r-md pl-1.5 pr-1.5 py-0.5';
      break;
    case 'angle':
      text = `<${label}>`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'slash-suffix':
      text = `${label} /`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'square-solid':
      style = { backgroundColor: fill, color: '#ffffff' };
      shape = 'rounded-[2px] px-1.5 py-0.5';
      break;
    case 'arrow-prefix':
      text = `▸${label}`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'section-sign':
      text = `§${label}`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'zero-pad':
      text = String(label)
        .split('.')
        .map((n) => n.padStart(2, '0'))
        .join('.');
      style = {
        backgroundColor: `${a}24`,
        color: a,
        border: `1px solid ${a}55`,
      };
      break;
    case 'soft-tint':
    default:
      style = {
        backgroundColor: `${a}24`,
        color: a,
        border: `1px solid ${a}55`,
      };
  }
  if (radius) style.borderRadius = radius;

  return (
    <span
      data-export-text="true"
      style={style}
      className={`inline-flex items-center text-[10px] font-mono font-extrabold leading-none shrink-0 whitespace-nowrap ${shape} ${className}`}
    >
      {text}
    </span>
  );
}

/** Section number badge (only when numbering is on). Tab-flag keeps a plain tab when off. */
export function SectionNumber({ show, label, accent, visuals, numStyle }) {
  if (show) {
    return (
      <NumBadge
        label={label}
        accent={accent}
        solid={visuals.solid}
        numStyle={numStyle}
        radius={
          visuals.tab && (numStyle === 'soft-tint' || !numStyle) ? '0 999px 999px 0' : undefined
        }
        className={visuals.tab ? '-ml-2 pl-3' : ''}
      />
    );
  }
  if (visuals.tab) {
    return (
      <span className="shrink-0 w-3 h-5 -ml-2 rounded-r-full" style={{ backgroundColor: accent }} />
    );
  }
  return null;
}

/**
 * Sub-section and task rows share one set of style names. `level` only changes
 * small details (e.g. the tree line glyph). Everything is vertically centred.
 */
