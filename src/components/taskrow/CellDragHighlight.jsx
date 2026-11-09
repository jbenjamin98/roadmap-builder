export default function CellDragHighlight({ color, testId }) {
  const isHex7 = typeof color === 'string' && color.startsWith('#') && color.length === 7;
  const bg = isHex7 ? `${color}14` : 'rgba(99, 102, 241, 0.10)';
  const border = isHex7 ? `${color}45` : 'rgba(99, 102, 241, 0.35)';
  const glow = isHex7 ? `${color}25` : 'rgba(99, 102, 241, 0.18)';
  const edge = isHex7 ? `${color}bb` : 'rgba(99, 102, 241, 0.75)';

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[10] transition-opacity duration-150"
      style={{
        backgroundColor: bg,
        boxShadow: `inset 0 0 0 1.5px ${border}, inset 0 0 16px -2px ${glow}`,
      }}
      data-testid={testId}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${edge}, transparent)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${edge}, transparent)`,
        }}
      />
    </div>
  );
}
