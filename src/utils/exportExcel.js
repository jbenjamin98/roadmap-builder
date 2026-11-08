import { calculatePeriods } from './dateUtils';
import { getCanvasTokens } from '../components/canvasStyles';
import { normalizeDesign } from '../constants/designOptions';
import { resolveMilestoneDesign } from '../components/styleHelpers';

const MILESTONE_GLYPHS = {
  diamond: '◆',
  circle: '●',
  square: '■',
  rounded: '▣',
  triangle: '▲',
  star: '★',
  flag: '⚑',
  hexagon: '⬢',
  shield: '⬟',
  cross: '✚',
};

const hex6 = (hex, fallback = '#6366f1') => {
  const m = String(hex || '').match(/^#?([0-9a-f]{6})/i);
  return (m ? m[1] : fallback.replace('#', '')).toUpperCase();
};
const argb = (hex, fallback) => `FF${hex6(hex, fallback)}`;

const luminance = (hex) => {
  const h = hex6(hex);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const textOn = (hex) => (luminance(hex) > 0.62 ? 'FF0F172A' : 'FFFFFFFF');

/** Blends a colour toward white (amount 0..1) and returns an ARGB string. */
const tint = (hex, amount) => {
  const h = hex6(hex);
  const mix = (i) => {
    const c = parseInt(h.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * amount)
      .toString(16)
      .padStart(2, '0');
  };
  return `FF${mix(0)}${mix(2)}${mix(4)}`.toUpperCase();
};

const colLetter = (n) => {
  let s = '';
  let x = n;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
};

const thinBorder = {
  top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

/**
 * Builds an .xlsx workbook that mirrors the roadmap: one row per task, one column per period,
 * bars drawn as coloured (merged) cells and milestones as shape glyphs. Returns a Blob.
 */
export async function buildRoadmapXlsx(roadmapState) {
  const mod = await import('exceljs');
  const ExcelJS = mod.default || mod;

  const { config, legend, sections, tasks, timelineItems } = roadmapState;
  const design = normalizeDesign(config?.design);
  const tokens = getCanvasTokens(config);
  const periods = calculatePeriods(config);
  const numbering = design.numbering || {};
  const glyph = MILESTONE_GLYPHS[design.milestone?.shape] || '◆';
  const msColor = resolveMilestoneDesign(design.milestone, tokens).color;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Roadmap Builder';
  wb.created = new Date();

  const ws = wb.addWorksheet('Roadmap', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 5, showGridLines: false }],
  });

  const lastCol = 1 + periods.length;
  ws.getColumn(1).width = 46;
  for (let i = 0; i < periods.length; i++) ws.getColumn(2 + i).width = 20;

  // Title block
  ws.mergeCells(1, 1, 1, lastCol);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = config?.name || 'Roadmap';
  titleCell.font = { bold: true, size: 18, color: { argb: argb(tokens.primary) } };
  titleCell.alignment = { vertical: 'middle' };
  ws.getRow(1).height = 30;

  const banner = design.banner || {};
  const info = [
    banner.subtitle,
    banner.owner ? `Owner: ${banner.owner}` : '',
    banner.version,
    periods.length
      ? `${periods[0].startDate} – ${periods[periods.length - 1].endDate}`
      : '',
  ]
    .filter(Boolean)
    .join('   •   ');
  ws.mergeCells(2, 1, 2, lastCol);
  const infoCell = ws.getCell(2, 1);
  infoCell.value = info;
  infoCell.font = { size: 11, color: { argb: 'FF475569' } };

  // Period headers (rows 4 and 5)
  periods.forEach((p, i) => {
    const accent = tokens.accents[i % tokens.accents.length] || tokens.primary;
    const head = ws.getCell(4, 2 + i);
    head.value = p.title;
    head.font = { bold: true, size: 11, color: { argb: textOn(accent) } };
    head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(accent) } };
    head.alignment = { horizontal: 'center', vertical: 'middle' };
    head.border = thinBorder;
    const dates = ws.getCell(5, 2 + i);
    dates.value = p.dateRange;
    dates.font = { size: 9, color: { argb: 'FF475569' } };
    dates.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tint(accent, 0.85) } };
    dates.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    dates.border = thinBorder;
  });
  ws.getRow(4).height = 22;
  ws.getRow(5).height = 28;
  ws.getCell(4, 1).value = '';

  let rowNum = 6;
  sections.forEach((section, secIdx) => {
    const accent = tokens.accents[secIdx % tokens.accents.length] || tokens.primary;

    // Section row
    const secRow = ws.getRow(rowNum);
    for (let c = 1; c <= lastCol; c++) {
      const cell = secRow.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(accent) } };
      cell.border = thinBorder;
    }
    const secLabel = secRow.getCell(1);
    secLabel.value = `${numbering.sections ? `${secIdx + 1}  ` : ''}${section.title}`;
    secLabel.font = { bold: true, size: 12, color: { argb: textOn(accent) } };
    secLabel.alignment = { vertical: 'middle' };
    secRow.height = 24;
    rowNum += 1;

    section.subSections.forEach((sub, subIdx) => {
      const subRow = ws.getRow(rowNum);
      for (let c = 1; c <= lastCol; c++) {
        const cell = subRow.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tint(accent, 0.82) } };
        cell.border = thinBorder;
      }
      const subLabel = subRow.getCell(1);
      subLabel.value = `    ${numbering.subSections ? `${secIdx + 1}.${subIdx + 1}  ` : ''}${sub.title}`;
      subLabel.font = { bold: true, size: 11, color: { argb: 'FF1F2937' } };
      subLabel.alignment = { vertical: 'middle' };
      subRow.height = 20;
      rowNum += 1;

      tasks
        .filter((t) => t.subSectionId === sub.id)
        .forEach((task, tIdx) => {
          const row = ws.getRow(rowNum);
          for (let c = 1; c <= lastCol; c++) row.getCell(c).border = thinBorder;
          const label = row.getCell(1);
          label.value = `            ${numbering.tasks ? `${secIdx + 1}.${subIdx + 1}.${tIdx + 1}  ` : ''}${task.title}`;
          label.font = { size: 11, color: { argb: 'FF111827' } };
          label.alignment = { vertical: 'middle', wrapText: true };
          row.height = 26;

          const used = new Set();
          timelineItems
            .filter((item) => item.taskId === task.id)
            .forEach((item) => {
              const category =
                legend.find((l) => l.id === item.legendId) || legend[0] || {
                  label: 'General',
                  color: tokens.primary,
                };
              const start = Math.max(1, Math.min(periods.length, Number(item.startPeriod) || 1));
              const duration = Math.max(
                1,
                Math.min(periods.length - start + 1, Number(item.duration) || 1)
              );
              const firstCol = 1 + start;
              const endCol = firstCol + duration - 1;
              const text = item.label || category.label;

              if (item.type === 'milestone') {
                const cell = row.getCell(endCol);
                cell.value = `${text}  ${glyph}`;
                cell.font = { bold: true, size: 11, color: { argb: argb(msColor) } };
                cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
                return;
              }

              let overlap = false;
              for (let c = firstCol; c <= endCol; c++) if (used.has(c)) overlap = true;
              for (let c = firstCol; c <= endCol; c++) used.add(c);

              const fillCell = (cell) => {
                cell.fill = {
                  type: 'pattern',
                  pattern: category.isStriped ? 'lightUp' : 'solid',
                  fgColor: { argb: argb(category.color) },
                  bgColor: { argb: tint(category.color, 0.55) },
                };
              };
              for (let c = firstCol; c <= endCol; c++) fillCell(row.getCell(c));

              if (duration > 1 && !overlap) {
                ws.mergeCells(rowNum, firstCol, rowNum, endCol);
              }
              const target = row.getCell(firstCol);
              target.value = item.hasEndMilestone ? `${text}  ${glyph}` : text;
              target.font = {
                bold: true,
                size: 10,
                color: { argb: category.isStriped ? 'FF0F172A' : textOn(category.color) },
              };
              target.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 };
            });

          rowNum += 1;
        });
    });
  });

  // Legend sheet
  const lg = wb.addWorksheet('Legend');
  lg.getColumn(1).width = 8;
  lg.getColumn(2).width = 40;
  lg.getRow(1).values = ['', 'Legend'];
  lg.getRow(1).font = { bold: true, size: 14 };
  legend.forEach((cat, i) => {
    const r = lg.getRow(2 + i);
    r.getCell(2).value = cat.label + (cat.isStriped ? ' (striped)' : '');
    const sw = r.getCell(1);
    sw.fill = {
      type: 'pattern',
      pattern: cat.isStriped ? 'lightUp' : 'solid',
      fgColor: { argb: argb(cat.color) },
      bgColor: { argb: tint(cat.color, 0.55) },
    };
    sw.border = thinBorder;
  });
  const msRow = lg.getRow(2 + legend.length);
  msRow.getCell(1).value = glyph;
  msRow.getCell(1).font = { bold: true, size: 14, color: { argb: argb(msColor) } };
  msRow.getCell(1).alignment = { horizontal: 'center' };
  msRow.getCell(2).value = 'Milestone';

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export { colLetter };

