import type { DiagnosisPhaseId } from '../../data/sop/diagnosisFlowTypes';
import { getPhaseById } from '../../data/sop/diagnosisFlowSkeleton';
import { SopPhaseStepper } from '../sop/SopWorkflowPanel';
import { FlowSupportTrigger } from './FlowSupportTrigger';

/** 内联仅保留 stepper + 打开 Flow 抽屉，避免与抽屉内容重复堆叠。 */
export function SopFlowCompactBar({
  stageKey,
  onOpenFlow,
}: {
  stageKey: DiagnosisPhaseId;
  onOpenFlow: () => void;
}) {
  const name = getPhaseById(stageKey)?.name ?? stageKey;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-medium text-gray-500">淘天链接诊断 · 流程骨架</div>
          <div className="text-sm font-semibold text-gray-900">当前阶段：{name}</div>
        </div>
        <FlowSupportTrigger onClick={onOpenFlow} />
      </div>
      <SopPhaseStepper currentId={stageKey} />
    </div>
  );
}
