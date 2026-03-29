import { describe, expect, it } from 'vitest';
import { inferPhaseForContext } from './diagnosisFlowSkeleton';

const base = {
  hasGoodsId: true,
  hasMetricsRow: true,
  hasStructuredDiagnosis: true,
  pendingActionCount: 0,
};

describe('inferPhaseForContext', () => {
  it('detail：无商品或未拉数时落在准备阶段', () => {
    expect(
      inferPhaseForContext({ route: 'detail', ...base, hasGoodsId: false }),
    ).toBe('prepare');
    expect(
      inferPhaseForContext({ route: 'detail', ...base, hasMetricsRow: false }),
    ).toBe('prepare');
  });

  it('detail：有数无结构化诊断时落在采集', () => {
    expect(
      inferPhaseForContext({
        route: 'detail',
        ...base,
        hasStructuredDiagnosis: false,
      }),
    ).toBe('collect');
  });

  it('detail：有待审批动作时落在优化动作', () => {
    expect(
      inferPhaseForContext({
        route: 'detail',
        ...base,
        pendingActionCount: 1,
      }),
    ).toBe('optimize');
  });

  it('detail：完整诊断且无待审回到问题诊断', () => {
    expect(inferPhaseForContext({ route: 'detail', ...base })).toBe('diagnose');
  });

  it('固定路由映射', () => {
    expect(inferPhaseForContext({ route: 'approvals', ...base })).toBe('optimize');
    expect(inferPhaseForContext({ route: 'execution', ...base })).toBe('review');
    expect(
      inferPhaseForContext({
        route: 'replay',
        ...base,
        hasStructuredDiagnosis: true,
      }),
    ).toBe('diagnose');
    expect(
      inferPhaseForContext({
        route: 'replay',
        ...base,
        hasStructuredDiagnosis: false,
        hasMetricsRow: true,
      }),
    ).toBe('collect');
    expect(
      inferPhaseForContext({
        route: 'replay',
        ...base,
        hasStructuredDiagnosis: false,
        hasMetricsRow: false,
      }),
    ).toBe('prepare');
  });
});
