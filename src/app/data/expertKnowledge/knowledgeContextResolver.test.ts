import { describe, expect, it } from 'vitest';
import { resolveKnowledgeSupport } from './knowledgeContextResolver';

describe('resolveKnowledgeSupport', () => {
  it('product_detail：根因与策略键参与命中', () => {
    const r = resolveKnowledgeSupport({
      page: 'product_detail',
      goodsId: 'P100891',
      problemKey: 'low_ctr',
      rootCauseKey: 'RC001',
      strategyKey: 'S001',
      stageKey: 'diagnose',
    });
    expect(r.strategySnippets.some((s) => s.support_id === 'str-root-RC001')).toBe(
      true,
    );
    expect(r.strategySnippets.some((s) => s.support_id === 'str-st-S001')).toBe(
      true,
    );
    expect(r.flowBundle.stageKey).toBe('diagnose');
  });

  it('action_approval：风险等级参与命中', () => {
    const r = resolveKnowledgeSupport({
      page: 'action_approval',
      goodsId: 'P100891',
      category: '床上四件套',
      problemKey: 'main_image_weak',
      riskKey: 'high',
      actionKey: 'A001',
      stageKey: 'optimize',
    });
    expect(r.strategySnippets.some((s) => s.support_id === 'str-risk-high')).toBe(
      true,
    );
    expect(r.flowBundle.citations.length).toBeGreaterThan(0);
  });

  it('replay_explain：versionDiff 追加对比片段', () => {
    const base = resolveKnowledgeSupport({
      page: 'replay_explain',
      goodsId: 'P100891',
      problemKey: 'generic',
      versionDiff: false,
    });
    const diff = resolveKnowledgeSupport({
      page: 'replay_explain',
      goodsId: 'P100891',
      problemKey: 'generic',
      versionDiff: true,
    });
    expect(diff.strategySnippets.length).toBeGreaterThanOrEqual(
      base.strategySnippets.length,
    );
    expect(
      diff.strategySnippets.some((s) => s.support_id === 'str-replay-diff-1'),
    ).toBe(true);
  });
});
