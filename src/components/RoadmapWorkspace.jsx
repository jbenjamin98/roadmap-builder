import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Edit3,
  Download,
  Settings,
  Home,
  Check,
  Loader2,
  Undo2,
  Redo2,
  PanelLeft,
} from 'lucide-react';
import Sidebar from './Sidebar';
import TimelineGrid from './TimelineGrid';
import ThemeModeToggle from './ThemeModeToggle';
import ExportModal from './ExportModal';
import { getCanvasTokens } from './canvasStyles';
import { resolveMilestoneDesign } from './styleHelpers';
import { buildRoadmapXlsx } from '../utils/exportExcel';
import { nextPaint, printRoadmapPdf, renderRoadmapPng } from '../utils/exportUtils';
import { downloadBlob, downloadRoadmapJson, slugifyName } from '../utils/download';
import { loadFont } from '../constants/fontLoaders';
import { useRoadmap } from '../state/roadmapContext';
import BackupChip from './backup/BackupChip';
import BackupNagBanner from './backup/BackupNagBanner';

export default function RoadmapWorkspace({
  onOpenConfigModal,
  onNavigateHome,
  themeMode,
  onChangeThemeMode,
}) {
  const { roadmapState, actions, undo, redo, canUndo, canRedo, markBackedUp } = useRoadmap();
  const {
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
  } = actions;
  const [mode, setMode] = useState('editor'); // 'editor' | 'preview'
  // Below the `lg` breakpoint the sidebar becomes an overlay drawer so the timeline keeps the screen.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportErrors, setExportErrors] = useState([]);
  const exportCanvasRef = useRef(null);

  const isPreview = mode === 'preview';
  const { config, legend, sections, tasks, timelineItems } = roadmapState;
  const tokens = getCanvasTokens(config);
  const primaryColor = tokens.primary;
  const accents = tokens.accents;

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // PNG and PDF render in Preview mode so inputs become plain text and editor-only
  // handles disappear; the previous mode is restored afterwards.
  const handleRunExport = async (selection) => {
    if (isExporting) return;
    setIsExporting(true);
    const previousMode = mode;
    const baseSlug = slugifyName(config.name);
    const done = [];
    const failed = [];
    setExportErrors([]);

    try {
      if (selection.json) {
        setExportStatus('Exporting JSON...');
        downloadRoadmapJson(roadmapState, baseSlug);
        markBackedUp('download');
        done.push('JSON');
        await pause(250);
      }

      if (selection.excel) {
        setExportStatus('Building Excel file...');
        try {
          const blob = await buildRoadmapXlsx(roadmapState);
          downloadBlob(blob, `${baseSlug}.xlsx`);
          done.push('Excel');
        } catch (err) {
          console.error('Failed to export Excel:', err);
          failed.push(`Excel: ${err?.message || err}`);
        }
        await pause(250);
      }

      if ((selection.png || selection.pdf) && exportCanvasRef.current) {
        setMode('preview');
        await loadFont(config.fontStyle); // never capture a fallback font
        await nextPaint();

        if (selection.png) {
          setExportStatus('Rendering PNG...');
          try {
            const blob = await renderRoadmapPng(exportCanvasRef.current, {
              backgroundColor: config?.theme?.secondary || '#0f172a',
              scale: 2,
            });
            downloadBlob(blob, `${baseSlug}.png`);
            done.push('PNG');
          } catch (err) {
            console.error('Failed to export PNG:', err);
            failed.push(`PNG: ${err?.message || err}`);
          }
          await pause(250);
        }

        if (selection.pdf) {
          // The print dialog is last because it blocks until it is closed.
          setExportStatus('Opening print dialog for PDF...');
          if (document.fonts?.ready) await document.fonts.ready;
          printRoadmapPdf(exportCanvasRef.current, baseSlug);
          done.push('PDF');
        }
      }
    } finally {
      setMode(previousMode);
      setIsExporting(false);
      if (failed.length) {
        // Keep the dialog open and show the real reason instead of failing silently.
        setExportErrors(failed);
        setExportStatus(`Exported ${done.join(', ') || 'nothing'}; ${failed.length} failed`);
      } else {
        setIsExportModalOpen(false);
        setExportStatus(`Exported ${done.join(', ')}`);
      }
      setTimeout(() => setExportStatus(''), 6000);
    }
  };

  return (
    <div
      style={{
        '--scrollbar-primary': primaryColor,
        '--scrollbar-accent': accents?.[0] || primaryColor,
        '--scrollbar-thumb-subtle': `${primaryColor}66`,
        '--scrollbar-thumb-subtle-hover': primaryColor,
      }}
      className="min-h-screen h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden"
    >
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

          {!isPreview && (
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-expanded={sidebarOpen}
              aria-controls="workspace-sidebar"
              data-testid="sidebar-toggle-btn"
              className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Show or hide the rows sidebar"
            >
              <PanelLeft className="w-4 h-4" aria-hidden="true" />
              <span>Rows</span>
            </button>
          )}

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
              {sections.length} Sections • {tasks.length} Tasks • {timelineItems.length} Timeline
              Items
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

          <div className="flex items-center gap-1" role="group" aria-label="History">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              data-testid="undo-btn"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              data-testid="redo-btn"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800"
            >
              <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <BackupChip />

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
            onClick={() => setIsExportModalOpen(true)}
            disabled={isExporting}
            data-testid="export-btn"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
            title="Choose what to export: JSON, PNG, PDF or Excel"
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

      <BackupNagBanner />

      {/* Main Workspace Split Pane: Left Sidebar (Editor only) + Right Timeline Grid */}
      <div className="relative flex-1 min-h-0 flex flex-row overflow-hidden">
        {!isPreview && (
          <div
            id="workspace-sidebar"
            className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex absolute lg:static inset-y-0 left-0 z-20 lg:z-auto w-[min(22rem,90vw)] lg:w-auto shrink-0 shadow-2xl lg:shadow-none`}
          >
            <Sidebar
              legend={legend}
              sections={sections}
              tasks={tasks}
              theme={config.theme}
              milestoneDesign={resolveMilestoneDesign(
                config.design?.milestone,
                getCanvasTokens(config)
              )}
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
          </div>
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
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setExportErrors([]);
        }}
        onExport={handleRunExport}
        isExporting={isExporting}
        errors={exportErrors}
      />
    </div>
  );
}
