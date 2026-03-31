import type { ActionStatus } from '../mockData';

export type TaskStatus =
  | 'draft'
  | 'waiting_input'
  | 'diagnosing'
  | 'pending_decision'
  | 'approved'
  | 'executing'
  | 'blocked'
  | 'failed'
  | 'needs_takeover'
  | 'completed'
  | 'archived';

export type OperatorTaskPhase = TaskStatus;

export type TaskAction =
  | 'fill_inputs'
  | 'finish_diagnosis'
  | 'submit_approval'
  | 'reject'
  | 'defer'
  | 'go_execute'
  | 'retry'
  | 'takeover'
  | 'mark_completed'
  | 'create_review'
  | 'view_diagnosis'
  | 'archive';

export type TaskBadgeTone =
  | 'slate'
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'orange'
  | 'red';

export type TaskTimelineTone = 'neutral' | 'good' | 'warning' | 'danger';

export type TaskTimelineKind =
  | 'queued'
  | 'approval'
  | 'defer'
  | 'execution_started'
  | 'log'
  | 'failed'
  | 'retry'
  | 'recovery_result'
  | 'takeover'
  | 'takeover_resolution'
  | 'completed'
  | 'archived'
  | 'system';

export type TaskActionSource =
  | 'home'
  | 'diagnosis'
  | 'approval_center'
  | 'execution'
  | 'task_detail'
  | 'system';

export type ApprovalDecision = {
  id: string;
  actionId: string;
  decision: 'approved' | 'rejected' | 'deferred';
  actorLabel: string;
  note?: string;
  at: string;
  source: TaskActionSource;
  nextStatus: TaskStatus;
};

export type RecoveryAction = {
  id: string;
  actionId: string;
  kind: 'retry';
  actorLabel: string;
  reason?: string;
  at: string;
  result: 'running' | 'succeeded' | 'failed';
  resolvedAt?: string;
};

export type TakeoverAction = {
  id: string;
  actionId: string;
  actorLabel: string;
  reason?: string;
  at: string;
  resolution: 'executing' | 'completed' | 'archived' | null;
  resolvedAt?: string;
  resolutionNote?: string;
};

export type TaskTimelineItem = {
  id: string;
  at: string;
  title: string;
  detail?: string;
  tone: TaskTimelineTone;
  kind: TaskTimelineKind;
  actorLabel?: string;
  outcomeLabel?: string;
  source: 'action' | 'execution' | 'log' | 'system';
};

export type TaskSourceRefs = {
  actionId?: string;
  executionId?: string;
  productId?: string;
};

export type TaskRouteHint = {
  label: string;
  href: string;
};

export type TaskFlowDemoOverride = {
  phaseOverride?: TaskStatus;
  takeover?: boolean;
  retryCount?: number;
  blockReasonOverride?: string;
  nextStepHintOverride?: string;
  ownerLabelOverride?: string;
  updatedAtOverride?: string;
  approvalDecisions?: ApprovalDecision[];
  recoveryActions?: RecoveryAction[];
  takeoverActions?: TakeoverAction[];
  timelineEntries?: TaskTimelineItem[];
};

export type OperatorTask = {
  id: string;
  title: string;
  productId?: string;
  productName: string;
  status: TaskStatus;
  statusLabel: string;
  badgeTone: TaskBadgeTone;
  availableActions: TaskAction[];
  primaryAction?: TaskAction;
  secondaryActions: TaskAction[];
  nextStepHint: string;
  nextRouteHint?: TaskRouteHint;
  blockReason: string;
  ownerLabel: string;
  updatedAt: string;
  canTakeover: boolean;
  canRetry: boolean;
  retryCount: number;
  timeline: TaskTimelineItem[];
  latestApprovalDecision?: ApprovalDecision;
  latestRecoveryStateLabel?: string;
  activeTakeover?: TakeoverAction;
  sourceRefs: TaskSourceRefs;
  legacy: {
    actionStatus?: ActionStatus;
    executionStatus?: ActionStatus | null;
  };
};
