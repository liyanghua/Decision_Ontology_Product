import type { ReviewStatus } from '../reviewLedgerTypes';
import type { OperatorTask } from '../taskFlow/taskTypes';
import { buildJourneyLinks } from './journeyRoutes';
import type {
  OperatorJourney,
  OperatorJourneyReviewStatus,
  OperatorJourneySession,
  OperatorJourneyState,
  OperatorJourneyStep,
  OperatorJourneyStepItem,
} from './journeyTypes';

const JOURNEY_STEP_LABELS: Record<OperatorJourneyStep, string> = {
  focus: '今日重点',
  diagnosis: '商品诊断',
  decision: '动作拍板',
  execution: '推进结果',
  replay: '结果复盘',
  review: '形成经验',
};

const JOURNEY_STEP_ORDER: OperatorJourneyStep[] = [
  'focus',
  'diagnosis',
  'decision',
  'execution',
  'replay',
  'review',
];

type BuildOperatorJourneyInput = {
  actionId: string;
  productId?: string;
  task: OperatorTask;
  reviewStatus?: ReviewStatus;
  session?: OperatorJourneySession;
};

function resolveReviewStatus(
  task: OperatorTask,
  reviewStatus?: ReviewStatus,
): OperatorJourneyReviewStatus {
  if (reviewStatus === 'candidate') return 'candidate';
  if (reviewStatus === 'reviewed') return 'reviewed';
  if (task.status === 'completed') return 'ready';
  return 'not_ready';
}

function resolveJourneyState(
  task: OperatorTask,
  session: OperatorJourneySession | undefined,
  reviewStatus: OperatorJourneyReviewStatus,
): OperatorJourneyState {
  if (reviewStatus === 'candidate' || reviewStatus === 'reviewed') return 'completed';
  if (session?.decisionOutcome === 'rejected') return 'ended';
  if (session?.decisionOutcome === 'deferred' && task.status === 'pending_decision') return 'paused';
  if (task.status === 'archived' && session?.decisionOutcome === 'rejected') return 'ended';
  return 'active';
}

function resolveCurrentStep(
  task: OperatorTask,
  session: OperatorJourneySession | undefined,
  reviewStatus: OperatorJourneyReviewStatus,
): OperatorJourneyStep {
  if (reviewStatus === 'candidate' || reviewStatus === 'reviewed') return 'review';
  if (session?.decisionOutcome === 'rejected') return 'decision';
  if (session?.visitedSteps.replay) return 'replay';
  if (task.status === 'completed') return 'replay';
  if (
    task.status === 'approved' ||
    task.status === 'executing' ||
    task.status === 'failed' ||
    task.status === 'blocked' ||
    task.status === 'needs_takeover'
  ) {
    return 'execution';
  }
  if (task.status === 'pending_decision' || session?.decisionOutcome === 'deferred') {
    return 'decision';
  }
  if (
    task.status === 'draft' ||
    task.status === 'waiting_input' ||
    task.status === 'diagnosing'
  ) {
    return 'diagnosis';
  }
  return 'focus';
}

function buildStepItems(currentStep: OperatorJourneyStep): OperatorJourneyStepItem[] {
  const currentIndex = JOURNEY_STEP_ORDER.indexOf(currentStep);
  return JOURNEY_STEP_ORDER.map((step, index) => ({
    key: step,
    label: JOURNEY_STEP_LABELS[step],
    state:
      index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming',
  }));
}

function resolveStatusLabel(
  journeyState: OperatorJourneyState,
  currentStep: OperatorJourneyStep,
  task: OperatorTask,
  reviewStatus: OperatorJourneyReviewStatus,
): { statusLabel: string; statusDetail: string } {
  if (journeyState === 'completed') {
    return {
      statusLabel: '这条主线已经跑完',
      statusDetail:
        reviewStatus === 'candidate'
          ? '经验已进入候选区，后续同类问题会优先参考这次处理。'
          : '经验已经留下，首页结果与沉淀区会持续回显这次处理。',
    };
  }
  if (journeyState === 'paused') {
    return {
      statusLabel: '这条主线先暂缓在动作拍板',
      statusDetail: '已记录暂缓意见，等更合适的窗口再继续往下走。',
    };
  }
  if (journeyState === 'ended') {
    return {
      statusLabel: '这条主线本轮结束',
      statusDetail: '当前打法已决定不再继续推进，可回到诊断重新判断下一轮动作。',
    };
  }
  return {
    statusLabel: `当前走到「${JOURNEY_STEP_LABELS[currentStep]}」`,
    statusDetail: task.nextStepHint,
  };
}

function resolveNextCta(
  currentStep: OperatorJourneyStep,
  journeyState: OperatorJourneyState,
  task: OperatorTask,
  links: ReturnType<typeof buildJourneyLinks>,
): Pick<OperatorJourney, 'nextHref' | 'nextLabel'> {
  if (journeyState === 'completed') {
    return {
      nextHref: '/',
      nextLabel: '回经营搭档',
    };
  }
  if (journeyState === 'ended') {
    return {
      nextHref: links.diagnosis,
      nextLabel: '回到商品诊断',
    };
  }
  if (journeyState === 'paused') {
    return {
      nextHref: links.approvals,
      nextLabel: '继续拍板',
    };
  }

  if (currentStep === 'focus') {
    return {
      nextHref: links.diagnosis,
      nextLabel: '进入商品诊断',
    };
  }

  if (currentStep === 'diagnosis') {
    if (task.status === 'pending_decision') {
      return {
        nextHref: links.approvals,
        nextLabel: '去拍板',
      };
    }
    if (
      task.status === 'approved' ||
      task.status === 'executing' ||
      task.status === 'failed' ||
      task.status === 'needs_takeover' ||
      task.status === 'blocked'
    ) {
      return {
        nextHref: links.execution,
        nextLabel: '看推进结果',
      };
    }
    if (task.status === 'completed') {
      return {
        nextHref: links.replay,
        nextLabel: '看结果复盘',
      };
    }
    return {
      nextHref: links.diagnosis,
      nextLabel: '继续做诊断',
    };
  }

  if (currentStep === 'decision') {
    if (
      task.status === 'approved' ||
      task.status === 'executing' ||
      task.status === 'failed' ||
      task.status === 'needs_takeover' ||
      task.status === 'blocked' ||
      task.status === 'completed'
    ) {
      return {
        nextHref: links.execution,
        nextLabel: '去推进',
      };
    }
    return {
      nextHref: links.approvals,
      nextLabel: '去拍板',
    };
  }

  if (currentStep === 'execution') {
    if (task.status === 'completed') {
      return {
        nextHref: links.replay,
        nextLabel: '看结果复盘',
      };
    }
    return {
      nextHref: links.execution,
      nextLabel: '看推进结果',
    };
  }

  if (currentStep === 'replay') {
    return {
      nextHref: links.replayReview,
      nextLabel: '形成经验',
    };
  }

  return {
    nextHref: '/',
    nextLabel: '回经营搭档',
  };
}

export function buildOperatorJourney({
  actionId,
  productId,
  task,
  reviewStatus,
  session,
}: BuildOperatorJourneyInput): OperatorJourney {
  const resolvedReviewStatus = resolveReviewStatus(task, reviewStatus);
  const journeyState = resolveJourneyState(task, session, resolvedReviewStatus);
  const currentStep = resolveCurrentStep(task, session, resolvedReviewStatus);
  const links = buildJourneyLinks({ actionId, productId });
  const { statusLabel, statusDetail } = resolveStatusLabel(
    journeyState,
    currentStep,
    task,
    resolvedReviewStatus,
  );

  return {
    actionId,
    productId,
    currentStep,
    currentStepLabel: JOURNEY_STEP_LABELS[currentStep],
    steps: buildStepItems(currentStep),
    ...resolveNextCta(currentStep, journeyState, task, links),
    isCompleted: journeyState === 'completed',
    reviewStatus: resolvedReviewStatus,
    journeyState,
    statusLabel,
    statusDetail,
  };
}
