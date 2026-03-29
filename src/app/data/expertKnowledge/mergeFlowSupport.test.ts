import { describe, expect, it } from 'vitest';
import { getFlowSupportByAction, getFlowSupportByStage } from './flowSupportMock';
import { mergeFlowSupport } from './mergeFlowSupport';

describe('mergeFlowSupport', () => {
  it('无 overlay 时返回 base', () => {
    const b = getFlowSupportByStage('collect');
    expect(mergeFlowSupport(b, null)).toEqual(b);
  });

  it('合并追加提醒与引用', () => {
    const b = getFlowSupportByStage('optimize');
    const o = getFlowSupportByAction('A001');
    expect(o).toBeDefined();
    const m = mergeFlowSupport(b, o!);
    expect(m.executionReminders.length).toBeGreaterThanOrEqual(
      b.executionReminders.length,
    );
    expect(m.citations.length).toBeGreaterThanOrEqual(b.citations.length);
    expect(m.stageSummary).toContain(b.stageSummary);
  });
});
