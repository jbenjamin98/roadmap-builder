import TaskRow from '../TaskRow';
import { SPINE_WIDTH } from '../../constants/designOptions';
import { LevelLabel, NumBadge, SectionNumber, SectionSpine } from '../StyleParts';
import { INDENT, INDENT_SPINE, NO_WORD_BREAK, getSectionVisuals, nbHyphen } from '../styleHelpers';
import WrappingTitleInput from './WrappingTitleInput';

export default function TimelineSection({
  section,
  secIdx,
  sectionsCount,
  tasks,
  timelineItems,
  legend,
  design,
  tokens,
  density,
  periods,
  colWidth,
  leftW,
  rotated,
  sectionStyle,
  subSectionStyle,
  numbering,
  numStyle,
  legendPosition,
  alternateRowHighlighting,
  subtleGridDemarcations,
  periodLabel,
  primaryColor,
  accents,
  isPreview,
  activePopoverItemId,
  setActivePopoverItemId,
  onUpdateSectionTitle,
  onUpdateSubSectionTitle,
  onUpdateTaskTitle,
  onAddTimelineItem,
  onUpdateTimelineItem,
  onDeleteTimelineItem,
  getTaskRowIndex,
}) {
  const sectionAccent = accents[secIdx % accents.length] || primaryColor;
  const isLastSection = secIdx === sectionsCount - 1;
  const dividerColor = isLastSection
    ? 'transparent'
    : design.sectionDividerGlow
      ? sectionAccent
      : subtleGridDemarcations
        ? tokens.gridBorder
        : 'transparent';

  const periodTrack = () =>
    periods.map((period) => {
      const isAltCol = design.alternateColumnShading && period.index % 2 === 0;
      return (
        <div
          key={period.index}
          style={{
            width: `${colWidth}px`,
            borderColor: subtleGridDemarcations ? tokens.gridSubtle : 'transparent',
            backgroundColor: isAltCol ? tokens.colShadeBg : undefined,
          }}
          className="h-full border-r"
        />
      );
    });

  const renderSubSectionBlock = (sub, subIdx, labelWidth, stickyLeft) => {
    const subTasks = tasks.filter((t) => t.subSectionId === sub.id);

    return (
      <div key={sub.id}>
        <div
          className="flex items-stretch"
          style={{
            minHeight: `${density.subMin}px`,
            backgroundColor: tokens.subHeaderBg,
          }}
        >
          <div
            style={{
              width: `${labelWidth}px`,
              left: `${stickyLeft}px`,
              paddingLeft: (stickyLeft > 0 ? INDENT_SPINE : INDENT).sub,
              paddingRight: 14,
              backgroundColor: tokens.stickyAltBg,
              borderColor: subtleGridDemarcations ? tokens.gridBorder : 'transparent',
            }}
            className="shrink-0 py-1 flex items-center sticky z-[46] border-r"
          >
            <LevelLabel
              styleId={subSectionStyle}
              level="sub"
              accent={sectionAccent}
              badge={
                numbering.subSections ? (
                  <NumBadge
                    label={`${secIdx + 1}.${subIdx + 1}`}
                    accent={sectionAccent}
                    numStyle={numStyle}
                  />
                ) : null
              }
            >
              {isPreview ? (
                <span
                  data-export-text="true"
                  style={{ color: tokens.textSecondary, ...NO_WORD_BREAK }}
                  className="text-[11px] font-bold uppercase tracking-wider whitespace-normal leading-snug"
                >
                  {nbHyphen(sub.title)}
                </span>
              ) : (
                <WrappingTitleInput
                  value={sub.title}
                  onChange={(val) => onUpdateSubSectionTitle(section.id, sub.id, val)}
                  style={{ color: tokens.textSecondary }}
                  className="w-full bg-transparent text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500/40 px-1.5 py-0.5 rounded"
                />
              )}
            </LevelLabel>
          </div>

          <div className="flex items-stretch" style={{ width: `${periods.length * colWidth}px` }}>
            {periodTrack()}
          </div>
        </div>

        {subTasks.map((task, tIdx) => {
          const currentRowIdx = getTaskRowIndex();
          const rowItems = timelineItems.filter((item) => item.taskId === task.id);

          return (
            <TaskRow
              key={task.id}
              task={task}
              rowIndex={currentRowIdx}
              taskNumberLabel={numbering.tasks ? `${secIdx + 1}.${subIdx + 1}.${tIdx + 1}` : null}
              sectionAccent={sectionAccent}
              periods={periods}
              colWidth={colWidth}
              items={rowItems}
              legend={legend}
              design={design}
              tokens={tokens}
              leftWidth={labelWidth}
              stickyLeft={stickyLeft}
              isPreview={isPreview}
              alternateRowHighlighting={alternateRowHighlighting}
              subtleGridDemarcations={subtleGridDemarcations}
              periodLabel={periodLabel}
              activePopoverItemId={activePopoverItemId}
              setActivePopoverItemId={setActivePopoverItemId}
              onAddTimelineItem={onAddTimelineItem}
              onUpdateTimelineItem={onUpdateTimelineItem}
              onDeleteTimelineItem={onDeleteTimelineItem}
              onUpdateTaskTitle={onUpdateTaskTitle}
            />
          );
        })}
      </div>
    );
  };

  if (rotated) {
    const minHeight = Math.min(220, Math.max(84, 56 + String(section.title || '').length * 3.4));
    return (
      <div
        style={{ borderColor: dividerColor, minHeight }}
        className="border-b-2 relative flex items-stretch"
      >
        <SectionSpine
          styleId={sectionStyle}
          accent={sectionAccent}
          tokens={tokens}
          number={numbering.sections ? secIdx + 1 : null}
          title={section.title}
          roundBottomLeft={
            secIdx === sectionsCount - 1 && legendPosition !== 'bottom'
              ? 24 - (design.effects?.brutalist ? 3 : 1)
              : 0
          }
        />
        <div className="flex-1">
          {section.subSections.map((sub, subIdx) =>
            renderSubSectionBlock(sub, subIdx, leftW - SPINE_WIDTH, SPINE_WIDTH)
          )}
        </div>
      </div>
    );
  }

  const visuals = getSectionVisuals(sectionStyle, sectionAccent, tokens, subtleGridDemarcations);

  return (
    <div style={{ borderColor: dividerColor }} className="border-b-2">
      <div
        className="flex items-stretch"
        style={{
          minHeight: `${density.sectionMin}px`,
          background: visuals.bannerBg,
        }}
      >
        <div
          style={{
            width: `${leftW}px`,
            paddingLeft: INDENT.section,
            paddingRight: 14,
            ...visuals.leftCell,
          }}
          className="shrink-0 py-2 flex items-center sticky left-0 z-[46] border-r"
        >
          <div
            style={
              visuals.pill
                ? {
                    backgroundColor: `${sectionAccent}22`,
                    border: `1.5px solid ${sectionAccent}77`,
                  }
                : undefined
            }
            className={`flex items-center gap-2 min-w-0 flex-1 ${
              visuals.pill ? 'px-2.5 py-1 rounded-full' : ''
            }`}
          >
            <SectionNumber
              show={numbering.sections}
              label={`${secIdx + 1}`}
              accent={sectionAccent}
              visuals={visuals}
              numStyle={numStyle}
            />

            {isPreview ? (
              <span
                data-export-text="true"
                style={{ color: visuals.titleColor, ...NO_WORD_BREAK }}
                className="text-xs font-extrabold uppercase tracking-wider whitespace-normal leading-snug"
              >
                {nbHyphen(section.title)}
              </span>
            ) : (
              <WrappingTitleInput
                value={section.title}
                onChange={(val) => onUpdateSectionTitle(section.id, val)}
                style={{ color: visuals.titleColor }}
                className="w-full bg-transparent text-xs font-extrabold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500/40 px-1.5 py-0.5 rounded"
              />
            )}
          </div>
        </div>

        <div className="flex items-stretch" style={{ width: `${periods.length * colWidth}px` }}>
          {periodTrack()}
        </div>
      </div>

      {section.subSections.map((sub, subIdx) => renderSubSectionBlock(sub, subIdx, leftW, 0))}
    </div>
  );
}
