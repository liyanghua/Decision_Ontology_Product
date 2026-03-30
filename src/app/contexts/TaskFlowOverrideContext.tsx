import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ApprovalDecision,
  RecoveryAction,
  TakeoverAction,
  TaskActionSource,
  TaskFlowDemoOverride,
  TaskStatus,
  TaskTimelineItem,
} from '../data/taskFlow/taskTypes';

export type TaskFlowOverrideEntry = TaskFlowDemoOverride;

type TaskFlowOverrideState = Map<string, TaskFlowOverrideEntry>;

type TaskEventInput = {
  actionId: string;
  note?: string;
  source?: TaskActionSource;
  currentStatus?: TaskStatus;
};

type TaskFlowOverrideContextValue = {
  getOverride: (actionId: string) => TaskFlowOverrideEntry | undefined;
  setOverride: (actionId: string, patch: Partial<TaskFlowOverrideEntry>) => void;
  clearOverride: (actionId: string) => void;
  fillTaskInputs: (input: TaskEventInput) => void;
  finishTaskDiagnosis: (input: TaskEventInput) => void;
  approveTask: (input: TaskEventInput) => void;
  rejectTask: (input: TaskEventInput) => void;
  deferTask: (input: TaskEventInput) => void;
  startExecution: (input: TaskEventInput) => void;
  retryTask: (input: TaskEventInput) => void;
  startTakeover: (input: TaskEventInput) => void;
  resolveTakeoverToExecuting: (input: TaskEventInput) => void;
  resolveTakeoverToCompleted: (input: TaskEventInput) => void;
  resolveTakeoverToArchived: (input: TaskEventInput) => void;
  markTaskCompleted: (input: TaskEventInput) => void;
  archiveTask: (input: TaskEventInput) => void;
};

const CURRENT_OPERATOR_LABEL = '李明';

const TaskFlowOverrideContext = createContext<TaskFlowOverrideContextValue | null>(null);

function formatTimestamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function makeEventId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function appendTimelineEntry(
  prev: TaskFlowOverrideEntry,
  entry: TaskTimelineItem,
): TaskTimelineItem[] {
  return [...(prev.timelineEntries ?? []), entry];
}

function updateLatestRunningRecovery(
  prev: TaskFlowOverrideEntry,
  result: 'succeeded' | 'failed',
  at: string,
  note?: string,
): RecoveryAction[] | undefined {
  const items = [...(prev.recoveryActions ?? [])];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index].result === 'running') {
      items[index] = {
        ...items[index],
        result,
        resolvedAt: at,
        reason: note?.trim() || items[index].reason,
      };
      return items;
    }
  }
  return prev.recoveryActions;
}

function resolveLatestTakeover(
  prev: TaskFlowOverrideEntry,
  actionId: string,
  resolution: 'executing' | 'completed' | 'archived',
  at: string,
  note?: string,
): TakeoverAction[] {
  const items = [...(prev.takeoverActions ?? [])];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index].resolution == null) {
      items[index] = {
        ...items[index],
        resolution,
        resolvedAt: at,
        resolutionNote: note?.trim() || items[index].resolutionNote,
      };
      return items;
    }
  }
  items.push({
    id: makeEventId('TAKE'),
    actionId,
    actorLabel: CURRENT_OPERATOR_LABEL,
    reason: note?.trim(),
    at,
    resolution,
    resolvedAt: at,
    resolutionNote: note?.trim(),
  });
  return items;
}

export function TaskFlowOverrideProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<TaskFlowOverrideState>(() => new Map());

  const getOverride = useCallback(
    (actionId: string) => overrides.get(actionId),
    [overrides],
  );

  const updateEntry = useCallback(
    (
      actionId: string,
      updater: (prev: TaskFlowOverrideEntry) => TaskFlowOverrideEntry,
    ) => {
      setOverrides((prev) => {
        const next = new Map(prev);
        const current: TaskFlowOverrideEntry = next.get(actionId)
          ? { ...next.get(actionId)! }
          : {};
        next.set(actionId, updater(current));
        return next;
      });
    },
    [],
  );

  const setOverride = useCallback(
    (actionId: string, patch: Partial<TaskFlowOverrideEntry>) => {
      updateEntry(actionId, (prev) => {
        const merged: TaskFlowOverrideEntry = { ...prev, ...patch };
        if (patch.takeover === true) {
          delete merged.phaseOverride;
        }
        return merged;
      });
    },
    [updateEntry],
  );

  const clearOverride = useCallback((actionId: string) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.delete(actionId);
      return next;
    });
  }, []);

  const fillTaskInputs = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: 'diagnosing',
        updatedAtOverride: at,
        timelineEntries: appendTimelineEntry(prev, {
          id: makeEventId('TL'),
          at,
          title: '关键信息已补齐',
          detail: note?.trim() || '前置信息已补全，转入诊断收口。',
          tone: 'good',
          kind: 'system',
          actorLabel: CURRENT_OPERATOR_LABEL,
          outcomeLabel: '进入诊断梳理',
          source: 'system',
        }),
      }));
    },
    [updateEntry],
  );

  const finishTaskDiagnosis = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        timelineEntries: appendTimelineEntry(prev, {
          id: makeEventId('TL'),
          at,
          title: '诊断已收口',
          detail: note?.trim() || '问题、打法和验证口径已收齐，进入待经营拍板。',
          tone: 'good',
          kind: 'system',
          actorLabel: CURRENT_OPERATOR_LABEL,
          outcomeLabel: '待经营拍板',
          source: 'system',
        }),
      }));
    },
    [updateEntry],
  );

  const approveTask = useCallback(
    ({ actionId, note, source = 'approval_center' }: TaskEventInput) => {
      const at = formatTimestamp();
      const decision: ApprovalDecision = {
        id: makeEventId('APP'),
        actionId,
        decision: 'approved',
        actorLabel: CURRENT_OPERATOR_LABEL,
        note: note?.trim() || undefined,
        at,
        source,
        nextStatus: 'approved',
      };
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        approvalDecisions: [...(prev.approvalDecisions ?? []), decision],
      }));
    },
    [updateEntry],
  );

  const rejectTask = useCallback(
    ({ actionId, note, source = 'approval_center' }: TaskEventInput) => {
      const at = formatTimestamp();
      const decision: ApprovalDecision = {
        id: makeEventId('APP'),
        actionId,
        decision: 'rejected',
        actorLabel: CURRENT_OPERATOR_LABEL,
        note: note?.trim() || undefined,
        at,
        source,
        nextStatus: 'archived',
      };
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        approvalDecisions: [...(prev.approvalDecisions ?? []), decision],
      }));
    },
    [updateEntry],
  );

  const deferTask = useCallback(
    ({ actionId, note, source = 'task_detail', currentStatus = 'pending_decision' }: TaskEventInput) => {
      const at = formatTimestamp();
      const decision: ApprovalDecision = {
        id: makeEventId('APP'),
        actionId,
        decision: 'deferred',
        actorLabel: CURRENT_OPERATOR_LABEL,
        note: note?.trim() || undefined,
        at,
        source,
        nextStatus: currentStatus,
      };
      updateEntry(actionId, (prev) => ({
        ...prev,
        updatedAtOverride: at,
        approvalDecisions: [...(prev.approvalDecisions ?? []), decision],
        nextStepHintOverride: note?.trim() || prev.nextStepHintOverride,
      }));
    },
    [updateEntry],
  );

  const startExecution = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: 'executing',
        updatedAtOverride: at,
        timelineEntries: appendTimelineEntry(prev, {
          id: makeEventId('TL'),
          at,
          title: '开始推进',
          detail: note?.trim() || '已排入本轮执行窗口',
          tone: 'good',
          kind: 'execution_started',
          actorLabel: CURRENT_OPERATOR_LABEL,
          outcomeLabel: '推进中',
          source: 'system',
        }),
      }));
    },
    [updateEntry],
  );

  const retryTask = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      const recovery: RecoveryAction = {
        id: makeEventId('REC'),
        actionId,
        kind: 'retry',
        actorLabel: CURRENT_OPERATOR_LABEL,
        reason: note?.trim() || '复盘后重新执行',
        at,
        result: 'running',
      };
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        recoveryActions: [...(prev.recoveryActions ?? []), recovery],
      }));
    },
    [updateEntry],
  );

  const startTakeover = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      const takeover: TakeoverAction = {
        id: makeEventId('TAKE'),
        actionId,
        actorLabel: CURRENT_OPERATOR_LABEL,
        reason: note?.trim() || '自动推进未跑通，转人工处理',
        at,
        resolution: null,
      };
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        takeoverActions: [...(prev.takeoverActions ?? []), takeover],
      }));
    },
    [updateEntry],
  );

  const resolveTakeoverToExecuting = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        takeoverActions: resolveLatestTakeover(prev, actionId, 'executing', at, note),
      }));
    },
    [updateEntry],
  );

  const resolveTakeoverToCompleted = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        takeoverActions: resolveLatestTakeover(prev, actionId, 'completed', at, note),
      }));
    },
    [updateEntry],
  );

  const resolveTakeoverToArchived = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: undefined,
        updatedAtOverride: at,
        takeoverActions: resolveLatestTakeover(prev, actionId, 'archived', at, note),
      }));
    },
    [updateEntry],
  );

  const markTaskCompleted = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: 'completed',
        updatedAtOverride: at,
        recoveryActions: updateLatestRunningRecovery(prev, 'succeeded', at, note),
        timelineEntries: appendTimelineEntry(prev, {
          id: makeEventId('TL'),
          at,
          title: '处理完成',
          detail: note?.trim() || '本轮推进已完成闭环',
          tone: 'good',
          kind: 'completed',
          actorLabel: CURRENT_OPERATOR_LABEL,
          outcomeLabel: '已闭环',
          source: 'system',
        }),
      }));
    },
    [updateEntry],
  );

  const archiveTask = useCallback(
    ({ actionId, note }: TaskEventInput) => {
      const at = formatTimestamp();
      updateEntry(actionId, (prev) => ({
        ...prev,
        phaseOverride: 'archived',
        updatedAtOverride: at,
        timelineEntries: appendTimelineEntry(prev, {
          id: makeEventId('TL'),
          at,
          title: '本轮收档',
          detail: note?.trim() || '当前不再继续投入推进资源',
          tone: 'neutral',
          kind: 'archived',
          actorLabel: CURRENT_OPERATOR_LABEL,
          outcomeLabel: '已收档',
          source: 'system',
        }),
      }));
    },
    [updateEntry],
  );

  const value = useMemo(
    () => ({
      getOverride,
      setOverride,
      clearOverride,
      fillTaskInputs,
      finishTaskDiagnosis,
      approveTask,
      rejectTask,
      deferTask,
      startExecution,
      retryTask,
      startTakeover,
      resolveTakeoverToExecuting,
      resolveTakeoverToCompleted,
      resolveTakeoverToArchived,
      markTaskCompleted,
      archiveTask,
    }),
    [
      approveTask,
      archiveTask,
      clearOverride,
      deferTask,
      fillTaskInputs,
      finishTaskDiagnosis,
      getOverride,
      markTaskCompleted,
      rejectTask,
      resolveTakeoverToArchived,
      resolveTakeoverToCompleted,
      resolveTakeoverToExecuting,
      retryTask,
      setOverride,
      startExecution,
      startTakeover,
    ],
  );

  return (
    <TaskFlowOverrideContext.Provider value={value}>{children}</TaskFlowOverrideContext.Provider>
  );
}

export function useTaskFlowOverrides(): TaskFlowOverrideContextValue {
  const ctx = useContext(TaskFlowOverrideContext);
  if (!ctx) {
    throw new Error('useTaskFlowOverrides must be used within TaskFlowOverrideProvider');
  }
  return ctx;
}
