import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { OperatorJourneySession, OperatorJourneyStep } from '../data/operatorJourney';

type OperatorJourneyState = {
  activeActionId: string | null;
  sessions: Map<string, OperatorJourneySession>;
};

type OperatorJourneyContextValue = {
  activeActionId: string | null;
  getSession: (actionId?: string | null) => OperatorJourneySession | undefined;
  startJourney: (input: { actionId: string; productId?: string }) => void;
  visitStep: (input: { actionId: string; productId?: string; step: OperatorJourneyStep }) => void;
  recordDecision: (input: {
    actionId: string;
    productId?: string;
    outcome: 'approved' | 'deferred' | 'rejected';
  }) => void;
  completeReview: (input: { actionId: string; productId?: string }) => void;
  setActiveAction: (input: { actionId: string; productId?: string }) => void;
};

const OperatorJourneyContext = createContext<OperatorJourneyContextValue | null>(null);

function formatTimestamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function createSession(actionId: string, productId?: string, at = formatTimestamp()): OperatorJourneySession {
  return {
    actionId,
    productId,
    startedAt: at,
    lastTouchedAt: at,
    visitedSteps: {
      focus: at,
    },
  };
}

export function OperatorJourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OperatorJourneyState>(() => ({
    activeActionId: null,
    sessions: new Map(),
  }));

  const updateSession = useCallback(
    (
      actionId: string,
      productId: string | undefined,
      updater: (current: OperatorJourneySession, at: string) => OperatorJourneySession,
    ) => {
      const at = formatTimestamp();
      setState((prev) => {
        const sessions = new Map(prev.sessions);
        const current = sessions.get(actionId) ?? createSession(actionId, productId, at);
        const nextSession = updater(
          {
            ...current,
            productId: productId ?? current.productId,
          },
          at,
        );
        sessions.set(actionId, nextSession);
        return {
          activeActionId: actionId,
          sessions,
        };
      });
    },
    [],
  );

  const getSession = useCallback(
    (actionId?: string | null) => {
      if (!actionId) return undefined;
      return state.sessions.get(actionId);
    },
    [state.sessions],
  );

  const setActiveAction = useCallback(
    ({ actionId, productId }: { actionId: string; productId?: string }) => {
      updateSession(actionId, productId, (current, at) => ({
        ...current,
        productId: productId ?? current.productId,
        lastTouchedAt: at,
      }));
    },
    [updateSession],
  );

  const startJourney = useCallback(
    ({ actionId, productId }: { actionId: string; productId?: string }) => {
      updateSession(actionId, productId, (current, at) => ({
        ...current,
        productId: productId ?? current.productId,
        lastTouchedAt: at,
        visitedSteps: {
          ...current.visitedSteps,
          focus: current.visitedSteps.focus ?? at,
        },
      }));
    },
    [updateSession],
  );

  const visitStep = useCallback(
    ({
      actionId,
      productId,
      step,
    }: {
      actionId: string;
      productId?: string;
      step: OperatorJourneyStep;
    }) => {
      updateSession(actionId, productId, (current, at) => ({
        ...current,
        productId: productId ?? current.productId,
        lastTouchedAt: at,
        visitedSteps: {
          ...current.visitedSteps,
          focus: current.visitedSteps.focus ?? at,
          [step]: at,
        },
      }));
    },
    [updateSession],
  );

  const recordDecision = useCallback(
    ({
      actionId,
      productId,
      outcome,
    }: {
      actionId: string;
      productId?: string;
      outcome: 'approved' | 'deferred' | 'rejected';
    }) => {
      updateSession(actionId, productId, (current, at) => ({
        ...current,
        productId: productId ?? current.productId,
        lastTouchedAt: at,
        decisionOutcome: outcome,
        visitedSteps: {
          ...current.visitedSteps,
          focus: current.visitedSteps.focus ?? at,
          decision: at,
        },
      }));
    },
    [updateSession],
  );

  const completeReview = useCallback(
    ({ actionId, productId }: { actionId: string; productId?: string }) => {
      updateSession(actionId, productId, (current, at) => ({
        ...current,
        productId: productId ?? current.productId,
        lastTouchedAt: at,
        reviewCompletedAt: at,
        visitedSteps: {
          ...current.visitedSteps,
          focus: current.visitedSteps.focus ?? at,
          review: at,
        },
      }));
    },
    [updateSession],
  );

  const value = useMemo(
    () => ({
      activeActionId: state.activeActionId,
      getSession,
      startJourney,
      visitStep,
      recordDecision,
      completeReview,
      setActiveAction,
    }),
    [
      completeReview,
      getSession,
      setActiveAction,
      startJourney,
      state.activeActionId,
      visitStep,
      recordDecision,
    ],
  );

  return <OperatorJourneyContext.Provider value={value}>{children}</OperatorJourneyContext.Provider>;
}

export function useOperatorJourney(): OperatorJourneyContextValue {
  const ctx = useContext(OperatorJourneyContext);
  if (!ctx) {
    throw new Error('useOperatorJourney must be used within OperatorJourneyProvider');
  }
  return ctx;
}
