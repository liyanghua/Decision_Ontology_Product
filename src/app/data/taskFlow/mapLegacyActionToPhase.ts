import type { Action, Execution } from '../mockData';
import type { OperatorTaskPhase } from './operatorTaskPhase';
import {
  OPERATOR_TASK_PRESENTATION,
  formatNextHint,
} from './operatorTaskStatePresentation';

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
 * draft / waiting_input / diagnosing：MVP 不归因；保留类型与文案供 phase2
 */
export type TaskFlowDemoOverride = {
  phaseOverride?: OperatorTaskPhase;
  takeover?: boolean;
  retryCount?: number;
};

export type OperatorTaskFlowView = {
  phase: OperatorTaskPhase;
  /** 卡片「为何卡在这里」：默认用 presentation.sublineZh */
  whyStuck?: string;
  nextHint: string;
  flags: { canRetry: boolean; canTakeover: boolean };
  retryCount: number;
};

function computeBasePhase(action: Action, execution: Execution | null | undefined): OperatorTaskPhase {
  if (action.status === 'rejected') return 'archived';
  if (action.status === 'completed') return 'completed';

  const exec = execution ?? null;
  const execFailed = exec?.status === 'failed';
  const execRunning = exec?.status === 'running';

  if (action.status === 'failed' || execFailed) return 'failed';
  if (action.status === 'running' || execRunning) return 'executing';
  if (action.status === 'pending') return 'pending_decision';
  if (action.status === 'approved') return 'approved';

  return 'archived';
}

export function mapLegacyActionToPhase(
  action: Action,
  execution: Execution | null | undefined,
  demo?: TaskFlowDemoOverride | null,
): OperatorTaskFlowView {
  const base = computeBasePhase(action, execution);
  let phase = base;

  if (demo?.takeover && base === 'failed') {
    phase = 'needs_takeover';
  }

  if (demo?.phaseOverride != null) {
    phase = demo.phaseOverride;
  }

  const pres = OPERATOR_TASK_PRESENTATION[phase];
  const productName = action.productName ?? '';
  const nextHint = formatNextHint(pres.nextHintTemplate, productName);

  const retryCount = demo?.retryCount ?? 0;
  const canRetry = phase === 'failed' || phase === 'needs_takeover';
  const canTakeover = phase === 'failed' || phase === 'blocked';

  return {
    phase,
    whyStuck: pres.sublineZh,
    nextHint,
    flags: { canRetry, canTakeover },
    retryCount,
  };
}
