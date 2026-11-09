export function CanvasOverlays({ effects = {}, tokens, radiusClass = 'rounded-3xl' }) {
  const layers = [];
  const base = `pointer-events-none absolute inset-0 z-[45] ${radiusClass}`;
  const flat = Boolean(effects.flat);

  if (effects.grain && !flat) {
    layers.push(
      <div
        key="grain"
        aria-hidden="true"
        className={`${base} opacity-[0.075]`}
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 0), radial-gradient(rgba(0,0,0,0.6) 1px, transparent 0)',
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 3px 3px',
        }}
      />
    );
  }
  if (effects['retro-scan']) {
    layers.push(
      <div
        key="scan"
        aria-hidden="true"
        className={`${base} opacity-[0.08]`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(56,189,248,0.45) 0px, rgba(56,189,248,0.45) 1px, transparent 1px, transparent 4px)',
        }}
      />
    );
  }
  if (effects.spotlight && !flat) {
    layers.push(
      <div
        key="spot"
        aria-hidden="true"
        className={base}
        style={{
          background: `radial-gradient(ellipse at 15% 0%, ${tokens.primary}44 0%, transparent 55%), radial-gradient(ellipse at 88% 100%, ${
            tokens.accents[1] || tokens.primary
          }33 0%, transparent 50%), radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,${
            tokens.isLight ? '0.12' : '0.3'
          }) 100%)`,
        }}
      />
    );
  }
  if (effects.watercolor && !flat) {
    layers.push(
      <div
        key="water"
        aria-hidden="true"
        className={base}
        style={{
          background: `radial-gradient(circle at 8% 18%, ${tokens.accents[0]}26 0%, transparent 38%), radial-gradient(circle at 92% 55%, ${tokens.accents[1]}26 0%, transparent 40%), radial-gradient(circle at 50% 100%, ${tokens.accents[2]}22 0%, transparent 42%)`,
        }}
      />
    );
  }
  if (effects.metallic && !flat) {
    layers.push(
      <div
        key="metal"
        aria-hidden="true"
        className={base}
        style={{
          background:
            'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.10) 28%, transparent 42%, rgba(255,255,255,0.07) 68%, transparent 100%)',
        }}
      />
    );
  }
  if (effects.sketch && !flat) {
    layers.push(
      <div
        key="sketch"
        aria-hidden="true"
        className={`${base} opacity-[0.07]`}
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${
            tokens.isLight ? '#0f172a' : '#f8fafc'
          } 0px, ${tokens.isLight ? '#0f172a' : '#f8fafc'} 1px, transparent 1px, transparent 26px)`,
        }}
      />
    );
  }
  if (effects['graph-paper'] && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="graph"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.1,
          backgroundImage: `linear-gradient(rgba(${ink},1) 1px, transparent 1px), linear-gradient(90deg, rgba(${ink},1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    );
  }
  if (effects['dot-grid'] && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="dots"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.16,
          backgroundImage: `radial-gradient(rgba(${ink},1) 1.2px, transparent 1.6px)`,
          backgroundSize: '18px 18px',
        }}
      />
    );
  }
  if (effects['diagonal-hatch'] && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="hatch"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.07,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(${ink},1) 0px, rgba(${ink},1) 1px, transparent 1px, transparent 10px)`,
        }}
      />
    );
  }
  if (effects.pinstripe && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="pin"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.07,
          backgroundImage: `repeating-linear-gradient(90deg, rgba(${ink},1) 0px, rgba(${ink},1) 1px, transparent 1px, transparent 26px)`,
        }}
      />
    );
  }
  if (effects.checker && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="checker"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.05,
          backgroundImage: `repeating-conic-gradient(rgba(${ink},1) 0% 25%, transparent 0% 50%)`,
          backgroundSize: '32px 32px',
        }}
      />
    );
  }
  if (effects['corner-glow'] && !flat) {
    const a = tokens.accents;
    layers.push(
      <div
        key="corners"
        aria-hidden="true"
        className={base}
        style={{
          background: `radial-gradient(circle at 0% 0%, ${a[0]}38 0%, transparent 38%), radial-gradient(circle at 100% 0%, ${a[1]}38 0%, transparent 38%), radial-gradient(circle at 0% 100%, ${a[2]}38 0%, transparent 38%), radial-gradient(circle at 100% 100%, ${a[3] || a[0]}38 0%, transparent 38%)`,
        }}
      />
    );
  }
  if (effects.stitched && !flat) {
    layers.push(
      <div
        key="stitch"
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 z-[100] rounded-[20px] border-2 border-dashed opacity-40"
        style={{ borderColor: tokens.textMain }}
      />
    );
  }
  return <>{layers}</>;
}
