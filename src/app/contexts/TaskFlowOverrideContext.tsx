import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { OperatorTaskPhase } from '../data/taskFlow/operatorTaskPhase';
import type { TaskFlowDemoOverride } from '../data/taskFlow/mapLegacyActionToPhase';

export type TaskFlowOverrideEntry = TaskFlowDemoOverride;

type TaskFlowOverrideState = Map<string, TaskFlowOverrideEntry>;

type TaskFlowOverrideContextValue = {
  getOverride: (actionId: string) => TaskFlowOverrideEntry | undefined;
  setOverride: (actionId: string, patch: Partial<TaskFlowOverrideEntry>) => void;
  clearOverride: (actionId: string) => void;
};

const TaskFlowOverrideContext = createContext<TaskFlowOverrideContextValue | null>(null);

export function TaskFlowOverrideProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<TaskFlowOverrideState>(() => new Map());

  const getOverride = useCallback(
    (actionId: string) => overrides.get(actionId),
    [overrides],
  );

  const setOverride = useCallback((actionId: string, patch: Partial<TaskFlowOverrideEntry>) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      const cur: TaskFlowOverrideEntry = next.get(actionId) ? { ...next.get(actionId)! } : {};
      const merged: TaskFlowOverrideEntry = { ...cur, ...patch };
      if (patch.takeover === true) {
        delete merged.phaseOverride;
      }
      next.set(actionId, merged);
      return next;
    });
  }, []);

  const clearOverride = useCallback((actionId: string) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.delete(actionId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ getOverride, setOverride, clearOverride }),
    [getOverride, setOverride, clearOverride],
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

/** 重试：回到执行中相位并累加重试次数（Demo 不写回 catalog） */
export function createRetryPatch(
  prev: TaskFlowOverrideEntry | undefined,
): Partial<TaskFlowOverrideEntry> {
  const n = (prev?.retryCount ?? 0) + 1;
  return {
    phaseOverride: 'executing' satisfies OperatorTaskPhase,
    retryCount: n,
    takeover: false,
  };
}

export function createTakeoverPatch(): Partial<TaskFlowOverrideEntry> {
  return { takeover: true };
}

/** 解除 Demo 接管状态（例如从 needs_takeover 继续） */
export function createClearTakeoverPatch(): Partial<TaskFlowOverrideEntry> {
  return { takeover: false, phaseOverride: 'executing' satisfies OperatorTaskPhase };
}
