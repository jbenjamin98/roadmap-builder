// Live preview rendered inside the Configuration Modal.
// It renders the REAL timeline grid (read-only) at reduced zoom so every option
// - including every condensed mode - looks exactly like it will on the canvas.
import { useLayoutEffect, useRef, useState } from 'react';
import TimelineGrid from './TimelineGrid';
import { getDensity, normalizeDesign } from '../constants/designOptions';
import { calculatePeriods } from '../utils/dateUtils';
import { computeLeftWidth } from './styleHelpers';
import { isRotatedSectionStyle } from '../constants/designOptions';

const noop = () => {};

export default function ConfigPreview({ draftConfig }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(0.6);
  const [innerHeight, setInnerHeight] = useState(0);

  const design = normalizeDesign(draftConfig?.design);
  const density = getDensity(design);
  const primary = draftConfig?.theme?.primary || '#6366f1';
  const accent2 = draftConfig?.theme?.accents?.[1] || '#ec4899';

  const config = {
    ...draftConfig,
    design,
    totalPeriods: Math.min(3, Number(draftConfig?.totalPeriods) || 3),
  };
  const periodCount = calculatePeriods(config).length;
  const lastPeriod = Math.max(1, periodCount);
  // canvas natural width + the grid wrapper padding (24px each side) + border
  const sections = [
    {
      id: 'pv-sec-1',
      title: 'Platform Foundation',
      collapsed: false,
      subSections: [
        { id: 'pv-sub-1', title: 'Core Services' },
        { id: 'pv-sub-2', title: 'Release Readiness' },
      ],
    },
    {
      id: 'pv-sec-2',
      title: 'Customer Experience',
      collapsed: false,
      subSections: [{ id: 'pv-sub-3', title: 'Onboarding & Growth' }],
    },
  ];

  const tasks = [
    { id: 'pv-t1', subSectionId: 'pv-sub-1', title: 'API gateway migration' },
    { id: 'pv-t2', subSectionId: 'pv-sub-1', title: 'Identity and access rollout' },
    { id: 'pv-t3', subSectionId: 'pv-sub-2', title: 'Launch checklist' },
    { id: 'pv-t4', subSectionId: 'pv-sub-2', title: 'Security review' },
    { id: 'pv-t5', subSectionId: 'pv-sub-3', title: 'Guided setup experience' },
    { id: 'pv-t6', subSectionId: 'pv-sub-3', title: 'Self-service analytics' },
  ];

  const leftW = computeLeftWidth({
    density,
    sections,
    tasks,
    design,
    rotated: isRotatedSectionStyle(design.sectionStyle),
  });
  const contentWidth = leftW + density.colWidth * periodCount + 50;

  useLayoutEffect(() => {
    const update = () => {
      const available = wrapRef.current?.clientWidth || contentWidth;
      setScale(Math.min(1, available / contentWidth));
      setInnerHeight(innerRef.current?.offsetHeight || 0);
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [contentWidth]);
  const secondStart = Math.min(2, lastPeriod);

  const legend = [
    {
      id: 'pv-default',
      label: 'Default',
      color: primary,
      gradient: `linear-gradient(135deg, ${primary} 0%, ${primary}bb 100%)`,
      hasBorder: false,
      borderColor: '#ffffff',
      isStriped: false,
    },
    {
      id: 'pv-striped',
      label: 'Planned',
      color: accent2,
      gradient: `linear-gradient(135deg, ${accent2} 0%, ${accent2}bb 100%)`,
      hasBorder: false,
      borderColor: '#ffffff',
      isStriped: true,
    },
  ];

  const timelineItems = [
    {
      id: 'pv-i1',
      taskId: 'pv-t1',
      startPeriod: 1,
      duration: Math.min(2, lastPeriod),
      type: 'bar',
      legendId: 'pv-default',
      label: 'Gateway cutover and rollout',
      hasEndMilestone: true,
    },
    {
      id: 'pv-i2',
      taskId: 'pv-t2',
      startPeriod: secondStart,
      duration: Math.min(2, lastPeriod - secondStart + 1),
      type: 'bar',
      legendId: 'pv-striped',
      label: 'SSO planning',
      hasEndMilestone: false,
    },
    {
      id: 'pv-i3',
      taskId: 'pv-t3',
      startPeriod: 1,
      duration: 1,
      type: 'milestone',
      legendId: 'pv-default',
      label: 'Go-live gate',
      hasEndMilestone: false,
    },
    {
      id: 'pv-i4',
      taskId: 'pv-t4',
      startPeriod: 1,
      duration: lastPeriod,
      type: 'bar',
      legendId: 'pv-default',
      label: 'Penetration test and remediation',
      hasEndMilestone: false,
    },
    {
      id: 'pv-i5',
      taskId: 'pv-t5',
      startPeriod: secondStart,
      duration: 1,
      type: 'bar',
      legendId: 'pv-striped',
      label: 'Wizard build',
      hasEndMilestone: true,
    },
    {
      id: 'pv-i6',
      taskId: 'pv-t6',
      startPeriod: lastPeriod,
      duration: 1,
      type: 'milestone',
      legendId: 'pv-default',
      label: 'Beta launch',
      hasEndMilestone: false,
    },
  ];

  return (
    <div
      ref={wrapRef}
      data-testid="config-live-preview"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950"
      style={{ height: innerHeight ? innerHeight * scale : undefined }}
    >
      <div
        ref={innerRef}
        style={{
          width: `${contentWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <TimelineGrid
          config={config}
          legend={legend}
          sections={sections}
          tasks={tasks}
          timelineItems={timelineItems}
          isPreview
          onUpdateSectionTitle={noop}
          onUpdateSubSectionTitle={noop}
          onUpdateTaskTitle={noop}
          onAddTimelineItem={noop}
          onUpdateTimelineItem={noop}
          onDeleteTimelineItem={noop}
        />
      </div>
    </div>
  );
}
