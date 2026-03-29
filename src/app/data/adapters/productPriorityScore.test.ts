import { describe, expect, it } from 'vitest';
import { defaultProductPriorityStrategy, buildDiagnosisBrief } from './productPriorityScore';
import type { RawItemMetricRow } from './adsFactTypes';
import type { DiagnosisContentStructured } from './diagnosisContentParse';

const emptyStructured: DiagnosisContentStructured = {
  analysis_thought: '',
  core_conclusion: '',
  problem_analysis: '',
  growth_analysis: '',
  improvement_suggestions: '',
  missing_data_impact: '',
};

function row(partial: Partial<RawItemMetricRow>): RawItemMetricRow {
  return {
    statist_date: '2026-03-01',
    goods_id: 'G1',
    diagnosis_grade: '3',
    search_click_rate: '0.02',
    pay_percent: '0.035',
    goods_details_bounce: '0.35',
    refund_percent: '0.08',
    search_visitors_7d_rate: '0',
    ...partial,
  };
}

describe('defaultProductPriorityStrategy', () => {
  it('同 grade 下更低 pay_percent 提高 score', () => {
    const highPay = defaultProductPriorityStrategy.compute(row({ pay_percent: '0.04' }), emptyStructured);
    const lowPay = defaultProductPriorityStrategy.compute(row({ pay_percent: '0.015' }), emptyStructured);
    expect(lowPay.score).toBeGreaterThan(highPay.score);
  });

  it('同 grade 下更高 refund_percent 提高 score', () => {
    const lowRef = defaultProductPriorityStrategy.compute(row({ refund_percent: '0.05' }), emptyStructured);
    const highRef = defaultProductPriorityStrategy.compute(row({ refund_percent: '0.16' }), emptyStructured);
    expect(highRef.score).toBeGreaterThan(lowRef.score);
  });

  it('search_visitors_7d_rate 为正且转化弱时 score 高于对照', () => {
    const base = defaultProductPriorityStrategy.compute(
      row({ search_visitors_7d_rate: '0', pay_percent: '0.02' }),
      emptyStructured,
    );
    const mismatch = defaultProductPriorityStrategy.compute(
      row({ search_visitors_7d_rate: '0.05', pay_percent: '0.02' }),
      emptyStructured,
    );
    expect(mismatch.score).toBeGreaterThan(base.score);
  });

  it('diagnosis_grade 越高 base 分越高', () => {
    const lowG = defaultProductPriorityStrategy.compute(row({ diagnosis_grade: '1' }), emptyStructured);
    const highG = defaultProductPriorityStrategy.compute(row({ diagnosis_grade: '5' }), emptyStructured);
    expect(highG.score).toBeGreaterThan(lowG.score);
  });
});

describe('buildDiagnosisBrief', () => {
  it('拼接 problem_analysis 与 improvement_suggestions 并截断', () => {
    const st: DiagnosisContentStructured = {
      ...emptyStructured,
      problem_analysis: '问题A',
      improvement_suggestions: '建议B',
    };
    expect(buildDiagnosisBrief(st, 100)).toContain('问题A');
    expect(buildDiagnosisBrief(st, 100)).toContain('建议B');
    const long = 'x'.repeat(300);
    const brief = buildDiagnosisBrief({ ...emptyStructured, problem_analysis: long }, 50);
    expect(brief.length).toBeLessThanOrEqual(50);
    expect(brief.endsWith('…')).toBe(true);
  });
});
