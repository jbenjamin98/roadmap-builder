import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { buildRoadmapXlsx } from './exportExcel';
import { createBlankRoadmapState } from '../data/defaultState';

/** User-controlled text must always land in the workbook as plain text, never as a formula. */
describe('buildRoadmapXlsx', () => {
  it('writes formula-looking user text as string cells', async () => {
    const state = createBlankRoadmapState({ name: '=HYPERLINK("http://evil","x")' });
    state.sections[0].title = '=1+1';
    state.sections[0].subSections[0].title = '@SUM(A1)';
    state.tasks[0].title = '+cmd|calc';

    const blob = await buildRoadmapXlsx(state);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.getWorksheet('Roadmap');

    let checked = 0;
    ws.eachRow((row) =>
      row.eachCell((cell) => {
        expect(cell.type).not.toBe(ExcelJS.ValueType.Formula);
        expect(cell.formula).toBeUndefined();
        checked += 1;
      })
    );
    expect(checked).toBeGreaterThan(0);
    expect(String(ws.getCell(1, 1).value)).toContain('=HYPERLINK');
  });
});
