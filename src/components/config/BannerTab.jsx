import { inputCls } from './navConfig';
import { Layers, Trash2, Upload } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { AppianLogo } from '../parts/AppianParts';
import { APPIAN_PRESETS } from '../../constants/brandThemes';

export default function BannerTab({ ctx }) {
  const { design, panelTitle, updateBanner } = ctx;
  const brandPreset = APPIAN_PRESETS.find((p) => p.id === design.brandTheme);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        message: 'Please select a valid image file (PNG, JPG, SVG, WebP).',
        tone: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl !== 'string') return;

      if (file.type === 'image/svg+xml') {
        updateBanner({ logo: dataUrl });
        return;
      }

      // Raster image: downscale to max 256x256 to protect localStorage quota
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 256;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
          ctx2d.drawImage(img, 0, 0, width, height);
          updateBanner({ logo: canvas.toDataURL('image/png') });
        } else {
          updateBanner({ logo: dataUrl });
        }
      };
      img.onerror = () => {
        showToast({ message: 'Failed to process selected image.', tone: 'error' });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {panelTitle(Layers, 'text-indigo-600 dark:text-indigo-400', 'Header Details (Optional)')}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Shown in the roadmap header and in exports. The owner appears on the right side of the
        header.
      </p>

      <div className="grid grid-cols-1 gap-4 max-w-xl">
        {/* Custom Header Logo / Image (replaced by the brand logo while an Appian theme is active) */}
        {design.brandTheme ? (
          <div data-testid="banner-logo-brand-note">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Header Logo / Image
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
              <div
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0"
                style={{ background: brandPreset?.surfaceBg || '#FFFFFF' }}
              >
                <AppianLogo variant={brandPreset?.tokenOverrides.brand.logo} height={22} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                The Appian logo is applied by the brand theme and can&apos;t be changed. Any logo
                you uploaded is kept and returns when you leave the theme.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Header Logo / Image
            </label>
            {design.banner?.logo ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
                <div className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img
                    src={design.banner.logo}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Custom header image
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Replaces sparkle icon; automatically scaled.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    data-testid="banner-logo-replace-btn"
                  >
                    <span>Replace</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                      data-testid="banner-logo-file-input"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => updateBanner({ logo: '' })}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove image"
                    aria-label="Remove image"
                    data-testid="banner-logo-remove-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer transition-colors text-center group"
                data-testid="banner-logo-upload-dropzone"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Click to upload header image or logo
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    PNG, SVG, JPG, WebP (auto-scaled)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                  data-testid="banner-logo-file-input"
                />
              </label>
            )}
          </div>
        )}

        {[
          ['subtitle', 'Subtitle / strategic goal'],
          ['owner', 'Owner / Team'],
          ['version', 'Version (e.g. v2.4)'],
        ].map(([key, label]) => {
          // Owner is always Appian in a brand theme; the saved value is kept for later.
          const locked = key === 'owner' && Boolean(design.brandTheme);
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {label}
              </label>
              <input
                type="text"
                aria-label={label}
                data-testid={`banner-${key}-input`}
                value={locked ? '' : design.banner?.[key] || ''}
                placeholder={locked ? 'Appian (set by the brand theme)' : undefined}
                disabled={locked}
                onChange={(e) => updateBanner({ [key]: e.target.value })}
                className={`${inputCls} ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
