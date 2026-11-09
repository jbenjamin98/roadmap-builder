export default function estimateItemHeight(
  labelText,
  itemWidth,
  isMilestone,
  hasEndMilestone,
  density
) {
  const minH = density?.itemMin || 38;
  if (density?.singleLine) return minH;

  const text = String(labelText || '').trim();
  if (!text) return minH;
  const chromePadding = isMilestone ? 56 : hasEndMilestone ? 52 : 26;
  const availablePx = Math.max(48, itemWidth - chromePadding);
  const avgCharPx = density?.charPx || 6.8;
  const charsPerLine = Math.max(6, Math.floor(availablePx / avgCharPx));

  const words = text.split(/\s+/);
  let lines = 1;
  let currentLineLen = 0;
  for (const word of words) {
    if (word.length > charsPerLine) {
      // Words are never broken mid-word: a long word just gets its own line.
      if (currentLineLen > 0) lines += 1;
      currentLineLen = word.length;
    } else if (currentLineLen + (currentLineLen > 0 ? 1 : 0) + word.length > charsPerLine) {
      lines += 1;
      currentLineLen = word.length;
    } else {
      currentLineLen += (currentLineLen > 0 ? 1 : 0) + word.length;
    }
  }

  const itemPad = density?.itemPad ?? 20;
  const lineH = density?.lineH ?? 16;
  return Math.max(minH, itemPad + lines * lineH);
}
