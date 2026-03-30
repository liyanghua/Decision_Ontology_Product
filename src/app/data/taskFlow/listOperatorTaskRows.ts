import type { Action, Execution } from '../mockData';
import { actions as mockActions, executions } from '../mockData';
import { actions as catalogActions } from '../liveCatalog';
import { buildOperatorTask } from './buildOperatorTask';
import { TASK_PRESTAGE_SEEDS } from './taskPrestageSeeds';
import type { OperatorTask, TaskFlowDemoOverride } from './taskTypes';

export type OperatorTaskRow = {
  action: Action;
  execution: Execution | null;
  task: OperatorTask;
  sourceKind: 'catalog_action' | 'mock_action' | 'execution_only' | 'prestage_seed';
};

function mergeDemoOverride(
  base: TaskFlowDemoOverride | undefined,
  runtime: TaskFlowDemoOverride | undefined,
): TaskFlowDemoOverride | undefined {
  if (!base && !runtime) return undefined;
  if (!base) return runtime;
  if (!runtime) return base;
  return {
    ...base,
    ...runtime,
    approvalDecisions: [...(base.approvalDecisions ?? []), ...(runtime.approvalDecisions ?? [])],
    recoveryActions: [...(base.recoveryActions ?? []), ...(runtime.recoveryActions ?? [])],
    takeoverActions: [...(base.takeoverActions ?? []), ...(runtime.takeoverActions ?? [])],
    timelineEntries: [...(base.timelineEntries ?? []), ...(runtime.timelineEntries ?? [])],
  };
}

export function syntheticActionFromExecution(execution: Execution): Action {
  return {
    id: execution.actionId,
    name: execution.actionName,
    type: '执行实例',
    productId: '',
    productName: execution.productName,
    strategyId: '',
    status: execution.status,
    riskLevel: 'medium',
    reason: execution.actualOutcome || execution.expectedOutcome || '执行侧生成的任务',
    expectedImpact: execution.expectedOutcome,
    actualImpact: execution.actualOutcome,
    createdAt: execution.startTime,
    executedAt: execution.startTime,
    completedAt: execution.status === 'completed' ? execution.endTime : undefined,
  };
}

export function listOperatorTaskRows(
  getOverride?: (actionId: string) => TaskFlowDemoOverride | undefined,
): OperatorTaskRow[] {
  const rows: OperatorTaskRow[] = [];
  const seenActionIds = new Set<string>();

  const actionSources: Array<{
    items: Action[];
    sourceKind: OperatorTaskRow['sourceKind'];
  }> = [
    { items: catalogActions, sourceKind: 'catalog_action' },
    { items: mockActions, sourceKind: 'mock_action' },
  ];

  for (const source of actionSources) {
    for (const action of source.items) {
      if (seenActionIds.has(action.id)) continue;
      seenActionIds.add(action.id);
      const execution = executions.find((item) => item.actionId === action.id) ?? null;
      rows.push({
        action,
        execution,
        task: buildOperatorTask(action, execution, getOverride?.(action.id)),
        sourceKind: source.sourceKind,
      });
    }
  }

  for (const execution of executions) {
    if (seenActionIds.has(execution.actionId)) continue;
    const syntheticAction = syntheticActionFromExecution(execution);
    rows.push({
      action: syntheticAction,
      execution,
      task: buildOperatorTask(syntheticAction, execution, getOverride?.(syntheticAction.id)),
      sourceKind: 'execution_only',
    });
  }

  for (const seed of TASK_PRESTAGE_SEEDS) {
    if (seenActionIds.has(seed.action.id)) continue;
    seenActionIds.add(seed.action.id);
    rows.push({
      action: seed.action,
      execution: null,
      task: buildOperatorTask(
        seed.action,
        null,
        mergeDemoOverride(seed.demo, getOverride?.(seed.action.id)),
      ),
      sourceKind: 'prestage_seed',
    });
  }

  return rows.sort((a, b) =>
    a.task.updatedAt < b.task.updatedAt ? 1 : a.task.updatedAt > b.task.updatedAt ? -1 : 0,
  );
}
