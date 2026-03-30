import { describe, expect, it } from 'vitest';
import { buildOperatorTask } from './taskFlow';
import { getRecentCompletedTasks } from './operatorHome/operatorHomeData';
import {
  buildReviewPrefillFromTask,
  buildReviewSummary,
  createReviewArtifacts,
  getReviewStatusForTask,
  REVIEW_CARD_SEEDS,
  REVIEW_LEARNING_CANDIDATE_SEEDS,
} from './reviewLedgerData';

describe('reviewLedgerData', () => {
  it('creates a review card with canonical fields and a learning candidate when suggested', () => {
    const createdAtIso = '2026-03-30T10:00:00.000Z';
    const result = createReviewArtifacts({
      reviewId: 'rv_test_001',
      candidateId: 'lc_test_001',
      createdAtIso,
      prefill: {
        source: 'takeover_complete',
        objectLabel: '商品 · 记忆棉颈椎护枕',
        originalProblem: '库存同步异常，促销配置无法推进',
        actionSummary: '人工核对库存映射后重新补配促销活动',
        actualResult: '活动恢复上线，转化开始回升',
        taskRefs: {
          actionId: 'A007',
          executionId: 'EX003',
          productId: 'P100894',
        },
      },
      payload: {
        lesson: '遇到库存同步类失败时，先核对映射关系再恢复执行。',
        suggestForExperience: true,
      },
    });

    expect(result.reviewCard.originalProblem).toContain('库存同步异常');
    expect(result.reviewCard.actualResult).toContain('活动恢复上线');
    expect(result.reviewCard.inCandidatePool).toBe(true);
    expect(result.reviewCard.taskRefs.actionId).toBe('A007');
    expect(result.learningCandidate?.status).toBe('candidate');
    expect(result.learningCandidate?.reviewId).toBe(result.reviewCard.id);
  });

  it('builds a summary with recent reviews, recent completed tasks and recent learning candidates', () => {
    const completedTasks = getRecentCompletedTasks();
    const summary = buildReviewSummary({
      reviewCards: REVIEW_CARD_SEEDS,
      learningCandidates: REVIEW_LEARNING_CANDIDATE_SEEDS,
      recentCompletedTasks: completedTasks,
    });

    expect(summary.totalReviews).toBeGreaterThan(0);
    expect(summary.candidateCount).toBeGreaterThan(0);
    expect(summary.recentReviews.length).toBeGreaterThan(0);
    expect(summary.recentCompletedTasks.length).toBeGreaterThan(0);
    expect(summary.recentLearningCandidates.length).toBeGreaterThan(0);
    expect(summary.lastUpdatedIso).toBeTruthy();
  });

  it('resolves review status for a completed task based on existing reviews and candidates', () => {
    expect(
      getReviewStatusForTask({
        reviewCards: REVIEW_CARD_SEEDS,
        learningCandidates: REVIEW_LEARNING_CANDIDATE_SEEDS,
        taskRefs: { actionId: 'A006', productId: 'P100893' },
      }),
    ).toBe('candidate');

    expect(
      getReviewStatusForTask({
        reviewCards: REVIEW_CARD_SEEDS,
        learningCandidates: REVIEW_LEARNING_CANDIDATE_SEEDS,
        taskRefs: { productId: 'P100891' },
      }),
    ).toBe('reviewed');

    expect(
      getReviewStatusForTask({
        reviewCards: REVIEW_CARD_SEEDS,
        learningCandidates: REVIEW_LEARNING_CANDIDATE_SEEDS,
        taskRefs: { actionId: 'A007', productId: 'P100894' },
      }),
    ).toBe('none');
  });

  it('marks completed takeover tasks as takeover_complete when building a review prefill', () => {
    const task = buildOperatorTask(
      {
        id: 'A-TAKE-001',
        name: '人工补配活动',
        type: '人工处理',
        productId: 'P100894',
        productName: '记忆棉颈椎护枕',
        strategyId: 'S-TAKE',
        status: 'failed',
        riskLevel: 'medium',
        reason: '库存同步失败',
        expectedImpact: '补齐活动后恢复转化',
        createdAt: '2026-03-28 10:00:00',
      },
      null,
      {
        takeoverActions: [
          {
            id: 'take-001',
            actionId: 'A-TAKE-001',
            actorLabel: '李明',
            reason: '人工核对库存映射',
            at: '2026-03-28 11:00:00',
            resolution: 'completed',
            resolvedAt: '2026-03-28 12:00:00',
            resolutionNote: '人工补配后任务闭环',
          },
        ],
      },
    );

    const prefill = buildReviewPrefillFromTask(task);
    expect(prefill.source).toBe('takeover_complete');
    expect(prefill.actualResult).toContain('人工补配后任务闭环');
  });
});
