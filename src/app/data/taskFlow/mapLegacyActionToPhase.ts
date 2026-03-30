import type { Action, Execution } from '../mockData';
import { buildOperatorTask } from './buildOperatorTask';
import type { OperatorTask, TaskFlowDemoOverride, TaskStatus } from './taskTypes';

/**
 * Demo 层覆盖（不写回 mock）：phaseOverride / takeover / retryCount
 *
 * Legacy → OperatorTaskPhase（V1，可后续接 API）：
 * - pending → pending_decision
 * - approved（且无 running 中的 execution）→ approved
 * - running（action 或 execution）→ executing
 * - failed（且无 takeover 覆盖）→ failed
 * - failed + takeover 覆盖 → needs_takeover
 * - rejected → archived
 * - completed → completed
 * - blocked：暂无数据字段时仅通过 phaseOverride === blocked 表达
 * draft / waiting_input / diagnosing：由 pre-stage seed / override 表达，继续沿用统一任务模型
 */
export type OperatorTaskFlowView = {
  phase: TaskStatus;
  /** 卡片「为何卡在这里」：默认用 presentation.sublineZh */
  whyStuck?: string;
  nextHint: string;
  flags: { canRetry: boolean; canTakeover: boolean };
  retryCount: number;
  ownerLabel: string;
  updatedAt: string;
  task: OperatorTask;
};

export function mapLegacyActionToPhase(
  action: Action,
  execution: Execution | null | undefined,
  demo?: TaskFlowDemoOverride | null,
): OperatorTaskFlowView {
  const task = buildOperatorTask(action, execution, demo);

  return {
    phase: task.status,
    whyStuck: task.blockReason,
    nextHint: task.nextStepHint,
    flags: { canRetry: task.canRetry, canTakeover: task.canTakeover },
    retryCount: task.retryCount,
    ownerLabel: task.ownerLabel,
    updatedAt: task.updatedAt,
    task,
  };
}
