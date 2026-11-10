import { DuckEggIcon, YellowDuckIcon } from './DuckParts';
import { AppianNode } from './AppianParts';

export function LevelLabel({
  styleId = 'plain',
  level = 'task',
  accent,
  badge = null,
  duckMode = false,
  children,
}) {
  const body = (
    <span className="flex items-center gap-2 min-w-0 flex-1">
      {badge}
      {children}
    </span>
  );
  const base = 'flex items-center gap-2 min-w-0 flex-1';

  if (duckMode) {
    return (
      <div className={base}>
        {level === 'sub' ? <DuckEggIcon size={14} /> : <YellowDuckIcon size={13} />}
        {body}
      </div>
    );
  }

  switch (styleId) {
    case 'appian-node':
      // Brand sub-section marker: filled node + SemiBold label.
      return (
        <div className={base}>
          <AppianNode height={14} color={accent} />
          {body}
        </div>
      );
    case 'appian-plain':
      // Brand task rows: no marker; the indent shows the hierarchy.
      return <div className={base}>{body}</div>;
    case 'duck-egg':
      return (
        <div className={base}>
          <DuckEggIcon size={14} />
          {body}
        </div>
      );
    case 'duckling':
      return (
        <div className={base}>
          <YellowDuckIcon size={13} />
          {body}
        </div>
      );
    case 'dot':
      return (
        <div className={base}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
          {body}
        </div>
      );
    case 'tree-line':
      return (
        <div className={base}>
          {level === 'sub' ? (
            <span
              className="w-3.5 h-0.5 rounded-full shrink-0"
              style={{ backgroundColor: accent }}
            />
          ) : (
            <span
              className="relative w-3.5 self-stretch shrink-0 min-h-[18px]"
              style={{ marginTop: -7, marginBottom: -7 }}
            >
              <span
                className="absolute left-0 w-0.5"
                style={{ top: 0, bottom: 0, backgroundColor: accent }}
              />
              <span
                className="absolute left-0 w-3.5 h-0.5 top-1/2 -translate-y-1/2"
                style={{ backgroundColor: accent }}
              />
            </span>
          )}
          {body}
        </div>
      );
    case 'left-bar':
      return (
        <div className={`${base} pl-2`} style={{ borderLeft: `3px solid ${accent}` }}>
          {body}
        </div>
      );
    case 'soft-fill':
      return (
        <div
          className={`${base} px-2 py-0.5 rounded-md`}
          style={{ backgroundColor: `${accent}1e` }}
        >
          {body}
        </div>
      );
    case 'outlined':
      return (
        <div
          className={`${base} px-2 py-0.5 rounded-lg`}
          style={{ border: `1.5px solid ${accent}77` }}
        >
          {body}
        </div>
      );
    case 'pill':
      return (
        <div
          className={`${base} px-2.5 py-0.5 rounded-full`}
          style={{
            backgroundColor: `${accent}22`,
            border: `1px solid ${accent}55`,
          }}
        >
          {body}
        </div>
      );
    case 'underline':
      return (
        <div className={`${base} pb-0.5`} style={{ borderBottom: `2px solid ${accent}` }}>
          {body}
        </div>
      );
    case 'gradient-fade':
      return (
        <div
          className={`${base} pl-2.5 pr-2 py-0.5 rounded-l-md`}
          style={{
            background: `linear-gradient(90deg, ${accent}40 0%, ${accent}00 100%)`,
          }}
        >
          {body}
        </div>
      );
    case 'tab-flag':
      return (
        <div
          className="flex items-stretch gap-0 min-w-0 flex-1 overflow-hidden rounded-md"
          style={{ backgroundColor: `${accent}18` }}
        >
          <span className="w-2 shrink-0" style={{ backgroundColor: accent }} />
          <div className="flex items-center gap-2 min-w-0 flex-1 px-2 py-0.5">{body}</div>
        </div>
      );
    case 'double-rule':
      return (
        <div
          className={`${base} py-0.5`}
          style={{
            borderTop: `1px solid ${accent}99`,
            borderBottom: `1px solid ${accent}99`,
          }}
        >
          {body}
        </div>
      );
    case 'corner-brackets': {
      const corner = (pos) => (
        <span
          key={pos}
          className="absolute w-1.5 h-1.5"
          style={{
            top: pos.startsWith('t') ? 0 : undefined,
            bottom: pos.startsWith('b') ? 0 : undefined,
            left: pos.endsWith('l') ? 0 : undefined,
            right: pos.endsWith('r') ? 0 : undefined,
            borderTop: pos.startsWith('t') ? `2px solid ${accent}` : undefined,
            borderBottom: pos.startsWith('b') ? `2px solid ${accent}` : undefined,
            borderLeft: pos.endsWith('l') ? `2px solid ${accent}` : undefined,
            borderRight: pos.endsWith('r') ? `2px solid ${accent}` : undefined,
          }}
        />
      );
      return (
        <div className={`${base} relative px-3 py-1`}>
          {['tl', 'tr', 'bl', 'br'].map(corner)}
          {body}
        </div>
      );
    }
    case 'glow-bar':
      return (
        <div
          className={`${base} pl-2`}
          style={{
            borderLeft: `3px solid ${accent}`,
            boxShadow: `-3px 0 8px -2px ${accent}`,
          }}
        >
          {body}
        </div>
      );
    case 'trailing-rule':
      return (
        <div className={base}>
          <span className="flex items-center gap-2 min-w-0">
            {badge}
            {children}
          </span>
          <span className="flex-1 h-px min-w-[14px]" style={{ backgroundColor: `${accent}99` }} />
        </div>
      );
    case 'double-bar':
      return (
        <div className={`${base} pl-2`} style={{ borderLeft: `4px double ${accent}` }}>
          {body}
        </div>
      );
    case 'dashed-box':
      return (
        <div
          className={`${base} px-2 py-0.5 rounded-lg`}
          style={{ border: `1.5px dashed ${accent}99` }}
        >
          {body}
        </div>
      );
    case 'shadow-card':
      return (
        <div
          className={`${base} px-2.5 py-0.5 rounded-md`}
          style={{
            backgroundColor: `${accent}12`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          {body}
        </div>
      );
    case 'arrow-ribbon':
      return (
        <div className="flex items-center min-w-0 flex-1">
          <span
            className="shrink-0"
            style={{
              width: 0,
              height: 0,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderLeft: `9px solid ${accent}`,
            }}
          />
          <div
            className="flex items-center gap-2 min-w-0 flex-1 px-2 py-0.5 rounded-r-md"
            style={{ backgroundColor: `${accent}1c` }}
          >
            {body}
          </div>
        </div>
      );
    case 'plain':
    default:
      return <div className={base}>{body}</div>;
  }
}
