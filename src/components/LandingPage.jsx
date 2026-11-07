import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Upload,
  PlusCircle,
  Calendar,
  Layers,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Diamond,
  Sliders,
} from 'lucide-react';

export default function LandingPage({
  onCreateRoadmap,
  onUploadRoadmap,
  onContinueExisting,
  currentRoadmapName,
}) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileProcess = (file) => {
    if (!file) return;
    setUploadError('');

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setUploadError('Please select a valid .json roadmap file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object' || (!parsed.config && !parsed.sections)) {
          setUploadError(
            'Invalid roadmap JSON schema. Expected config, sections, tasks, and timelineItems.'
          );
          return;
        }
        onUploadRoadmap(parsed);
      } catch {
        setUploadError('Could not parse JSON file. Please verify the file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFileProcess(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleFileProcess(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col justify-between">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] rounded-full bg-fuchsia-600/15 blur-[130px]" />
        <div className="absolute -bottom-48 left-1/3 w-[38rem] h-[38rem] rounded-full bg-teal-500/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">Roadmap</span>
            <span className="font-bold text-lg tracking-tight text-indigo-400">Studio</span>
            <span className="ml-2.5 text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
              Local-First
            </span>
          </div>
        </div>

        <button
          onClick={onContinueExisting}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <span>Open Active Workspace</span>
          <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 lg:py-12 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero Column */}
        <div className="lg:col-span-7 space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zero Cloud Lock-In • Instant Browser Persistence • PNG & JSON Export</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Architect executive{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-teal-300">
              product roadmaps
            </span>{' '}
            with precision.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Build modular, multi-track strategic timelines right in your browser. Drag-and-drop to
            reorder hierarchy, snap task bars and milestone diamonds across custom sprint or quarter
            cadences, and export crisp presentation visuals in one click.
          </p>

          {/* Primary Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onCreateRoadmap}
              data-testid="create-roadmap-btn"
              className="group inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 border border-indigo-400/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-5 h-5 text-indigo-100" />
              <span>Create Roadmap</span>
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
            </button>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                data-testid="upload-json-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-roadmap-btn"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all border ${
                  isDraggingOver
                    ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <Upload className="w-5 h-5 text-teal-400" />
                <span>Upload Roadmap (JSON)</span>
              </button>
            </div>
          </div>

          {/* Error Alert if JSON upload fails */}
          {uploadError && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Quick Resume / Sample Banner */}
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Saved in browser:{' '}
              <button
                onClick={onContinueExisting}
                className="text-indigo-300 hover:text-indigo-200 underline underline-offset-4 font-medium"
              >
                {currentRoadmapName || 'Sample Roadmap'}
              </button>{' '}
              (auto-synced to <code className="text-slate-300">roadmap_builder_state_v1</code>)
            </span>
          </div>

          {/* Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Relative Period Math</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure Sprints, PIs, or Quarters with automatic date range headers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-fuchsia-400 font-semibold text-sm mb-1">
                <Sliders className="w-4 h-4" />
                <span>Snap-to-Grid Canvas</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click-and-drag to draw bars, resize across periods, and drop milestone diamonds.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm mb-1">
                <Download className="w-4 h-4" />
                <span>Presentation Ready</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switch to clean Preview Mode and export crisp PNGs or portable JSON files.
              </p>
            </div>
          </div>
        </div>

        {/* Right Hero Column: Interactive Visual Mockup Preview */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl p-6 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-indigo-950/80 border border-indigo-500/25 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl">
            {/* Mockup Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/90">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Live Canvas Preview
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  Q4–Q1 Cloud Architecture Roadmap
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* Mockup Legend */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { label: 'Core Platform', color: 'from-indigo-500 to-purple-500' },
                { label: 'Security & Trust', color: 'from-emerald-500 to-teal-500' },
                { label: 'AI Experience', color: 'from-pink-500 to-rose-500' },
                { label: 'Release Gate', color: 'from-amber-500 to-orange-500' },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/70 text-slate-200"
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${badge.color}`} />
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Mockup Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-400 uppercase pb-1 border-b border-slate-800">
                <div>Sprint 1</div>
                <div>Sprint 2</div>
                <div>Sprint 3</div>
                <div>Sprint 4</div>
              </div>

              {/* Section 1 */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                01. Core Infrastructure
              </div>

              <div className="space-y-2.5 pl-1">
                <div className="space-y-1">
                  <div className="text-xs text-slate-300 font-medium">
                    Multi-Region Edge Federation
                  </div>
                  <div className="h-7 rounded-lg bg-slate-950/70 border border-slate-800/80 p-1 grid grid-cols-4 gap-1 items-center relative">
                    <div className="col-span-3 h-5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-semibold text-white px-2 flex items-center justify-between shadow-sm">
                      <span>Region Mesh Rollout</span>
                      <Diamond className="w-3 h-3 fill-white text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-300 font-medium">
                    Zero-Trust Policy Engine
                  </div>
                  <div className="h-7 rounded-lg bg-slate-950/70 border border-slate-800/80 p-1 grid grid-cols-4 gap-1 items-center">
                    <div />
                    <div className="col-span-2 h-5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-semibold text-white px-2 flex items-center shadow-sm">
                      <span>SSO & IAM Audit</span>
                    </div>
                    <div className="flex justify-center">
                      <span className="w-4 h-4 rotate-45 rounded-[3px] bg-gradient-to-br from-amber-400 to-orange-500 inline-block shadow-md shadow-amber-500/30 border border-white/40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1.5 rounded-lg mt-2">
                02. Customer Experience
              </div>

              <div className="space-y-1 pl-1">
                <div className="text-xs text-slate-300 font-medium">
                  Real-Time Analytics Studio
                </div>
                <div className="h-7 rounded-lg bg-slate-950/70 border border-slate-800/80 p-1 grid grid-cols-4 gap-1 items-center">
                  <div />
                  <div className="col-span-3 h-5 rounded-md bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-semibold text-white px-2 flex items-center justify-between shadow-sm">
                    <span>Telemetry Canvas GA</span>
                    <Diamond className="w-3 h-3 fill-white text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>6 Glassmorphic Themes + Custom Palette</span>
              <button
                onClick={onContinueExisting}
                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div>Roadmap Studio • Local-First Modular Architecture</div>
        <div>roadmap.jacob-benjamin.com</div>
      </footer>
    </div>
  );
}
