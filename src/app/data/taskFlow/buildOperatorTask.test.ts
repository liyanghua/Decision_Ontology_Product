import { describe, expect, it } from 'vitest';
import type { Action, Execution } from '../mockData';
import type { ApprovalDecision, RecoveryAction, TakeoverAction, TaskFlowDemoOverride } from './taskTypes';
import { buildOperatorTask } from './buildOperatorTask';

function makeAction(overrides: Partial<Action> = {}): Action {
  return {
    id: 'A-TDD-001',
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

function makeExecution(overrides: Partial<Execution> = {}): Execution {
  return {
    id: 'EX-TDD-001',
    actionId: 'A-TDD-001',
    actionName: '主图优化任务',
    productName: '春夏凉感四件套',
    status: 'running',
    progress: 50,
    startTime: '2026-03-28 10:00:00',
    expectedOutcome: 'CTR 提升 15%',
    logs: [],
    ...overrides,
  };
}

function makeApprovalDecision(
  overrides: Partial<ApprovalDecision> = {},
): ApprovalDecision {
  return {
    id: 'APP-001',
    actionId: 'A-TDD-001',
    decision: 'approved',
    actorLabel: '李明',
    note: '先拉起一轮执行验证',
    at: '2026-03-28 09:30:00',
    source: 'approval_center',
    nextStatus: 'approved',
    ...overrides,
  };
}

function makeRecoveryAction(
  overrides: Partial<RecoveryAction> = {},
): RecoveryAction {
  return {
    id: 'REC-001',
    actionId: 'A-TDD-001',
    kind: 'retry',
    actorLabel: '李明',
    reason: '库存同步问题已修复，重新执行',
    at: '2026-03-28 11:00:00',
    result: 'running',
    ...overrides,
  };
}

function makeTakeoverAction(
  overrides: Partial<TakeoverAction> = {},
): TakeoverAction {
  return {
    id: 'TAKE-001',
    actionId: 'A-TDD-001',
    actorLabel: '李明',
    reason: '需要人工核对库存映射',
    at: '2026-03-28 12:00:00',
    resolution: null,
    ...overrides,
  };
}

describe('buildOperatorTask', () => {
  it('maps pending actions to pending_decision tasks', () => {
    const task = buildOperatorTask(makeAction());
    expect(task.status).toBe('pending_decision');
    expect(task.statusLabel).toBeTruthy();
    expect(task.availableActions.length).toBeGreaterThan(0);
  });

  it('keeps waiting_input tasks in the pre-stage queue with a direct input-complete action', () => {
    const task = buildOperatorTask(makeAction(), null, {
      phaseOverride: 'waiting_input',
    });

    expect(task.status).toBe('waiting_input');
    expect(task.availableActions).toContain('fill_inputs');
  });

  it('keeps diagnosing tasks in the pre-stage queue with a direct diagnosis-complete action', () => {
    const task = buildOperatorTask(makeAction(), null, {
      phaseOverride: 'diagnosing',
    });

    expect(task.status).toBe('diagnosing');
    expect(task.availableActions).toContain('finish_diagnosis');
  });

  it('uses approval decisions to move tasks to approved and records approver on the timeline', () => {
    const task = buildOperatorTask(makeAction(), null, {
      approvalDecisions: [makeApprovalDecision()],
    });

    expect(task.status).toBe('approved');
    expect(task.latestApprovalDecision?.actorLabel).toBe('李明');
    expect(
      task.timeline.some(
        (item) =>
          item.kind === 'approval' &&
          item.actorLabel === '李明' &&
          item.outcomeLabel === '已批准',
      ),
    ).toBe(true);
  });

  it('keeps deferred tasks in their current phase and uses the defer note as next-step hint', () => {
    const task = buildOperatorTask(makeAction(), null, {
      approvalDecisions: [
        makeApprovalDecision({
          id: 'APP-002',
          decision: 'deferred',
          note: '等到周三大促窗口再推进',
          nextStatus: 'pending_decision',
          at: '2026-03-28 09:40:00',
        }),
      ],
    });

    expect(task.status).toBe('pending_decision');
    expect(task.nextStepHint).toContain('周三大促窗口');
    expect(task.timeline[0]?.title).toBe('暂缓处理');
  });

  it('uses reject decisions to archive a pending task', () => {
    const task = buildOperatorTask(makeAction(), null, {
      approvalDecisions: [
        makeApprovalDecision({
          id: 'APP-003',
          decision: 'rejected',
          note: '当前收益不够，先不做',
          nextStatus: 'archived',
          at: '2026-03-28 09:50:00',
        }),
      ],
    });

    expect(task.status).toBe('archived');
    expect(task.blockReason).toContain('收益不够');
  });

  it('maps running execution to executing tasks', () => {
    const task = buildOperatorTask(
      makeAction({
        status: 'running',
        approvedAt: '2026-03-28 09:50:00',
        executedAt: '2026-03-28 10:00:00',
      }),
      makeExecution(),
    );
    expect(task.status).toBe('executing');
    expect(task.updatedAt).toBe('2026-03-28 10:00:00');
  });

  it('maps failed execution to failed task and surfaces the error reason', () => {
    const task = buildOperatorTask(
      makeAction({
        status: 'approved',
        approvedAt: '2026-03-28 09:50:00',
      }),
      makeExecution({
        status: 'failed',
        endTime: '2026-03-28 10:45:00',
        logs: [
          {
            id: 'LOG-1',
            timestamp: '2026-03-28 10:45:00',
            level: 'error',
            message: '库存同步异常，无法继续推进',
          },
        ],
      }),
    );
    expect(task.status).toBe('failed');
    expect(task.blockReason).toContain('库存同步异常');
    expect(task.canRetry).toBe(true);
  });

  it('maps retry actions to executing and exposes the current recovery state', () => {
    const task = buildOperatorTask(
      makeAction({ status: 'failed' }),
      makeExecution({
        status: 'failed',
        endTime: '2026-03-28 10:45:00',
      }),
      {
        recoveryActions: [makeRecoveryAction()],
      },
    );

    expect(task.status).toBe('executing');
    expect(task.retryCount).toBe(1);
    expect(task.latestRecoveryStateLabel).toBe('恢复中');
    expect(task.timeline.some((item) => item.kind === 'retry' && item.actorLabel === '李明')).toBe(
      true,
    );
  });

  it('maps a successful retry to completed and shows recovery success', () => {
    const task = buildOperatorTask(
      makeAction({ status: 'failed' }),
      makeExecution({ status: 'failed' }),
      {
        recoveryActions: [
          makeRecoveryAction({
            result: 'succeeded',
            resolvedAt: '2026-03-28 12:30:00',
          }),
        ],
      },
    );

    expect(task.status).toBe('completed');
    expect(task.latestRecoveryStateLabel).toBe('已恢复成功');
    expect(
      task.timeline.some(
        (item) => item.kind === 'recovery_result' && item.outcomeLabel === '已恢复成功',
      ),
    ).toBe(true);
  });

  it('maps a failed retry back to failed and preserves the recovery failure reason', () => {
    const task = buildOperatorTask(
      makeAction({ status: 'failed' }),
      makeExecution({ status: 'failed' }),
      {
        recoveryActions: [
          makeRecoveryAction({
            result: 'failed',
            resolvedAt: '2026-03-28 12:20:00',
            reason: '重试后仍然没有拿到库存映射',
          }),
        ],
      },
    );

    expect(task.status).toBe('failed');
    expect(task.latestRecoveryStateLabel).toBe('恢复未成功');
    expect(task.blockReason).toContain('库存映射');
  });

  it('maps active takeover actions to needs_takeover', () => {
    const task = buildOperatorTask(makeAction({ status: 'failed' }), null, {
      takeoverActions: [makeTakeoverAction()],
    });

    expect(task.status).toBe('needs_takeover');
    expect(task.activeTakeover?.actorLabel).toBe('李明');
    expect(task.ownerLabel).toBe('李明');
  });

  it.each([
    ['executing', '回到推进中'],
    ['completed', '已闭环'],
    ['archived', '已收档'],
  ] as const)(
    'maps takeover resolution to %s',
    (resolution, expectedOutcomeLabel) => {
      const task = buildOperatorTask(makeAction({ status: 'failed' }), null, {
        takeoverActions: [
          makeTakeoverAction({
            resolution,
            resolvedAt: '2026-03-28 13:00:00',
            resolutionNote: '人工处理已完成判断',
          }),
        ],
      });

      expect(task.status).toBe(resolution);
      expect(
        task.timeline.some(
          (item) =>
            item.kind === 'takeover_resolution' && item.outcomeLabel === expectedOutcomeLabel,
        ),
      ).toBe(true);
    },
  );

  it('retains legacy retry overrides for compatibility', () => {
    const task = buildOperatorTask(
      makeAction({ status: 'failed' }),
      null,
      { phaseOverride: 'executing', retryCount: 1 } satisfies TaskFlowDemoOverride,
    );
    expect(task.status).toBe('executing');
    expect(task.retryCount).toBe(1);
  });
});
