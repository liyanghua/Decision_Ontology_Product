import { describe, expect, it } from 'vitest';
import { buildDecisionRunFromRow } from './decisionReplayMapper';
import type { RawItemMetricRow } from './adsFactTypes';

describe('buildDecisionRunFromRow', () => {
  it('空 diagnosis_content_json 时 raw 为空串，structured 仍可来自 markdown 兜底', () => {
    const row: RawItemMetricRow = {
      statist_date: '2026-03-01',
      goods_id: 'G123',
      data_load_time: '2026-03-02 10:00:00',
      diagnosis_grade: '2',
      diagnosis_content_json: '',
      diagnosis_content:
        '#### 2. 核心结论\n测试结论一句。\n#### 3. 问题剖析\n问题A；问题B',
      visitors: '100',
    };
    const run = buildDecisionRunFromRow(row);
    expect(run.diagnosisContentRawJson).toBe('');
    expect(run.id).toBe('G123@2026-03-01');
    expect(run.request.goodsId).toBe('G123');
    expect(run.structured.core_conclusion).toContain('测试结论');
  });

  it('保留 JSON 原文字符串', () => {
    const json = '{"core_conclusion":"X","problem_analysis":"","growth_analysis":"","improvement_suggestions":"","missing_data_impact":"","analysis_thought":""}';
    const row: RawItemMetricRow = {
      statist_date: '2026-03-01',
      goods_id: 'G1',
      diagnosis_grade: '3',
      diagnosis_content_json: json,
    };
    const run = buildDecisionRunFromRow(row);
    expect(run.diagnosisContentRawJson).toBe(json);
    expect(run.structured.core_conclusion).toBe('X');
  });
});
