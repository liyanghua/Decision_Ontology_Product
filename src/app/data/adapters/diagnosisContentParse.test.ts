import { describe, it, expect } from 'vitest';
import {
  parseDiagnosisContentJson,
  parseDiagnosisMarkdownFallback,
  getStructuredDiagnosis,
} from './diagnosisContentParse';

describe('diagnosisContentParse', () => {
  it('parses valid json with six fields', () => {
    const raw = JSON.stringify({
      analysis_thought: 'step-a',
      core_conclusion: 'step-b',
      problem_analysis: 'step-c',
      growth_analysis: 'step-d',
      improvement_suggestions: 'step-e',
      missing_data_impact: 'step-f',
    });
    const r = parseDiagnosisContentJson(raw);
    expect(r?.analysis_thought).toBe('step-a');
    expect(r?.missing_data_impact).toBe('step-f');
  });

  it('returns null for invalid json', () => {
    expect(parseDiagnosisContentJson('{not json')).toBeNull();
  });

  it('markdown fallback maps numbered sections', () => {
    const md = '#### 1. 分析思路\nhello\n#### 2. 核心结论\nworld';
    const r = parseDiagnosisMarkdownFallback(md);
    expect(r.analysis_thought).toContain('hello');
    expect(r.core_conclusion).toContain('world');
  });

  it('getStructuredDiagnosis prefers json then fills gaps from markdown', () => {
    const row = {
      diagnosis_content_json: JSON.stringify({
        analysis_thought: '',
        core_conclusion: 'json-conc',
        problem_analysis: '',
        growth_analysis: '',
        improvement_suggestions: '',
        missing_data_impact: '',
      }),
      diagnosis_content:
        '#### 1. 分析思路\nfrom-markdown-thought\n#### 4. 问题剖析\nfrom-markdown-problem',
    };
    const g = getStructuredDiagnosis(row);
    expect(g.core_conclusion).toBe('json-conc');
    expect(g.analysis_thought).toContain('from-markdown-thought');
    expect(g.problem_analysis).toContain('from-markdown-problem');
  });

  it('falls back to markdown when json missing', () => {
    const row = {
      diagnosis_content_json: '',
      diagnosis_content: '#### 5. 增长分析\nonly-md',
    };
    const g = getStructuredDiagnosis(row);
    expect(g.growth_analysis).toContain('only-md');
  });
});
