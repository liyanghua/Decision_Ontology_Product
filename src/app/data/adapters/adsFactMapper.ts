import type {
  Product,
  Evidence,
  RootCause,
  Strategy,
  Action,
  RiskLevel,
  ProblemSeverity,
} from '../mockData';
import { getStructuredDiagnosis } from './diagnosisContentParse';
import type {
  RawItemMetricRow,
  ProductCardVM,
  ProductDiagnosisSummaryVM,
  EvidencePackVM,
} from './adsFactTypes';
import {
  buildDiagnosisBrief,
  defaultProductPriorityStrategy,
  type ProductPriorityStrategy,
} from './productPriorityScore';

/** Larger diagnosis_grade / level number => higher operational risk in customer data convention. */
function diagnosisGradeToRisk(gradeRaw: string | undefined): RiskLevel {
  const n = parseInt(String(gradeRaw ?? '').trim(), 10);
  if (Number.isNaN(n)) return 'low';
  if (n >= 3) return 'high';
  if (n >= 2) return 'medium';
  return 'low';
}

function parseDecimal(s: string | undefined): number {
  if (s == null || String(s).trim() === '') return 0;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseIntSafe(s: string | undefined): number {
  if (s == null || String(s).trim() === '') return 0;
  const n = parseInt(String(s).replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * CTR in API often 0–1; UI expects display percent (e.g. 1.2 means 1.2%).
 */
function ctrDisplayPercent(mainClick: number): number {
  if (mainClick <= 0) return 0;
  if (mainClick <= 1) return mainClick * 100;
  return mainClick;
}

function splitSentences(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const parts = t
    .split(/[;\n；]+/)
    .map((x) => x.replace(/^[\s\-→]+/, '').trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [t];
}

function severityForDeviation(deviationPct: number, criticalTh = -30): ProblemSeverity {
  if (deviationPct <= criticalTh) return 'critical';
  if (deviationPct <= -10) return 'warning';
  return 'info';
}

function buildEvidences(row: RawItemMetricRow, goodsId: string, statistDate: string): Evidence[] {
  const mainClick = parseDecimal(row.main_click);
  const payPct = parseDecimal(row.pay_percent);
  const visitors = parseIntSafe(row.visitors);
  const refundRaw = parseDecimal(row.refund_percent);
  const refundPct = refundRaw <= 1 ? refundRaw * 100 : refundRaw;
  const addPct = parseDecimal(row.add_percent);
  const searchCtr = parseDecimal(row.search_click_rate);

  const ctrVal = ctrDisplayPercent(mainClick);
  const ctrBench = searchCtr > 0 ? ctrDisplayPercent(searchCtr) : 2.0;
  const ctrDev = ctrBench > 0 ? ((ctrVal - ctrBench) / ctrBench) * 100 : 0;

  const convVal = payPct <= 1 ? payPct * 100 : payPct;
  const convBench = 3;
  const convDev = ((convVal - convBench) / convBench) * 100;

  const list: Evidence[] = [
    {
      id: `${goodsId}-${statistDate}-E-ctr`,
      type: '点击率指标',
      metric: '主图点击率 / CTR',
      actual: `${ctrVal.toFixed(2)}%`,
      expected: `${ctrBench.toFixed(2)}%`,
      deviation: Number(ctrDev.toFixed(1)),
      severity: severityForDeviation(ctrDev),
    },
    {
      id: `${goodsId}-${statistDate}-E-conv`,
      type: '转化指标',
      metric: '支付转化率',
      actual: `${convVal.toFixed(2)}%`,
      expected: `${convBench.toFixed(2)}%`,
      deviation: Number(convDev.toFixed(1)),
      severity: severityForDeviation(convDev, -25),
    },
    {
      id: `${goodsId}-${statistDate}-E-uv`,
      type: '流量',
      metric: '访客数',
      actual: visitors,
      expected: Math.max(visitors, 1),
      deviation: 0,
      severity: 'info',
    },
    {
      id: `${goodsId}-${statistDate}-E-refund`,
      type: '退款',
      metric: '销售退款率',
      actual: `${refundPct.toFixed(2)}%`,
      expected: '10%',
      deviation: Number((((refundPct - 10) / 10) * 100).toFixed(1)),
      severity: refundPct > 15 ? 'warning' : 'info',
    },
    {
      id: `${goodsId}-${statistDate}-E-cart`,
      type: '加购',
      metric: '加购率',
      actual: `${(addPct <= 1 ? addPct * 100 : addPct).toFixed(2)}%`,
      expected: '20%',
      deviation: Number(
        ((((addPct <= 1 ? addPct * 100 : addPct) - 20) / 20) * 100).toFixed(1),
      ),
      severity: 'info',
    },
  ];
  return list;
}

function buildRootCauses(structured: ReturnType<typeof getStructuredDiagnosis>, goodsId: string): RootCause[] {
  const chunks = splitSentences(structured.problem_analysis);
  if (chunks.length === 0) {
    return [
      {
        id: `RC-${goodsId}-0`,
        name: '待补充问题剖析',
        confidence: 0.4,
        impact: 0.4,
        evidence: [],
        description: structured.core_conclusion || '诊断文本为空，请检查数据源。',
      },
    ];
  }
  return chunks.slice(0, 6).map((c, i) => ({
    id: `RC-${goodsId}-${i}`,
    name: c.length > 40 ? `${c.slice(0, 37)}…` : c,
    confidence: Math.max(0.35, 0.9 - i * 0.08),
    impact: Math.max(0.35, 0.85 - i * 0.07),
    evidence: [`${goodsId}-E-${i}`],
    description: c,
  }));
}

function buildStrategies(structured: ReturnType<typeof getStructuredDiagnosis>, causes: RootCause[]): Strategy[] {
  const chunks = splitSentences(structured.improvement_suggestions);
  if (chunks.length === 0) {
    return [
      {
        id: `S-fallback-0`,
        name: '结合诊断结论制定动作',
        targetRootCause: causes[0] ? [causes[0].id] : [],
        priority: 50,
        expectedImpact: '待业务确认量化目标',
        actions: ['对齐运营负责人', '拆分为可执行工单'],
      },
    ];
  }
  return chunks.slice(0, 8).map((c, i) => ({
    id: `S-${i}-${hashShort(c)}`,
    name: c.length > 48 ? `${c.slice(0, 45)}…` : c,
    targetRootCause: causes[i] ? [causes[i].id] : causes[0] ? [causes[0].id] : [],
    priority: 90 - i * 5,
    expectedImpact: '按数据侧建议观察对应指标',
    actions: splitSentences(c).slice(0, 4),
  }));
}

function hashShort(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 6);
}

function buildActions(strategies: Strategy[], product: Product): Action[] {
  const out: Action[] = [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  strategies.slice(0, 5).forEach((st, i) => {
    const firstLine = st.actions[0] ?? st.name;
    out.push({
      id: `A-${product.id}-${i}`,
      name: firstLine.length > 50 ? `${firstLine.slice(0, 47)}…` : firstLine,
      type: '诊断建议',
      productId: product.id,
      productName: product.name,
      strategyId: st.id,
      status: 'pending',
      riskLevel: product.riskLevel === 'high' ? 'medium' : 'low',
      reason: st.name,
      expectedImpact: st.expectedImpact,
      createdAt: now,
    });
  });
  return out;
}

export function rawRowToProduct(
  row: RawItemMetricRow,
  priorityStrategy: ProductPriorityStrategy = defaultProductPriorityStrategy,
): Product {
  const goodsId = String(row.goods_id ?? '').trim();
  const structured = getStructuredDiagnosis(row);
  const issues = splitSentences(structured.problem_analysis);
  const risk = diagnosisGradeToRisk(row.diagnosis_grade);
  const { score: priority, level: priorityLevel } = priorityStrategy.compute(row, structured);
  const diagnosisBrief = buildDiagnosisBrief(structured);
  const mainClick = parseDecimal(row.main_click);
  const payPct = parseDecimal(row.pay_percent);
  const visitors = parseIntSafe(row.visitors);
  const realAmt = parseDecimal(row.real_amount);
  const searchCtr = parseDecimal(row.search_click_rate);
  const ctrP30 = searchCtr > 0 ? ctrDisplayPercent(searchCtr) : 2.0;

  const causes = buildRootCauses(structured, goodsId);
  const strats = buildStrategies(structured, causes);
  const actionCount = Math.min(5, Math.max(1, strats.length));

  return {
    id: goodsId,
    name: `商品 ${goodsId}`,
    category: '—',
    brand: '—',
    sku: goodsId,
    priority,
    priorityLevel,
    diagnosisBrief: diagnosisBrief || undefined,
    riskLevel: risk,
    problemCount: Math.max(issues.length, causes.length),
    actionCount,
    metrics: {
      ctr_7d: Number(ctrDisplayPercent(mainClick).toFixed(2)),
      impression_7d: visitors,
      conversion_7d: Number((payPct <= 1 ? payPct * 100 : payPct).toFixed(2)),
      revenue_7d: realAmt,
      category_ctr_p30: Number(ctrP30.toFixed(2)),
    },
    issues: issues.length > 0 ? issues : ['未解析到问题剖析'],
    rootCauses: causes.map((c) => c.name),
    recommendedStrategies: strats.map((s) => s.name),
  };
}

export function buildEvidencePackVM(row: RawItemMetricRow): EvidencePackVM {
  const goodsId = String(row.goods_id ?? '').trim();
  const statistDate = String(row.statist_date ?? '').trim();
  return {
    goodsId,
    statistDate,
    evidences: buildEvidences(row, goodsId, statistDate),
  };
}

export function buildProductDiagnosisSummaryVM(
  row: RawItemMetricRow,
  priorityStrategy: ProductPriorityStrategy = defaultProductPriorityStrategy,
): ProductDiagnosisSummaryVM {
  const goodsId = String(row.goods_id ?? '').trim();
  const statistDate = String(row.statist_date ?? '').trim();
  const structured = getStructuredDiagnosis(row);
  const legacyProduct = rawRowToProduct(row, priorityStrategy);
  const causes = buildRootCauses(structured, goodsId);
  const strats = buildStrategies(structured, causes);
  const actions = buildActions(strats, legacyProduct);

  legacyProduct.actionCount = actions.length;
  legacyProduct.problemCount = Math.max(legacyProduct.problemCount, causes.length);

  return {
    goodsId,
    statistDate,
    dataLoadTime: String(row.data_load_time ?? '').trim(),
    diagnosisGrade: String(row.diagnosis_grade ?? '').trim(),
    structured,
    rawRow: row,
    legacyProduct,
    evidencePack: buildEvidencePackVM(row),
    rootCauses: causes,
    strategies: strats,
    actions,
  };
}

export function rawRowToProductCardVM(
  row: RawItemMetricRow,
  priorityStrategy: ProductPriorityStrategy = defaultProductPriorityStrategy,
): ProductCardVM {
  const p = rawRowToProduct(row, priorityStrategy);
  return {
    goodsId: p.id,
    statistDate: String(row.statist_date ?? '').trim(),
    displayName: p.name,
    category: p.category,
    brand: p.brand,
    sku: p.sku,
    priority: p.priority,
    riskLevel: p.riskLevel,
    problemCount: p.problemCount,
    actionCount: p.actionCount,
    metrics: p.metrics,
    issues: p.issues,
    rootCauseLabels: p.rootCauses,
    strategyLabels: p.recommendedStrategies,
  };
}
