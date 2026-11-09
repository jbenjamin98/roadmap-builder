/**
 * Domain model for Roadmap Builder. Pure type declarations (no runtime code).
 * Source of truth for runtime shape/defaults:
 *   - src/data/defaultState.js         (createBlankRoadmapState, normalizeRoadmapState)
 *   - src/constants/designOptions.js   (getDefaultDesign, normalizeDesign)
 * Use in JS via JSDoc:  /** @type {import('../types/roadmap').RoadmapState} *\/
 */

/** Whole saved document. Persisted to localStorage and exported/imported as JSON. */
export interface RoadmapState {
  id: string; // `rm-...`
  updatedAt: string; // ISO timestamp
  version: 1;
  config: RoadmapConfig;
  legend: LegendCategory[];
  sections: Section[];
  tasks: Task[];
  timelineItems: TimelineItem[];
}

export interface RoadmapConfig {
  name: string;
  /** One of PERIOD_TYPES[].value, e.g. 'Sprints' | 'Weeks' | 'Months' | 'Quarters' | 'PIs' */
  periodLabel: string;
  startDate: string; // YYYY-MM-DD
  weeksPerPeriod: number; // 1..52
  totalPeriods: number; // 1..36 in the UI (calculatePeriods clamps to 52)
  fontStyle: string; // FONT_STYLES[].id
  themeId: string; // PRESET_THEMES[].id or 'custom'
  theme: CanvasTheme;
  previewSettings: {
    alternateRowHighlighting: boolean;
    subtleGridDemarcations: boolean;
  };
  design: Design;
}

export interface CanvasTheme {
  baseMode?: 'light' | 'dark';
  primary: string; // hex
  secondary: string; // hex
  accents: [string, string, string, string]; // exactly 4 hex colours
}

export interface LegendCategory {
  id: string; // `leg-...`
  label: string;
  color: string;
  gradient: string; // CSS background
  hasBorder: boolean;
  borderColor: string;
  isStriped: boolean;
}

export interface Section {
  id: string; // `sec-...`
  title: string;
  collapsed?: boolean;
  subSections: SubSection[];
}

export interface SubSection {
  id: string; // `sub-...`
  title: string;
}

export interface Task {
  id: string; // `task-...`
  subSectionId: string;
  title: string;
}

/** A bar or milestone placed on a task row. Periods are 1-based. */
export interface TimelineItem {
  id: string; // `item-...`
  taskId: string;
  startPeriod: number; // >= 1
  duration: number; // >= 1 (periods)
  type: 'bar' | 'milestone';
  legendId: string; // LegendCategory.id
  label: string;
  hasEndMilestone: boolean;
}

/** Per-roadmap visual options. All ids come from the catalogs in src/constants/designOptions.js. */
export interface Design {
  milestone: {
    shape: string; // MILESTONE_SHAPES
    color: string; // hex or 'auto'
    borderStyle: string; // MILESTONE_BORDER_STYLES
    borderColor: string; // hex or 'auto'
    borderWidth: number;
  };
  dateFormat: string; // DATE_FORMATS[].id (date-fns pattern)
  /** Keyed by EFFECT_TOGGLES ids. 'flat' disables every other effect (see normalizeDesign). */
  effects: Record<string, boolean>;
  condensedModes: string[]; // CONDENSED_MODES ids
  periodHeaderStyle: string;
  sectionStyle: string; // ids starting with 'rotated-' render as a vertical spine
  subSectionStyle: string;
  taskStyle: string;
  itemStyle: string;
  todayMarker: boolean;
  alternateColumnShading: boolean;
  showBarDurationLabels: boolean;
  sectionDividerGlow: boolean;
  legendPosition: string; // LEGEND_POSITIONS ('hidden' hides it)
  legendStyle: string;
  legend: {
    showTitle: boolean;
    includeMilestone: boolean;
    swatchShape: string;
    size: string;
    layout: string;
    align: string;
    title: string;
    frame: string;
    labelCase: string;
    gap: string;
    milestoneLabel: string;
  };
  numbering: { sections: boolean; subSections: boolean; tasks: boolean };
  numberingStyle: string; // NUMBERING_STYLES
  headerStyle: string; // CANVAS_HEADER_STYLES
  canvasCorners: string; // CANVAS_CORNER_STYLES
  duckMode?: boolean;
  banner: { subtitle: string; owner: string; version: string; logo?: string };
}

/** Output of calculatePeriods(config) in src/utils/dateUtils.js. */
export interface Period {
  index: number; // 1-based
  code: string; // e.g. 'S1'
  title: string; // e.g. 'Sprint 1'
  dateRange: string;
  shortRange: string;
  startDate: string;
  endDate: string;
  rawStart: Date;
  rawEnd: Date;
}

/** Action callbacks returned by hooks/useRoadmapState and spread into RoadmapWorkspace. */
export interface RoadmapActions {
  onAddLegendCategory(c: Omit<LegendCategory, 'id'>): void;
  onUpdateLegendCategory(legendId: string, updates: Partial<LegendCategory>): void;
  onDeleteLegendCategory(legendId: string): void;
  onAddSection(): void;
  onUpdateSectionTitle(sectionId: string, title: string): void;
  onDeleteSection(sectionId: string): void;
  onReorderSections(activeId: string, overId: string): void;
  onAddSubSection(sectionId: string): void;
  onUpdateSubSectionTitle(sectionId: string, subSectionId: string, title: string): void;
  onDeleteSubSection(sectionId: string, subSectionId: string): void;
  onReorderSubSections(sectionId: string, activeId: string, overId: string): void;
  onAddTask(subSectionId: string): void;
  onUpdateTaskTitle(taskId: string, title: string): void;
  onDeleteTask(taskId: string): void;
  onReorderTasks(subSectionId: string, activeId: string, overId: string): void;
  onAddTimelineItem(item: Partial<TimelineItem> & { taskId: string }): string;
  onUpdateTimelineItem(itemId: string, updates: Partial<TimelineItem>): void;
  onDeleteTimelineItem(itemId: string): void;
}

/** Shared context passed into every settings tab `<XxxTab ctx={ctx} />` in ConfigModal. */
export interface ConfigModalContext {
  activeTab: string;
  setActiveTab(tab: string): void;
  name: string;
  setName(name: string): void;
  periodLabel: string;
  setPeriodLabel(l: string): void;
  startDate: string;
  setStartDate(d: string): void;
  weeksPerPeriod: number;
  setWeeksPerPeriod(w: number): void;
  totalPeriods: number;
  setTotalPeriods(n: number): void;
  fontStyle: string;
  setFontStyle(f: string): void;
  themeId: string;
  setThemeId(t: string): void;
  customTheme: CanvasTheme;
  setCustomTheme: React.Dispatch<React.SetStateAction<CanvasTheme>>;
  alternateRowHighlighting: boolean;
  setAlternateRowHighlighting(b: boolean): void;
  subtleGridDemarcations: boolean;
  setSubtleGridDemarcations(b: boolean): void;
  design: Design;
  setDesign: React.Dispatch<React.SetStateAction<Design>>;
  isPeriodLengthDisabled: boolean;
  selectedPreset: unknown;
  activeTheme: CanvasTheme;
  draftConfig: RoadmapConfig;
  previewPeriods: Period[];
  samplePeriod: Period;
  tokens: Record<string, unknown>;
  numbering: Design['numbering'];
  resolvedMilestone: Record<string, unknown>;
  accent: string;
  sampleCategory: LegendCategory;
  updateDesign(patch: Partial<Design>): void;
  updateMilestone(patch: Partial<Design['milestone']>): void;
  toggleEffect(id: string, checked: boolean): void;
  updateLegend(patch: Partial<Design['legend']>): void;
  updateBanner(patch: Partial<Design['banner']>): void;
  toggleCondensedMode(id: string): void;
  handlePeriodTypeChange(newLabel: string): void;
  handleAccentChange(idx: number, colorValue: string): void;
  handleCustomBaseModeChange(mode: 'light' | 'dark'): void;
  handleSubmit(e: React.FormEvent): void;
  isCreatingNew: boolean;
  onClose(): void;
  swatches: Record<string, Record<string, React.ReactNode>>;
}
