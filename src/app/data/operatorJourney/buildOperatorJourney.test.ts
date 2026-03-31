import { describe, expect, it } from 'vitest';
import type { Action } from '../mockData';
import { buildOperatorTask } from '../taskFlow';
import { buildOperatorJourney } from './buildOperatorJourney';
import type { OperatorJourneySession } from './journeyTypes';

function makeAction(overrides: Partial<Action> = {}): Action {
  return {
    id: 'A-JOURNEY-001',
    name: '主图优化任务',
    type: '内容优化',
    productId: 'P100891',
    productName: '春夏凉感四件套',
    strategyId: 'S001',
    status: 'pending',
    riskLevel: 'medium',
    reason: '主图点击表现偏弱',
    expectedImpact: 'CTR 提升 15%',
    createdAt: '2026-03-28 09:00:00',
    ...overrides,
  };
}

function makeSession(
  overrides: Partial<OperatorJourneySession> = {},
): OperatorJourneySession {
  return {
    actionId: 'A-JOURNEY-001',
    productId: 'P100891',
    startedAt: '2026-03-28 09:00:00',
    lastTouchedAt: '2026-03-28 09:00:00',
    visitedSteps: {
      focus: '2026-03-28 09:00:00',
    },
    ...overrides,
  };
}

describe('buildOperatorJourney', () => {
  it('maps pending decision tasks to the decision step with a go-decision CTA', () => {
    const task = buildOperatorTask(makeAction());
    const journey = buildOperatorJourney({
      actionId: task.sourceRefs.actionId!,
      productId: task.sourceRefs.productId,
      task,
    });

    expect(journey.currentStep).toBe('decision');
    expect(journey.steps).toHaveLength(6);
    expect(journey.nextLabel).toBe('去拍板');
    expect(journey.nextHref).toContain('actionId=A-JOURNEY-001');
  });

  it('keeps approved and exception states inside the execution station', () => {
    for (const status of ['approved', 'executing', 'failed', 'needs_takeover'] as const) {
      const task = buildOperatorTask(makeAction({ status: status === 'approved' ? 'approved' : 'running' }), null, {
        phaseOverride: status,
      });
      const journey = buildOperatorJourney({
        actionId: task.sourceRefs.actionId!,
        productId: task.sourceRefs.productId,
        task,
      });
      expect(journey.currentStep).toBe('execution');
    }
  });

  it('moves completed tasks to the replay step until experience is submitted', () => {
    const task = buildOperatorTask(makeAction({ status: 'completed', completedAt: '2026-03-28 11:00:00' }));
    const journey = buildOperatorJourney({
      actionId: task.sourceRefs.actionId!,
      productId: task.sourceRefs.productId,
      task,
    });

    expect(journey.currentStep).toBe('replay');
    expect(journey.nextLabel).toBe('形成经验');
    expect(journey.nextHref).toContain('#journey-review-cta');
  });

  it('marks the whole journey as completed once review is submitted', () => {
    const task = buildOperatorTask(makeAction({ status: 'completed', completedAt: '2026-03-28 11:00:00' }));
    const journey = buildOperatorJourney({
      actionId: task.sourceRefs.actionId!,
      productId: task.sourceRefs.productId,
      task,
      reviewStatus: 'reviewed',
      session: makeSession({
        visitedSteps: {
          focus: '2026-03-28 09:00:00',
          diagnosis: '2026-03-28 09:10:00',
          decision: '2026-03-28 09:20:00',
          execution: '2026-03-28 10:00:00',
          replay: '2026-03-28 11:10:00',
          review: '2026-03-28 11:15:00',
        },
        reviewCompletedAt: '2026-03-28 11:15:00',
      }),
    });

    expect(journey.currentStep).toBe('review');
    expect(journey.isCompleted).toBe(true);
    expect(journey.journeyState).toBe('completed');
    expect(journey.steps.at(-1)?.state).toBe('current');
  });

  it('pauses the journey when a decision is deferred', () => {
    const task = buildOperatorTask(makeAction(), null, {
      approvalDecisions: [
        {
          id: 'APP-DEFER',
          actionId: 'A-JOURNEY-001',
          decision: 'deferred',
          actorLabel: '李明',
          at: '2026-03-28 09:10:00',
          source: 'approval_center',
          nextStatus: 'pending_decision',
        },
      ],
    });
    const journey = buildOperatorJourney({
      actionId: task.sourceRefs.actionId!,
      productId: task.sourceRefs.productId,
      task,
      session: makeSession({
        decisionOutcome: 'deferred',
        visitedSteps: {
          focus: '2026-03-28 09:00:00',
          diagnosis: '2026-03-28 09:05:00',
          decision: '2026-03-28 09:10:00',
        },
      }),
    });

    expect(journey.journeyState).toBe('paused');
    expect(journey.currentStep).toBe('decision');
    expect(journey.nextLabel).toBe('继续拍板');
  });

  it('ends the journey when the decision is rejected', () => {
    const task = buildOperatorTask(makeAction({ status: 'rejected' }));
    const journey = buildOperatorJourney({
      actionId: task.sourceRefs.actionId!,
      productId: task.sourceRefs.productId,
      task,
      session: makeSession({
        decisionOutcome: 'rejected',
        visitedSteps: {
          focus: '2026-03-28 09:00:00',
          diagnosis: '2026-03-28 09:05:00',
          decision: '2026-03-28 09:12:00',
        },
      }),
    });

    expect(journey.journeyState).toBe('ended');
    expect(journey.currentStep).toBe('decision');
    expect(journey.nextLabel).toBe('回到商品诊断');
  });
});
