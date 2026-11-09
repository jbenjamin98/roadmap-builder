import { FONT_STYLES } from '../../constants/themes';
import { useEffect } from 'react';
import { Type } from 'lucide-react';
import { loadAllFonts } from '../../constants/fontLoaders';

export default function FontsTab({ ctx }) {
  const { fontStyle, panelTitle, setFontStyle } = ctx;

  // Each option previews in its own typeface, so fetch them when this tab opens.
  useEffect(() => {
    loadAllFonts();
  }, []);

  return (
    <div className="space-y-4">
      {panelTitle(Type, 'text-teal-600 dark:text-teal-400', 'Typography & Font Options')}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
        {FONT_STYLES.map((font) => (
          <button
            key={font.id}
            type="button"
            onClick={() => setFontStyle(font.id)}
            style={{ fontFamily: font.fontFamily }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              fontStyle === font.id
                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
              {font.name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{font.sample}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
