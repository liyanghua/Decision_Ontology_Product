export interface DiagnosisContentStructured {
  analysis_thought: string;
  core_conclusion: string;
  problem_analysis: string;
  growth_analysis: string;
  improvement_suggestions: string;
  missing_data_impact: string;
}

const EMPTY: DiagnosisContentStructured = {
  analysis_thought: '',
  core_conclusion: '',
  problem_analysis: '',
  growth_analysis: '',
  improvement_suggestions: '',
  missing_data_impact: '',
};

const JSON_KEYS: (keyof DiagnosisContentStructured)[] = [
  'analysis_thought',
  'core_conclusion',
  'problem_analysis',
  'growth_analysis',
  'improvement_suggestions',
  'missing_data_impact',
];

/**
 * Parse diagnosis_content_json cell. Tolerates empty, invalid JSON, partial keys.
 */
export function parseDiagnosisContentJson(raw: string | undefined): DiagnosisContentStructured | null {
  if (raw == null || String(raw).trim() === '') return null;
  let text = String(raw).trim();
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    const out = { ...EMPTY };
    for (const k of JSON_KEYS) {
      const v = parsed[k];
      out[k] = v == null ? '' : String(v).trim();
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * Map markdown sections (#### N. title) to structured fields. Tolerates numbering gaps.
 */
export function parseDiagnosisMarkdownFallback(markdown: string | undefined): DiagnosisContentStructured {
  const out = { ...EMPTY };
  if (markdown == null || String(markdown).trim() === '') return out;

  const text = String(markdown).replace(/\r\n/g, '\n');
  const sections: { title: string; body: string }[] = [];

  const headerRe = /^#{2,4}\s*(?:\d+\.\s*)?(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  const matches: { index: number; title: string }[] = [];
  while ((m = headerRe.exec(text)) !== null) {
    matches.push({ index: m.index, title: m[1].trim() });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const chunk = text.slice(start, end);
    const nl = chunk.indexOf('\n');
    const body = (nl === -1 ? '' : chunk.slice(nl + 1)).trim();
    sections.push({ title: matches[i].title, body });
  }

  const norm = (s: string) => s.replace(/\s+/g, '');

  for (const sec of sections) {
    const t = norm(sec.title);
    if (t.includes('分析思路')) out.analysis_thought = sec.body;
    else if (t.includes('核心结论')) out.core_conclusion = sec.body;
    else if (t.includes('问题剖析') || t.includes('问题分析') || t.includes('当前问题'))
      out.problem_analysis = sec.body;
    else if (t.includes('增长分析')) out.growth_analysis = sec.body;
    else if (t.includes('改进建议')) out.improvement_suggestions = sec.body;
    else if (t.includes('数据缺失') || t.includes('缺失与影响')) out.missing_data_impact = sec.body;
  }

  return out;
}

function mergePreferNonEmpty(
  primary: DiagnosisContentStructured,
  fallback: DiagnosisContentStructured,
): DiagnosisContentStructured {
  const out = { ...EMPTY };
  for (const k of JSON_KEYS) {
    out[k] = primary[k]?.trim() ? primary[k] : fallback[k] ?? '';
  }
  return out;
}

type DiagnosisRowPick = {
  diagnosis_content_json?: string;
  diagnosis_content?: string;
};

/** Prefer JSON; fill missing empty fields from diagnosis_content markdown. */
export function getStructuredDiagnosis(row: DiagnosisRowPick): DiagnosisContentStructured {
  const fromJson = parseDiagnosisContentJson(row.diagnosis_content_json);
  const fromMd = parseDiagnosisMarkdownFallback(row.diagnosis_content);
  if (fromJson) return mergePreferNonEmpty(fromJson, fromMd);
  return fromMd;
}

const MAX_BULLETS = 12;
const MAX_HIGHLIGHT = 5;

/** Bullet-style lines for problem / growth sections (avoid dumping long paragraphs). */
export function splitInsightBullets(text: string | undefined, max = MAX_BULLETS): string[] {
  if (text == null || String(text).trim() === '') return [];
  const parts = String(text)
    .split(/[；;\n\r]+/)
    .map((s) => s.replace(/^[\s\-→]+/u, '').trim())
    .filter(Boolean);
  return parts.slice(0, max);
}

/** Shorter highlight snippets for core conclusion / missing-data sections. */
export function splitHighlightCards(text: string | undefined, max = MAX_HIGHLIGHT): string[] {
  if (text == null || String(text).trim() === '') return [];
  const parts = String(text)
    .split(/[。．；;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.slice(0, max);
}
