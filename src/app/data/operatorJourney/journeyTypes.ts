import type { ReviewStatus } from '../reviewLedgerTypes';

export type OperatorJourneyStep =
  | 'focus'
  | 'diagnosis'
  | 'decision'
  | 'execution'
  | 'replay'
  | 'review';

export type OperatorJourneyState = 'active' | 'paused' | 'ended' | 'completed';

export type OperatorJourneyReviewStatus = 'not_ready' | 'ready' | ReviewStatus;

export type OperatorJourneyStepState = 'completed' | 'current' | 'upcoming';

export type OperatorJourneyStepItem = {
  key: OperatorJourneyStep;
  label: string;
  state: OperatorJourneyStepState;
};

export type OperatorJourneySession = {
  actionId: string;
  productId?: string;
  startedAt: string;
  lastTouchedAt: string;
  visitedSteps: Partial<Record<OperatorJourneyStep, string>>;
  decisionOutcome?: 'approved' | 'deferred' | 'rejected';
  reviewCompletedAt?: string;
};

export type OperatorJourney = {
  actionId: string;
  productId?: string;
  currentStep: OperatorJourneyStep;
  currentStepLabel: string;
  steps: OperatorJourneyStepItem[];
  nextHref?: string;
  nextLabel?: string;
  isCompleted: boolean;
  reviewStatus: OperatorJourneyReviewStatus;
  journeyState: OperatorJourneyState;
  statusLabel: string;
  statusDetail: string;
};
