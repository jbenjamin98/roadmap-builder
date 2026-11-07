import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Eye,
  Edit3,
  Download,
  FileJson,
  Image as ImageIcon,
  Settings,
  Home,
  RotateCcw,
  Grid,
  Rows,
  Check,
  Loader2,
  Upload,
} from 'lucide-react';
import Sidebar from './Sidebar';
import TimelineGrid from './TimelineGrid';

export default function RoadmapWorkspace({
  roadmapState,
  onOpenConfigModal,
  onNavigateHome,
  onResetToSample,
  onUploadJson,
  onTogglePreviewSetting,
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
}) {
  const [mode, setMode] = useState('editor'); // 'editor' | 'preview'
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const exportCanvasRef = useRef(null);
  const fileUploadRef = useRef(null);

  const isPreview = mode === 'preview';
  const { config, legend, sections, tasks, timelineItems } = roadmapState;

  const slugifyName = (name) =>
    String(name || 'roadmap')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'roadmap';

  const handleExportJson = () => {
    const dataStr = JSON.stringify(roadmapState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugifyName(config.name)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportStatus('JSON exported!');
    setTimeout(() => setExportStatus(''), 2500);
  };

  const handleExportPng = async () => {
    if (!exportCanvasRef.current || isExportingPng) return;
    setIsExportingPng(true);
    setExportStatus('Rendering high-res PNG...');

    try {
      const targetNode = exportCanvasRef.current;
      const canvas = await html2canvas(targetNode, {
        scale: 2,
        useCORS: true,
        backgroundColor: config?.theme?.secondary || '#0f172a',
        logging: false,
        windowWidth: targetNode.scrollWidth + 64,
        windowHeight: targetNode.scrollHeight + 64,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${slugifyName(config.name)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportStatus('PNG downloaded!');
    } catch (err) {
      console.error('Failed to export PNG via html2canvas:', err);
      setExportStatus('PNG export failed');
    } finally {
      setIsExportingPng(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleQuickJsonUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        onUploadJson(parsed);
        setExportStatus('Roadmap imported!');
        setTimeout(() => setExportStatus(''), 2500);
      } catch {
        setExportStatus('Invalid JSON file');
        setTimeout(() => setExportStatus(''), 2500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Workspace Control Bar */}
      <header className="px-4 sm:px-6 py-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30">
        {/* Left Navigation & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onNavigateHome}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition-colors"
            title="Back to Landing Page"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                {config.name}
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {config.totalPeriods} {config.periodLabel}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Auto-saved to <code className="text-slate-300">localStorage</code> •{' '}
              {sections.length} Sections • {tasks.length} Tasks •{' '}
              {timelineItems.length} Timeline Items
            </div>
          </div>
        </div>

        {/* Center Mode Switcher: Editor vs Preview */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('editor')}
            data-testid="mode-editor-btn"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isPreview
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
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
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Right Actions: Preview Toggles (when in Preview), Config, Upload/Reset, Export JSON, Export PNG */}
        <div className="flex items-center gap-2 flex-wrap">
          {exportStatus && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              <span>{exportStatus}</span>
            </span>
          )}

          {/* Minor Design Toggles exposed in Preview Mode (and available anytime) */}
          {isPreview && (
            <div
              className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800"
              data-testid="preview-design-toggles"
            >
              <button
                type="button"
                onClick={() =>
                  onTogglePreviewSetting(
                    'alternateRowHighlighting',
                    !(config.previewSettings?.alternateRowHighlighting ?? true)
                  )
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  config.previewSettings?.alternateRowHighlighting ?? true
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle alternate row highlighting"
              >
                <Rows className="w-3.5 h-3.5" />
                <span>Alt Rows</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTogglePreviewSetting(
                    'subtleGridDemarcations',
                    !(config.previewSettings?.subtleGridDemarcations ?? true)
                  )
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  config.previewSettings?.subtleGridDemarcations ?? true
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle subtle grid demarcations between periods and sections"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid Lines</span>
              </button>
            </div>
          )}

          {!isPreview && (
            <>
              <button
                type="button"
                onClick={onOpenConfigModal}
                data-testid="open-config-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Configure periods, dates, and theme"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Configure</span>
              </button>

              <input
                ref={fileUploadRef}
                type="file"
                accept=".json,application/json"
                onChange={handleQuickJsonUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileUploadRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Import Roadmap JSON"
              >
                <Upload className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden xl:inline">Import</span>
              </button>

              <button
                type="button"
                onClick={onResetToSample}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                title="Reset to sample roadmap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Export JSON Button */}
          <button
            type="button"
            onClick={handleExportJson}
            data-testid="export-json-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>Export JSON</span>
          </button>

          {/* Export PNG Button */}
          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExportingPng}
            data-testid="export-png-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {isExportingPng ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
            <span>Export PNG</span>
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
