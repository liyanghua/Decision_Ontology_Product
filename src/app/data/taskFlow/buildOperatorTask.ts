import type { Action, Execution, ExecutionLog } from '../mockData';
import { buildJourneyLinks } from '../operatorJourney';
import { TASK_STATUS_CONFIG, formatNextHint } from './taskStatusConfig';
import type {
  ApprovalDecision,
  OperatorTask,
  RecoveryAction,
  TakeoverAction,
  TaskAction,
  TaskFlowDemoOverride,
  TaskRouteHint,
  TaskStatus,
  TaskTimelineItem,
  TaskTimelineTone,
} from './taskTypes';

function computeBaseStatus(action: Action, execution: Execution | null | undefined): TaskStatus {
  if (action.status === 'rejected') return 'archived';
  if (action.status === 'completed' || execution?.status === 'completed') return 'completed';
  if (action.status === 'failed' || execution?.status === 'failed') return 'failed';
  if (action.status === 'running' || execution?.status === 'running') return 'executing';
  if (action.status === 'pending') return 'pending_decision';
  if (action.status === 'approved') return 'approved';
  return 'archived';
}

function lastNonEmpty(values: Array<string | undefined | null>): string {
  return values.find((value) => value != null && String(value).trim() !== '')?.trim() ?? '—';
}

function latestTimestamp(values: Array<string | undefined | null>): string {
  const sorted = values
    .filter((value): value is string => value != null && value.trim() !== '')
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return sorted[0] ?? '—';
}

function latestByPrimaryAt<T extends { at: string }>(items: T[]): T | undefined {
  return [...items].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))[0];
}

function latestRecoveryAction(items: RecoveryAction[]): RecoveryAction | undefined {
  return [...items].sort((a, b) => {
    const aAt = a.resolvedAt || a.at;
    const bAt = b.resolvedAt || b.at;
    return aAt < bAt ? 1 : aAt > bAt ? -1 : 0;
  })[0];
}

function latestResolvedTakeover(items: TakeoverAction[]): TakeoverAction | undefined {
  return [...items]
    .filter((item) => item.resolution != null)
    .sort((a, b) => {
      const aAt = a.resolvedAt || a.at;
      const bAt = b.resolvedAt || b.at;
      return aAt < bAt ? 1 : aAt > bAt ? -1 : 0;
    })[0];
}

function activeTakeoverAction(
  action: Action,
  demo: TaskFlowDemoOverride | null | undefined,
): TakeoverAction | undefined {
  const fromStructured = [...(demo?.takeoverActions ?? [])]
    .filter((item) => item.resolution == null)
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))[0];
  if (fromStructured) return fromStructured;
  if (demo?.takeover) {
    return {
      id: `${action.id}-legacy-takeover`,
      actionId: action.id,
      actorLabel: demo.ownerLabelOverride?.trim() || '人工接手人',
      reason: demo.blockReasonOverride,
      at: demo.updatedAtOverride || action.completedAt || action.executedAt || action.createdAt,
      resolution: null,
    };
  }
  return undefined;
}

function resolveStatus(
  baseStatus: TaskStatus,
  action: Action,
  demo?: TaskFlowDemoOverride | null,
): TaskStatus {
  const activeTakeover = activeTakeoverAction(action, demo);
  const takeoverResolution = latestResolvedTakeover(demo?.takeoverActions ?? []);
  const recovery = latestRecoveryAction(demo?.recoveryActions ?? []);
  const approval = latestByPrimaryAt(demo?.approvalDecisions ?? []);

  if (takeoverResolution?.resolution) return takeoverResolution.resolution;
  if (activeTakeover) return 'needs_takeover';

  if (recovery) {
    if (recovery.result === 'running') return 'executing';
    if (recovery.result === 'succeeded') return 'completed';
    if (recovery.result === 'failed') return 'failed';
  }

  if (demo?.phaseOverride != null) return demo.phaseOverride;

  if (approval?.decision === 'approved') return 'approved';
  if (approval?.decision === 'rejected') return 'archived';

  return baseStatus;
}

function defaultOwnerLabel(
  status: TaskStatus,
  action: Action,
  activeTakeover?: TakeoverAction,
): string {
  if (activeTakeover?.actorLabel?.trim()) return activeTakeover.actorLabel.trim();
  if (action.approver?.trim() && status === 'pending_decision') return action.approver.trim();
  if (status === 'pending_decision') return '经营负责人';
  if (status === 'approved' || status === 'executing' || status === 'blocked' || status === 'failed') {
    return '执行同学';
  }
  if (status === 'needs_takeover') return '人工接手人';
  return '经营搭档';
}

function logTone(level: ExecutionLog['level']): TaskTimelineTone {
  if (level === 'error') return 'danger';
  if (level === 'warning') return 'warning';
  return 'neutral';
}

function logTitle(level: ExecutionLog['level']): string {
  if (level === 'error') return '异常回传';
  if (level === 'warning') return '风险提醒';
  return '推进记录';
}

function baseTimeline(action: Action, execution: Execution | null | undefined): TaskTimelineItem[] {
  const items: TaskTimelineItem[] = [];

  if (action.createdAt?.trim()) {
    items.push({
      id: `${action.id}-created`,
      at: action.createdAt,
      title: '任务进入队列',
      detail: action.reason || action.name,
      tone: 'neutral',
      kind: 'queued',
      source: 'action',
    });
  }

  if (action.approvedAt?.trim()) {
    items.push({
      id: `${action.id}-approved`,
      at: action.approvedAt,
      title: '经营已拍板',
      detail: action.approver?.trim() || '已放行，等待排入执行窗口',
      tone: 'good',
      kind: 'approval',
      actorLabel: action.approver?.trim() || undefined,
      outcomeLabel: '已批准',
      source: 'action',
    });
  }

  const executionStart = action.executedAt?.trim() || execution?.startTime?.trim();
  if (executionStart) {
    items.push({
      id: `${action.id}-executed`,
      at: executionStart,
      title: '开始推进',
      detail: execution?.expectedOutcome || action.expectedImpact,
      tone: 'good',
      kind: 'execution_started',
      source: 'execution',
    });
  }

  for (const log of execution?.logs ?? []) {
    items.push({
      id: log.id,
      at: log.timestamp,
      title: logTitle(log.level),
      detail: log.message,
      tone: logTone(log.level),
      kind: 'log',
      source: 'log',
    });
  }

  const finishedAt = action.completedAt?.trim() || execution?.endTime?.trim();
  if (finishedAt) {
    const isFailed = action.status === 'failed' || execution?.status === 'failed';
    items.push({
      id: `${action.id}-finished`,
      at: finishedAt,
      title: isFailed ? '结果未达预期' : '处理完成',
      detail: action.actualImpact || execution?.actualOutcome || action.expectedImpact,
      tone: isFailed ? 'danger' : 'good',
      kind: isFailed ? 'failed' : 'completed',
      outcomeLabel: isFailed ? '推进未跑通' : '已闭环',
      source: 'execution',
    });
  }

  return items;
}

function approvalTimelineItems(items: ApprovalDecision[]): TaskTimelineItem[] {
  return items.map((decision) => {
    if (decision.decision === 'approved') {
      return {
        id: decision.id,
        at: decision.at,
        title: '经营已拍板',
        detail: decision.note || '同意继续推进',
        tone: 'good',
        kind: 'approval',
        actorLabel: decision.actorLabel,
        outcomeLabel: '已批准',
        source: 'system',
      };
    }
    if (decision.decision === 'rejected') {
      return {
        id: decision.id,
        at: decision.at,
        title: '本轮不继续推进',
        detail: decision.note || '当前打法暂不放行',
        tone: 'danger',
        kind: 'approval',
        actorLabel: decision.actorLabel,
        outcomeLabel: '已驳回',
        source: 'system',
      };
    }
    return {
      id: decision.id,
      at: decision.at,
      title: '暂缓处理',
      detail: decision.note || '等待更合适的推进窗口',
      tone: 'warning',
      kind: 'defer',
      actorLabel: decision.actorLabel,
      outcomeLabel: '已暂缓',
      source: 'system',
    };
  });
}

function recoveryTimelineItems(items: RecoveryAction[]): TaskTimelineItem[] {
  const timeline: TaskTimelineItem[] = [];

  for (const recovery of items) {
    timeline.push({
      id: `${recovery.id}-start`,
      at: recovery.at,
      title: '发起重新执行',
      detail: recovery.reason || '按最新判断重新拉起这轮推进',
      tone: 'warning',
      kind: 'retry',
      actorLabel: recovery.actorLabel,
      outcomeLabel: '恢复中',
      source: 'system',
    });

    if (recovery.resolvedAt) {
      timeline.push({
        id: `${recovery.id}-result`,
        at: recovery.resolvedAt,
        title:
          recovery.result === 'succeeded'
            ? '恢复成功'
            : recovery.result === 'failed'
              ? '恢复未成功'
              : '恢复继续推进中',
        detail:
          recovery.result === 'succeeded'
            ? recovery.reason || '这轮已恢复并重新跑通'
            : recovery.reason || '重新执行后仍需继续观察',
        tone:
          recovery.result === 'succeeded'
            ? 'good'
            : recovery.result === 'failed'
              ? 'danger'
              : 'warning',
        kind: 'recovery_result',
        actorLabel: recovery.actorLabel,
        outcomeLabel:
          recovery.result === 'succeeded'
            ? '已恢复成功'
            : recovery.result === 'failed'
              ? '恢复未成功'
              : '恢复中',
        source: 'system',
      });
    }
  }

  return timeline;
}

function takeoverTimelineItems(items: TakeoverAction[]): TaskTimelineItem[] {
  const timeline: TaskTimelineItem[] = [];

  for (const takeover of items) {
    timeline.push({
      id: `${takeover.id}-start`,
      at: takeover.at,
      title: '转人工处理',
      detail: takeover.reason || '自动推进先停在这里，改由人工接手',
      tone: 'warning',
      kind: 'takeover',
      actorLabel: takeover.actorLabel,
      outcomeLabel: '已接手',
      source: 'system',
    });

    if (takeover.resolution && takeover.resolvedAt) {
      timeline.push({
        id: `${takeover.id}-resolution`,
        at: takeover.resolvedAt,
        title:
          takeover.resolution === 'executing'
            ? '人工处理后继续推进'
            : takeover.resolution === 'completed'
              ? '人工处理完成'
              : '本轮收档',
        detail: takeover.resolutionNote || takeover.reason || '已按人工判断处理当前任务',
        tone: takeover.resolution === 'archived' ? 'neutral' : 'good',
        kind: 'takeover_resolution',
        actorLabel: takeover.actorLabel,
        outcomeLabel:
          takeover.resolution === 'executing'
            ? '回到推进中'
            : takeover.resolution === 'completed'
              ? '已闭环'
              : '已收档',
        source: 'system',
      });
    }
  }

  return timeline;
}

function buildTimeline(
  action: Action,
  execution: Execution | null | undefined,
  demo: TaskFlowDemoOverride | null | undefined,
): TaskTimelineItem[] {
  return [
    ...baseTimeline(action, execution),
    ...approvalTimelineItems(demo?.approvalDecisions ?? []),
    ...recoveryTimelineItems(demo?.recoveryActions ?? []),
    ...takeoverTimelineItems(demo?.takeoverActions ?? []),
    ...(demo?.timelineEntries ?? []),
  ].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}

function deriveLatestRecoveryStateLabel(recovery?: RecoveryAction): string | undefined {
  if (!recovery) return undefined;
  if (recovery.result === 'running') return '恢复中';
  if (recovery.result === 'succeeded') return '已恢复成功';
  return '恢复未成功';
}

function deriveNextStepHint(
  status: TaskStatus,
  action: Action,
  demo: TaskFlowDemoOverride | null | undefined,
  activeTakeover: TakeoverAction | undefined,
  latestApproval: ApprovalDecision | undefined,
  latestRecovery: RecoveryAction | undefined,
): string {
  if (demo?.nextStepHintOverride?.trim()) return demo.nextStepHintOverride.trim();
  if (activeTakeover) {
    return `已转人工处理，请由 ${activeTakeover.actorLabel} 判断是继续推进、处理完成还是本轮收档。`;
  }
  if (latestRecovery?.result === 'running') {
    return `「${action.productName || '该商品'}」正在重新执行，盯住结果窗口并确认是否恢复成功。`;
  }
  if (latestRecovery?.result === 'succeeded') {
    return `这轮恢复已经跑通，建议核对结果并决定是否收档沉淀。`;
  }
  if (latestRecovery?.result === 'failed') {
    return `重新执行仍未跑通，请判断是否转人工处理，别继续空耗窗口。`;
  }
  if (latestApproval?.decision === 'deferred') {
    return latestApproval.note?.trim()
      ? `当前暂缓：${latestApproval.note.trim()}`
      : `当前已暂缓，等合适窗口再推进「${action.productName || '该商品'}」。`;
  }
  return formatNextHint(TASK_STATUS_CONFIG[status].nextHintTemplate, action.productName || '该商品');
}

function deriveBlockReason(
  status: TaskStatus,
  action: Action,
  execution: Execution | null | undefined,
  fallback: string,
  latestApproval: ApprovalDecision | undefined,
  latestRecovery: RecoveryAction | undefined,
  activeTakeover: TakeoverAction | undefined,
  latestResolvedTakeoverAction: TakeoverAction | undefined,
): string {
  const errorMessage = [...(execution?.logs ?? [])]
    .reverse()
    .find((log) => log.level === 'error' || log.level === 'warning')?.message;

  if (status === 'needs_takeover') {
    return lastNonEmpty([
      activeTakeover?.reason,
      latestRecovery?.reason,
      errorMessage,
      execution?.actualOutcome,
      action.actualImpact,
      action.reason,
      fallback,
    ]);
  }

  if (status === 'failed' || status === 'blocked') {
    return lastNonEmpty([
      latestRecovery?.result === 'failed' ? latestRecovery.reason : undefined,
      errorMessage,
      execution?.actualOutcome,
      action.actualImpact,
      action.reason,
      fallback,
    ]);
  }

  if (status === 'completed') {
    return lastNonEmpty([
      latestRecovery?.result === 'succeeded' ? latestRecovery.reason : undefined,
      latestResolvedTakeoverAction?.resolution === 'completed'
        ? latestResolvedTakeoverAction.resolutionNote
        : undefined,
      action.actualImpact,
      execution?.actualOutcome,
      fallback,
    ]);
  }

  if (status === 'archived') {
    return lastNonEmpty([
      latestApproval?.decision === 'rejected' ? latestApproval.note : undefined,
      latestResolvedTakeoverAction?.resolution === 'archived'
        ? latestResolvedTakeoverAction.resolutionNote
        : undefined,
      action.reason,
      fallback,
    ]);
  }

  return lastNonEmpty([action.reason, latestApproval?.note, fallback]);
}

function filterActions(actions: TaskAction[], canRetry: boolean, canTakeover: boolean): TaskAction[] {
  return actions.filter((action) => {
    if (action === 'retry' && !canRetry) return false;
    if (action === 'takeover' && !canTakeover) return false;
    return true;
  });
}

function derivePrimaryAction(
  status: TaskStatus,
  actions: TaskAction[],
): TaskAction | undefined {
  const preferred = TASK_STATUS_CONFIG[status].primaryAction;
  if (preferred && actions.includes(preferred)) return preferred;
  return actions[0];
}

function deriveSecondaryActions(
  status: TaskStatus,
  actions: TaskAction[],
  primaryAction?: TaskAction,
): TaskAction[] {
  const preferred = TASK_STATUS_CONFIG[status].secondaryActions.filter((action) => actions.includes(action));
  const withoutPrimary = preferred.filter((action) => action !== primaryAction);
  const fallback = actions.filter((action) => action !== primaryAction && !withoutPrimary.includes(action));
  return [...withoutPrimary, ...fallback].slice(0, 2);
}

function buildNextRouteHint(action: Action, status: TaskStatus): TaskRouteHint | undefined {
  const links = buildJourneyLinks({
    actionId: action.id,
    productId: action.productId || undefined,
  });

  if (status === 'draft' || status === 'waiting_input' || status === 'diagnosing' || status === 'archived') {
    return { label: '进入商品诊断', href: links.diagnosis };
  }
  if (status === 'pending_decision') {
    return { label: '去拍板', href: links.approvals };
  }
  if (status === 'approved') {
    return { label: '去推进', href: links.execution };
  }
  if (status === 'executing' || status === 'blocked' || status === 'failed' || status === 'needs_takeover') {
    return { label: '看推进结果', href: links.execution };
  }
  if (status === 'completed') {
    return { label: '看结果复盘', href: links.replay };
  }
  return undefined;
}

export function buildOperatorTask(
  action: Action,
  execution?: Execution | null,
  demo?: TaskFlowDemoOverride | null,
) : OperatorTask {
  const baseStatus = computeBaseStatus(action, execution);
  const status = resolveStatus(baseStatus, action, demo);
  const config = TASK_STATUS_CONFIG[status];
  const latestApproval = latestByPrimaryAt(demo?.approvalDecisions ?? []);
  const latestRecovery = latestRecoveryAction(demo?.recoveryActions ?? []);
  const activeTakeover = activeTakeoverAction(action, demo);
  const resolvedTakeover = latestResolvedTakeover(demo?.takeoverActions ?? []);
  const timeline = buildTimeline(action, execution, demo);
  const updatedAt =
    demo?.updatedAtOverride ||
    latestTimestamp([
      action.completedAt,
      execution?.endTime,
      action.executedAt,
      action.approvedAt,
      execution?.startTime,
      action.createdAt,
      latestApproval?.at,
      latestRecovery?.resolvedAt,
      latestRecovery?.at,
      activeTakeover?.at,
      resolvedTakeover?.resolvedAt,
      resolvedTakeover?.at,
      ...timeline.map((item) => item.at),
    ]);
  const canTakeover = config.allowTakeover || status === 'needs_takeover';
  const canRetry = config.allowRetry;
  const retryCount = Math.max(
    demo?.retryCount ?? 0,
    (demo?.recoveryActions ?? []).filter((item) => item.kind === 'retry').length,
  );
  const availableActions = filterActions(config.availableActions, canRetry, canTakeover);
  const primaryAction = derivePrimaryAction(status, availableActions);
  const secondaryActions = deriveSecondaryActions(status, availableActions, primaryAction);

  return {
    id: action.id,
    title: action.name,
    productId: action.productId || undefined,
    productName: action.productName || '该商品',
    status,
    statusLabel: config.labelZh,
    badgeTone: config.tone,
    availableActions,
    primaryAction,
    secondaryActions,
    nextStepHint: deriveNextStepHint(
      status,
      action,
      demo,
      activeTakeover,
      latestApproval,
      latestRecovery,
    ),
    nextRouteHint: buildNextRouteHint(action, status),
    blockReason:
      demo?.blockReasonOverride ||
      deriveBlockReason(
        status,
        action,
        execution,
        config.sublineZh,
        latestApproval,
        latestRecovery,
        activeTakeover,
        resolvedTakeover,
      ),
    ownerLabel: demo?.ownerLabelOverride || defaultOwnerLabel(status, action, activeTakeover),
    updatedAt,
    canTakeover,
    canRetry,
    retryCount,
    timeline,
    latestApprovalDecision: latestApproval,
    latestRecoveryStateLabel: deriveLatestRecoveryStateLabel(latestRecovery),
    activeTakeover,
    sourceRefs: {
      actionId: action.id,
      executionId: execution?.id,
      productId: action.productId || undefined,
    },
    legacy: {
      actionStatus: action.status,
      executionStatus: execution?.status ?? null,
    },
  };
}
