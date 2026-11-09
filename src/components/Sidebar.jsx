import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Trash2,
  Tag,
  FolderPlus,
  Layers,
  Palette,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
import MilestoneMarker from './MilestoneMarker';
import { getCategoryBackground } from './canvasStyles';
import { getThemeLegendPresets } from '../constants/legendPresets';
import SortableSectionItem from './sidebar/SortableSectionItem';

export default function Sidebar({
  legend,
  sections,
  tasks,
  theme,
  milestoneDesign,
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
}) {
  const [newLegendLabel, setNewLegendLabel] = useState('');
  const [newLegendColor, setNewLegendColor] = useState(theme?.accents?.[0] || '#6366f1');
  const [newLegendGradient, setNewLegendGradient] = useState('');
  const [newLegendHasBorder, setNewLegendHasBorder] = useState(false);
  const [newLegendBorderColor, setNewLegendBorderColor] = useState('#ffffff');
  const [newLegendIsStriped, setNewLegendIsStriped] = useState(false);

  const [editingLegendId, setEditingLegendId] = useState(null);
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [hierarchyExpanded, setHierarchyExpanded] = useState(true);

  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [collapsedSubSections, setCollapsedSubSections] = useState(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSectionDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderSections(active.id, over.id);
  };

  const toggleSectionCollapse = (secId) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) {
        next.delete(secId);
      } else {
        next.add(secId);
      }
      return next;
    });
  };

  const toggleSubSectionCollapse = (subId) => {
    setCollapsedSubSections((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) {
        next.delete(subId);
      } else {
        next.add(subId);
      }
      return next;
    });
  };

  const allSectionIds = sections.map((s) => s.id);
  const allSubSectionIds = sections.flatMap((s) => s.subSections.map((sub) => sub.id));
  const areAllCollapsed =
    allSectionIds.length > 0 && allSectionIds.every((id) => collapsedSections.has(id));

  const handleToggleCollapseAll = () => {
    if (areAllCollapsed) {
      setCollapsedSections(new Set());
      setCollapsedSubSections(new Set());
    } else {
      setCollapsedSections(new Set(allSectionIds));
      setCollapsedSubSections(new Set(allSubSectionIds));
    }
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newLegendLabel.trim()) return;
    onAddLegendCategory({
      label: newLegendLabel.trim(),
      color: newLegendColor,
      gradient:
        newLegendGradient ||
        `linear-gradient(135deg, ${newLegendColor}ee 0%, ${newLegendColor}bb 100%)`,
      hasBorder: newLegendHasBorder,
      borderColor: newLegendBorderColor,
      isStriped: newLegendIsStriped,
    });
    setNewLegendLabel('');
    setNewLegendGradient('');
    setNewLegendHasBorder(false);
    setNewLegendIsStriped(false);
  };

  const themeSwatches = [
    theme?.primary || '#6366f1',
    ...(theme?.accents || ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b']),
  ];

  return (
    <aside
      className="w-full lg:w-80 xl:w-96 shrink-0 bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800/90 flex flex-col h-full select-none overflow-y-auto transition-colors"
      data-testid="editor-sidebar"
    >
      {/* Top Drag-and-Drop Milestone Palette Callout */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/90 bg-slate-50/70 dark:bg-slate-950/50">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
          <span>Timeline Quick-Drop Tools</span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
            Drag onto Grid
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Draggable Milestone Token */}
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/roadmap-item-type', 'milestone');
              e.dataTransfer.effectAllowed = 'copy';
            }}
            data-testid="draggable-milestone-tool"
            className="cursor-grab active:cursor-grabbing p-2.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 hover:border-amber-400/60 flex items-center gap-2.5 transition-all group"
            title="Drag and drop this Milestone onto any Task row & Period column in the timeline grid"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <MilestoneMarker
                milestoneDesign={milestoneDesign}
                isLight
                size={15}
                className="group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">Milestone</div>
              <div className="text-[10px] text-amber-700/80 dark:text-amber-300/70">
                Drop on period
              </div>
            </div>
          </div>

          {/* Draggable Bar Token */}
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/roadmap-item-type', 'bar');
              e.dataTransfer.effectAllowed = 'copy';
            }}
            data-testid="draggable-bar-tool"
            className="cursor-grab active:cursor-grabbing p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/30 hover:border-indigo-400/60 flex items-center gap-2.5 transition-all group"
            title="Drag onto any Task row or click-and-drag directly across cells on the grid"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Task Bar</div>
              <div className="text-[10px] text-indigo-700/80 dark:text-indigo-300/70">
                Draw or drop
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 1: Manage Legend / Categories */}
      <div className="border-b border-slate-200 dark:border-slate-800/90">
        <button
          type="button"
          onClick={() => setLegendExpanded(!legendExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Legend & Style Categories ({legend.length})
            </span>
          </div>
          {legendExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {legendExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* Existing Legend Categories */}
            <div className="space-y-2">
              {legend.map((cat) => {
                const isEditingStyle = editingLegendId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-2">
                      {/* Swatch Button to toggle style editor */}
                      <button
                        type="button"
                        onClick={() => setEditingLegendId(isEditingStyle ? null : cat.id)}
                        className="w-6 h-6 rounded-lg shrink-0 cursor-pointer shadow-sm transition-transform hover:scale-105"
                        style={{
                          background: getCategoryBackground(cat),
                          border: cat.hasBorder
                            ? `2px solid ${cat.borderColor || '#ffffff'}`
                            : '1px solid rgba(148, 163, 184, 0.35)',
                        }}
                        title="Edit category color, preset style, and border"
                      />

                      <input
                        type="text"
                        aria-label="Legend category name"
                        value={cat.label}
                        onChange={(e) => onUpdateLegendCategory(cat.id, { label: e.target.value })}
                        className="flex-1 min-w-0 bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 px-1.5 py-0.5 rounded"
                      />

                      {/* Style Editor Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setEditingLegendId(isEditingStyle ? null : cat.id)}
                        data-testid={`edit-legend-style-${cat.id}`}
                        className={`p-1 rounded-lg transition-colors ${
                          isEditingStyle
                            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                            : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
                        }`}
                        title="Customize color, gradient & border"
                      >
                        <Palette className="w-3.5 h-3.5" />
                      </button>

                      {legend.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteLegendCategory(cat.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                          title="Remove category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Expandable Style & Border Editor for this Legend Category */}
                    {isEditingStyle && (
                      <div className="px-3 pb-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 space-y-2.5 text-xs">
                        {/* Preset Gradient Picker */}
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Preset Styles & Custom Fill
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {getThemeLegendPresets(theme).map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() =>
                                  onUpdateLegendCategory(cat.id, {
                                    color: preset.color,
                                    gradient: preset.gradient,
                                  })
                                }
                                className={`w-6 h-6 rounded-lg border transition-transform ${
                                  cat.color === preset.color
                                    ? 'scale-110 ring-2 ring-indigo-400 border-white'
                                    : 'border-white/20 hover:scale-105'
                                }`}
                                style={{ background: preset.gradient }}
                                title={preset.name}
                              />
                            ))}

                            {/* Custom Color Input */}
                            <label
                              className="inline-flex items-center gap-1.5 ml-auto px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300"
                              title="Pick custom fill color"
                            >
                              <input
                                type="color"
                                value={cat.color || '#6366f1'}
                                onChange={(e) => {
                                  const c = e.target.value;
                                  onUpdateLegendCategory(cat.id, {
                                    color: c,
                                    gradient: `linear-gradient(135deg, ${c}ee 0%, ${c}bb 100%)`,
                                  });
                                }}
                                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
                              />
                              <span>Custom</span>
                            </label>
                          </div>
                        </div>

                        {/* Striped Pattern & Border Toggle + Border Color Picker */}
                        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={Boolean(cat.isStriped)}
                              onChange={(e) =>
                                onUpdateLegendCategory(cat.id, {
                                  isStriped: e.target.checked,
                                })
                              }
                              data-testid={`legend-striped-${cat.id}`}
                              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Striped Pattern</span>
                          </label>

                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={Boolean(cat.hasBorder)}
                              onChange={(e) =>
                                onUpdateLegendCategory(cat.id, {
                                  hasBorder: e.target.checked,
                                })
                              }
                              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Add Border</span>
                          </label>

                          {cat.hasBorder && (
                            <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300">
                              <span>Border Color</span>
                              <input
                                type="color"
                                value={cat.borderColor || '#ffffff'}
                                onChange={(e) =>
                                  onUpdateLegendCategory(cat.id, {
                                    borderColor: e.target.value,
                                  })
                                }
                                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add New Legend Category Form */}
            <form
              onSubmit={handleCreateCategory}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newLegendColor}
                  onChange={(e) => {
                    setNewLegendColor(e.target.value);
                    setNewLegendGradient('');
                  }}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shrink-0"
                  title="Pick category color"
                />
                <input
                  type="text"
                  value={newLegendLabel}
                  onChange={(e) => setNewLegendLabel(e.target.value)}
                  placeholder="New category label..."
                  data-testid="new-legend-input"
                  className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  data-testid="add-legend-btn"
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Theme Quick Swatches & Border Option for New Category */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>Swatches:</span>
                <div className="flex items-center gap-1.5">
                  {themeSwatches.map((swatch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewLegendColor(swatch);
                        setNewLegendGradient('');
                      }}
                      className={`w-4 h-4 rounded-full border transition-transform ${
                        newLegendColor === swatch
                          ? 'scale-125 border-indigo-500 dark:border-white'
                          : 'border-slate-300 dark:border-white/20 hover:scale-110'
                      }`}
                      style={{ backgroundColor: swatch }}
                      title={`Use theme color ${swatch}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 pt-1 border-t border-slate-200/70 dark:border-slate-800/70 text-[11px]">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newLegendIsStriped}
                    onChange={(e) => setNewLegendIsStriped(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Striped</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newLegendHasBorder}
                    onChange={(e) => setNewLegendHasBorder(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Border</span>
                </label>

                {newLegendHasBorder && (
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                    <span>Color:</span>
                    <input
                      type="color"
                      value={newLegendBorderColor}
                      onChange={(e) => setNewLegendBorderColor(e.target.value)}
                      className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
                    />
                  </label>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Panel 2: Manage Hierarchy Rows (Sections, Sub-sections, Tasks) */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/70">
          <button
            type="button"
            onClick={() => setHierarchyExpanded(!hierarchyExpanded)}
            className="flex items-center gap-2 text-left"
          >
            <Layers className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Roadmap Rows ({sections.length})
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            {sections.length > 0 && (
              <button
                type="button"
                onClick={handleToggleCollapseAll}
                data-testid="collapse-all-btn"
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                title={areAllCollapsed ? 'Expand all sections' : 'Collapse all sections'}
              >
                {areAllCollapsed ? (
                  <>
                    <ChevronsUpDown className="w-3 h-3" />
                    <span>Expand</span>
                  </>
                ) : (
                  <>
                    <ChevronsDownUp className="w-3 h-3" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onAddSection}
              data-testid="add-section-btn"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Section</span>
            </button>
          </div>
        </div>

        {hierarchyExpanded && (
          <div className="p-3 space-y-3 flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((sec) => (
                  <SortableSectionItem
                    key={sec.id}
                    section={sec}
                    tasks={tasks}
                    isCollapsed={collapsedSections.has(sec.id)}
                    onToggleCollapse={() => toggleSectionCollapse(sec.id)}
                    collapsedSubSections={collapsedSubSections}
                    onToggleSubSectionCollapse={toggleSubSectionCollapse}
                    onUpdateSectionTitle={onUpdateSectionTitle}
                    onDeleteSection={onDeleteSection}
                    onAddSubSection={onAddSubSection}
                    onUpdateSubSectionTitle={onUpdateSubSectionTitle}
                    onDeleteSubSection={onDeleteSubSection}
                    onReorderSubSections={onReorderSubSections}
                    onAddTask={onAddTask}
                    onUpdateTaskTitle={onUpdateTaskTitle}
                    onDeleteTask={onDeleteTask}
                    onReorderTasks={onReorderTasks}
                    theme={theme}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {sections.length === 0 && (
              <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <p>No sections defined yet.</p>
                <button
                  type="button"
                  onClick={onAddSection}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"
                >
                  + Create First Section
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
