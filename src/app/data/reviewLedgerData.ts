import type { OperatorTask } from './taskFlow';
import type {
  LearningCandidate,
  RecentCompletedTask,
  ReviewCard,
  ReviewDepositionPrefill,
  ReviewDepositionSource,
  ReviewStatus,
  ReviewSummary,
  ReviewTaskRefs,
} from './reviewLedgerTypes';

type CreateReviewArtifactsInput = {
  reviewId: string;
  candidateId: string;
  createdAtIso: string;
  prefill: ReviewDepositionPrefill;
  payload: {
    lesson: string;
    suggestForExperience: boolean;
  };
};

type BuildReviewSummaryInput = {
  reviewCards: ReviewCard[];
  learningCandidates: LearningCandidate[];
  recentCompletedTasks?: RecentCompletedTask[];
};

function latestIso(values: string[]): string {
  return [...values].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))[0] ?? '';
}

function sortByIsoDesc<T extends { createdAtIso?: string; enteredAtIso?: string; completedAt?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aKey = a.createdAtIso || a.enteredAtIso || a.completedAt || '';
    const bKey = b.createdAtIso || b.enteredAtIso || b.completedAt || '';
    return aKey < bKey ? 1 : aKey > bKey ? -1 : 0;
  });
}

function refsMatch(left: ReviewTaskRefs | undefined, right: ReviewTaskRefs | undefined): boolean {
  if (!left || !right) return false;
  if (left.actionId && right.actionId) return left.actionId === right.actionId;
  if (left.executionId && right.executionId) return left.executionId === right.executionId;
  if (left.productId && right.productId) return left.productId === right.productId;
  return false;
}

export const REVIEW_CARD_SEEDS: ReviewCard[] = [
  {
    id: 'rv_seed_diag_001',
    source: 'diagnosis_complete',
    objectLabel: '商品 · 春夏凉感四件套',
    originalProblem: '主图吸引力弱，CTR 连续低于品类基准。',
    actionSummary: '围绕主图卖点和场景图重新收口诊断结论，并明确优先动作。',
    actualResult: '后续主图优化方向更聚焦，团队推进口径统一。',
    lesson: '先把问题、证据和打法收在同一口径，再进入审批推进，后续执行更顺。',
    suggestForExperience: false,
    inCandidatePool: false,
    createdAtIso: '2026-03-27T18:20:00.000Z',
    taskRefs: {
      productId: 'P100891',
    },
  },
  {
    id: 'rv_seed_exec_001',
    source: 'execution_complete',
    objectLabel: '商品 · 纯棉抗菌枕头',
    originalProblem: '关键词竞争力弱，曝光量持续不足。',
    actionSummary: '调整关键词出价与长尾词结构，连续跟踪 48 小时变化。',
    actualResult: '曝光量提升 38%，达到本轮预期。',
    lesson: '关键词优化类动作适合先做小步快跑，保留对比窗口再决定是否放大。',
    suggestForExperience: true,
    inCandidatePool: true,
    createdAtIso: '2026-03-28T18:00:00.000Z',
    taskRefs: {
      actionId: 'A006',
      executionId: 'EX002',
      productId: 'P100893',
    },
  },
  {
    id: 'rv_seed_takeover_001',
    source: 'takeover_complete',
    objectLabel: '商品 · 冰丝夏季薄款被子',
    originalProblem: '大促物料与库存口径不一致，自动推进无法继续。',
    actionSummary: '人工核对库存与活动节奏后，重排执行窗口并补齐物料。',
    actualResult: '风险解除，后续同类问题可提前做库存校验。',
    lesson: '接手前先核对库存口径与活动节奏，能显著减少大促阶段的重复返工。',
    suggestForExperience: true,
    inCandidatePool: true,
    createdAtIso: '2026-03-29T16:45:00.000Z',
    taskRefs: {
      productId: 'P100892',
      taskId: 'takeover_seed_001',
    },
  },
];

export const REVIEW_LEARNING_CANDIDATE_SEEDS: LearningCandidate[] = REVIEW_CARD_SEEDS.filter(
  (card) => card.inCandidatePool,
).map((card) => ({
  id: `lc_${card.id}`,
  reviewId: card.id,
  source: card.source,
  objectLabel: card.objectLabel,
  lesson: card.lesson,
  enteredAtIso: card.createdAtIso,
  status: 'candidate',
  taskRefs: card.taskRefs,
}));

export function createReviewArtifacts({
  reviewId,
  candidateId,
  createdAtIso,
  prefill,
  payload,
}: CreateReviewArtifactsInput): {
  reviewCard: ReviewCard;
  learningCandidate: LearningCandidate | null;
} {
  const lesson =
    payload.lesson.trim() ||
    prefill.defaultLesson?.trim() ||
    '这轮处理的关键做法已记录，后续可结合类似场景继续复用。';
  const actualResult =
    prefill.actualResult?.trim() ||
    prefill.outcomeSummary?.trim() ||
    '本轮结果已记录，可在后续结果跟踪里继续补充。';
  const reviewCard: ReviewCard = {
    id: reviewId,
    source: prefill.source,
    objectLabel: prefill.objectLabel,
    originalProblem: prefill.originalProblem?.trim() || '本轮原始问题已在处理链路中留档。',
    actionSummary: prefill.actionSummary,
    actualResult,
    lesson,
    suggestForExperience: payload.suggestForExperience,
    inCandidatePool: payload.suggestForExperience,
    createdAtIso,
    taskRefs: prefill.taskRefs ?? {},
  };

  const learningCandidate: LearningCandidate | null = payload.suggestForExperience
    ? {
        id: candidateId,
        reviewId,
        source: prefill.source,
        objectLabel: prefill.objectLabel,
        lesson,
        enteredAtIso: createdAtIso,
        status: 'candidate',
        taskRefs: prefill.taskRefs ?? {},
      }
    : null;

  return {
    reviewCard,
    learningCandidate,
  };
}

export function getLatestReviewForTask(
  reviewCards: ReviewCard[],
  taskRefs: ReviewTaskRefs,
): ReviewCard | undefined {
  return sortByIsoDesc(reviewCards).find((card) => refsMatch(card.taskRefs, taskRefs));
}

export function getLatestLearningCandidateForTask(
  learningCandidates: LearningCandidate[],
  taskRefs: ReviewTaskRefs,
): LearningCandidate | undefined {
  return sortByIsoDesc(learningCandidates).find((item) => refsMatch(item.taskRefs, taskRefs));
}

export function getReviewStatusForTask({
  reviewCards,
  learningCandidates,
  taskRefs,
}: {
  reviewCards: ReviewCard[];
  learningCandidates: LearningCandidate[];
  taskRefs: ReviewTaskRefs;
}): ReviewStatus {
  if (getLatestLearningCandidateForTask(learningCandidates, taskRefs)) return 'candidate';
  if (getLatestReviewForTask(reviewCards, taskRefs)) return 'reviewed';
  return 'none';
}

export function buildReviewSummary({
  reviewCards,
  learningCandidates,
  recentCompletedTasks = [],
}: BuildReviewSummaryInput): ReviewSummary {
  const sortedReviews = sortByIsoDesc(reviewCards);
  const sortedCandidates = sortByIsoDesc(learningCandidates);
  const sortedCompletedTasks = sortByIsoDesc(recentCompletedTasks);
  const lastUpdatedIso = latestIso(
    [
      ...sortedReviews.map((item) => item.createdAtIso),
      ...sortedCandidates.map((item) => item.enteredAtIso),
      ...sortedCompletedTasks.map((item) => item.completedAt),
    ].filter(Boolean),
  );

  return {
    totalReviews: reviewCards.length,
    candidateCount: learningCandidates.length,
    lastUpdatedIso,
    recentReviews: sortedReviews.slice(0, 3),
    recentCompletedTasks: sortedCompletedTasks.slice(0, 4),
    recentLearningCandidates: sortedCandidates.slice(0, 3),
  };
}

function firstTimelineDetail(task: OperatorTask, kind: OperatorTask['timeline'][number]['kind']) {
  return [...task.timeline]
    .reverse()
    .find((item) => item.kind === kind)?.detail;
}

function latestTimelineDetail(task: OperatorTask, kinds: OperatorTask['timeline'][number]['kind'][]) {
  return task.timeline.find((item) => kinds.includes(item.kind))?.detail;
}

export function deriveReviewSourceFromTask(task: OperatorTask): ReviewDepositionSource {
  if (task.timeline.some((item) => item.kind === 'takeover_resolution')) {
    return 'takeover_complete';
  }
  return 'execution_complete';
}

export function buildReviewPrefillFromTask(
  task: OperatorTask,
  overrides: Partial<ReviewDepositionPrefill> = {},
): ReviewDepositionPrefill {
  return {
    source: overrides.source ?? deriveReviewSourceFromTask(task),
    objectLabel: overrides.objectLabel ?? `商品 · ${task.productName}`,
    originalProblem:
      overrides.originalProblem ??
      firstTimelineDetail(task, 'queued') ??
      task.title,
    actionSummary: overrides.actionSummary ?? task.title,
    actualResult:
      overrides.actualResult ??
      latestTimelineDetail(task, ['completed', 'takeover_resolution', 'recovery_result']) ??
      task.blockReason,
    outcomeSummary:
      overrides.outcomeSummary ??
      latestTimelineDetail(task, ['completed', 'takeover_resolution', 'recovery_result']) ??
      task.blockReason,
    defaultLesson: overrides.defaultLesson ?? latestTimelineDetail(task, ['recovery_result']) ?? undefined,
    defaultSuggest: overrides.defaultSuggest ?? true,
    taskRefs: overrides.taskRefs ?? {
      actionId: task.sourceRefs.actionId,
      executionId: task.sourceRefs.executionId,
      productId: task.sourceRefs.productId,
      taskId: task.id,
    },
  };
}
