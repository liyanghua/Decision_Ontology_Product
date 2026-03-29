import type { FlowSupportActionOverlay, FlowSupportBundle } from './types';

export function mergeFlowSupport(
  base: FlowSupportBundle,
  overlay?: FlowSupportActionOverlay | null,
): FlowSupportBundle {
  if (!overlay) return base;
  return {
    ...base,
    stageSummary: overlay.stageSummaryAppend
      ? `${base.stageSummary}\n\n${overlay.stageSummaryAppend}`
      : base.stageSummary,
    executionReminders: [
      ...base.executionReminders,
      ...(overlay.executionReminders ?? []),
    ],
    riskChecklist: [...base.riskChecklist, ...(overlay.riskChecklist ?? [])],
    citations: [...base.citations, ...(overlay.citations ?? [])],
  };
}
