import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Eye,
  Edit3,
  Download,
  Settings,
  Home,
  Check,
  Loader2,
} from 'lucide-react';
import Sidebar from './Sidebar';
import TimelineGrid from './TimelineGrid';
import ThemeModeToggle from './ThemeModeToggle';

export default function RoadmapWorkspace({
  roadmapState,
  onOpenConfigModal,
  onNavigateHome,
  onAddLegendCategory,
  onUpdateLegendCategory,
  onDeleteLegendCategory,
  onAddSection,
  onUpdateSectionTitle,
  onDeleteSection,
  onReorderSections,
  onAddSubSection,
  onUpdateSubSectionTitle,
  onDeleteSubSection,
  onReorderSubSections,
  onAddTask,
  onUpdateTaskTitle,
  onDeleteTask,
  onReorderTasks,
  onAddTimelineItem,
  onUpdateTimelineItem,
  onDeleteTimelineItem,
  themeMode,
  onChangeThemeMode,
}) {
  const [mode, setMode] = useState('editor'); // 'editor' | 'preview'
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const exportCanvasRef = useRef(null);

  const isPreview = mode === 'preview';
  const { config, legend, sections, tasks, timelineItems } = roadmapState;

  const slugifyName = (name) =>
    String(name || 'roadmap')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'roadmap';

  const triggerJsonDownload = (baseSlug) => {
    const dataStr = JSON.stringify(roadmapState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseSlug}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!exportCanvasRef.current || isExporting) return;
    setIsExporting(true);
    setExportStatus('Exporting JSON & PNG...');

    const baseSlug = slugifyName(config.name);

    // 1. Download JSON immediately
    triggerJsonDownload(baseSlug);

    // 2. Render and download high-res PNG with baseline & input fixes
    try {
      const targetNode = exportCanvasRef.current;
      const canvas = await html2canvas(targetNode, {
        scale: 2,
        useCORS: true,
        backgroundColor: config?.theme?.secondary || '#0f172a',
        logging: false,
        windowWidth: targetNode.scrollWidth + 64,
        windowHeight: targetNode.scrollHeight + 64,
        onclone: (clonedDoc, clonedEl) => {
          // Fix Tailwind preflight `img { display: block }` which shifts html2canvas font baseline downward
          const styleFix = clonedDoc.createElement('style');
          styleFix.innerHTML = `
            img { display: inline-block !important; }
            [data-export-text="true"] {
              overflow: visible !important;
              line-height: 1.35 !important;
              padding-bottom: 2px !important;
            }
          `;
          clonedDoc.head.appendChild(styleFix);

          // Hide editor-only action buttons (like "+ Sub", "+ Task", "+MS") in PNG output
          clonedEl.querySelectorAll('[data-editor-control="true"]').forEach((el) => {
            el.style.display = 'none';
          });

          // Replace any live <input> or <textarea> inside the canvas with static wrapping <div>s
          clonedEl.querySelectorAll('input, textarea').forEach((inputEl) => {
            const div = clonedDoc.createElement('div');
            div.textContent = inputEl.value || inputEl.placeholder || '';
            div.className = inputEl.className;
            div.style.cssText = inputEl.style.cssText;
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordBreak = 'break-word';
            div.style.overflow = 'visible';
            div.style.lineHeight = '1.35';
            div.style.paddingBottom = '2px';
            div.style.display = 'block';
            div.style.height = 'auto';
            inputEl.parentNode?.replaceChild(div, inputEl);
          });
        },
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${baseSlug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportStatus('JSON & PNG exported!');
    } catch (err) {
      console.error('Failed to export PNG via html2canvas:', err);
      setExportStatus('JSON exported (PNG failed)');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Workspace Control Bar */}
      <header className="px-4 sm:px-6 py-3 bg-white dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-sm">
        {/* Left Navigation & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onNavigateHome}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/70 transition-colors"
            title="Back to Landing Page"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {config.name}
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                {config.totalPeriods} {config.periodLabel}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {sections.length} Sections • {tasks.length} Tasks • {timelineItems.length} Timeline Items
            </div>
          </div>
        </div>

        {/* Center Mode Switcher: Editor vs Preview */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMode('editor')}
            data-testid="mode-editor-btn"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isPreview
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('preview')}
            data-testid="mode-preview-btn"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPreview
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Right Actions: Identical in Editor and Preview Mode */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {exportStatus && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              <span>{exportStatus}</span>
            </span>
          )}

          <ThemeModeToggle themeMode={themeMode} onChangeThemeMode={onChangeThemeMode} />

          <button
            type="button"
            onClick={onOpenConfigModal}
            data-testid="open-config-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Configure timeline, grid display, and theme"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Configure</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            data-testid="export-btn"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
            title="Download both JSON and high-resolution PNG"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split Pane: Left Sidebar (Editor only) + Right Timeline Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {!isPreview && (
          <Sidebar
            legend={legend}
            sections={sections}
            tasks={tasks}
            theme={config.theme}
            onAddLegendCategory={onAddLegendCategory}
            onUpdateLegendCategory={onUpdateLegendCategory}
            onDeleteLegendCategory={onDeleteLegendCategory}
            onAddSection={onAddSection}
            onUpdateSectionTitle={onUpdateSectionTitle}
            onDeleteSection={onDeleteSection}
            onReorderSections={onReorderSections}
            onAddSubSection={onAddSubSection}
            onUpdateSubSectionTitle={onUpdateSubSectionTitle}
            onDeleteSubSection={onDeleteSubSection}
            onReorderSubSections={onReorderSubSections}
            onAddTask={onAddTask}
            onUpdateTaskTitle={onUpdateTaskTitle}
            onDeleteTask={onDeleteTask}
            onReorderTasks={onReorderTasks}
          />
        )}

        <TimelineGrid
          exportRef={exportCanvasRef}
          config={config}
          legend={legend}
          sections={sections}
          tasks={tasks}
          timelineItems={timelineItems}
          isPreview={isPreview}
          onAddSubSection={onAddSubSection}
          onAddTask={onAddTask}
          onUpdateSectionTitle={onUpdateSectionTitle}
          onUpdateSubSectionTitle={onUpdateSubSectionTitle}
          onUpdateTaskTitle={onUpdateTaskTitle}
          onAddTimelineItem={onAddTimelineItem}
          onUpdateTimelineItem={onUpdateTimelineItem}
          onDeleteTimelineItem={onDeleteTimelineItem}
        />
      </div>
    </div>
  );
}
