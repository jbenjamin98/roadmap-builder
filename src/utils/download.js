export const slugifyName = (name) =>
  String(name || 'roadmap')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'roadmap';

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Downloads the roadmap document as `<slug>.json` (the portable backup format). */
export function downloadRoadmapJson(
  roadmapState,
  baseSlug = slugifyName(roadmapState?.config?.name)
) {
  const blob = new Blob([JSON.stringify(roadmapState, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${baseSlug}.json`);
}

/** Downloads arbitrary text (used to rescue unreadable drafts). */
export function downloadText(text, filename, type = 'application/json') {
  downloadBlob(new Blob([text], { type }), filename);
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '';
  const num = Number(bytes);
  if (!Number.isFinite(num)) return '';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeTime(timestamp, now = Date.now()) {
  if (!timestamp) return 'never';
  let timeMs = 0;
  if (typeof timestamp === 'number') {
    timeMs = timestamp;
  } else if (timestamp instanceof Date) {
    timeMs = timestamp.getTime();
  } else if (typeof timestamp === 'string') {
    timeMs = Date.parse(timestamp);
  }
  if (!Number.isFinite(timeMs) || Number.isNaN(timeMs)) return 'never';

  const diffMs = (typeof now === 'number' ? now : Date.now()) - timeMs;
  const seconds = Math.max(0, Math.round(diffMs / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
