import { inputCls } from './navConfig';
import { Layers } from 'lucide-react';

export default function BannerTab({ ctx }) {
  const { design, panelTitle, updateBanner } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(Layers, 'text-indigo-600 dark:text-indigo-400', 'Header Details (Optional)')}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Shown in the roadmap header and in exports. The owner appears on the right side of the
        header.
      </p>
      <div className="grid grid-cols-1 gap-3 max-w-xl">
        {[
          ['subtitle', 'Subtitle / strategic goal'],
          ['owner', 'Owner / Team'],
          ['version', 'Version (e.g. v2.4)'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {label}
            </label>
            <input
              type="text"
              aria-label={label}
              value={design.banner?.[key] || ''}
              onChange={(e) => updateBanner({ [key]: e.target.value })}
              className={inputCls}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
