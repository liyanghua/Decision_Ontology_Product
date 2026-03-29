/**
 * Live catalog from ads_fact_item_summary_d CSV. Swap createAdsFactCatalogService
 * for an HTTP-backed service without changing page imports beyond this module.
 */
import adsCsvRaw from '../../../data/ads_fact_item_summary_d.csv?raw';
import type {
  Product,
  Evidence,
  RootCause,
  Strategy,
  Action,
  HighValueLead,
  GoalSummary,
  ProblemSeverity,
} from './mockData';
import { loadRawRowsFromText } from './adapters/adsFactCsvLoader';
import { createAdsFactCatalogService, type ProductCatalogService } from './productCatalogService';
import type { DiagnosisContentStructured } from './adapters/diagnosisContentParse';
import { getDecisionObjectForReplay } from './adapters/decisionReplayMapper';
import type { DecisionObject } from './adapters/decisionReplayTypes';

function parseRealAmount(s: string | undefined): number {
  if (s == null || String(s).trim() === '') return 0;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const rawRows = loadRawRowsFromText(adsCsvRaw);

export const adsFactCatalog: ProductCatalogService = createAdsFactCatalogService(rawRows);

/** Mock-service style API; swap implementation when wiring HTTP. */
export function listProducts(): Product[] {
  return adsFactCatalog.listProducts();
}

export function getProductDiagnosis(goodsId: string, statistDate?: string) {
  return adsFactCatalog.getProductDiagnosis(goodsId, statistDate);
}

export function getTopPriorityProducts(limit = 10): Product[] {
  return adsFactCatalog.getTopPriorityProducts(limit);
}

export function getAvailableStatDates(goodsId: string): string[] {
  return adsFactCatalog.getAvailableStatDates(goodsId);
}

/** CSV-backed decision replay DTO for Replay & Explain page. */
export function getDecisionObject(goodsId: string, statistDate?: string): DecisionObject | undefined {
  return getDecisionObjectForReplay(adsFactCatalog, goodsId, statistDate);
}

export type { DecisionObject };

/** Top queue for home「今日重点」cards (same sort as listProducts / getTopPriorityProducts). */
export const todayFocusProducts: Product[] = adsFactCatalog.getTopPriorityProducts(8);

export const products: Product[] = adsFactCatalog.listProducts();

const evidencePacksMap: Record<string, Evidence[]> = {};
const rootCausesMap: Record<string, RootCause[]> = {};
const strategiesMap: Record<string, Strategy[]> = {};
const diagnosisStructuredMap: Record<string, DiagnosisContentStructured> = {};
const statDatesByProduct: Record<string, string[]> = {};
let mergedActions: Action[] = [];

for (const p of products) {
  const vm = adsFactCatalog.getProductDiagnosis(p.id);
  if (!vm) continue;
  evidencePacksMap[p.id] = vm.evidencePack.evidences;
  rootCausesMap[p.id] = vm.rootCauses;
  strategiesMap[p.id] = vm.strategies;
  diagnosisStructuredMap[p.id] = vm.structured;
  statDatesByProduct[p.id] = adsFactCatalog.getAvailableStatDates(p.id);
  mergedActions = mergedActions.concat(vm.actions);
}

export const evidencePacks = evidencePacksMap as Record<string, Evidence[]>;
export const rootCauses = rootCausesMap as Record<string, RootCause[]>;
export const strategies = strategiesMap as Record<string, Strategy[]>;
export const actions: Action[] = mergedActions;

export const diagnosisStructuredByProductId = diagnosisStructuredMap;
export const availableStatDatesByProductId = statDatesByProduct;

const latestDay = adsFactCatalog.getLatestGlobalStatistDate();
const rowsOnLatest = rawRows.filter((r) => String(r.statist_date ?? '').trim() === latestDay);
const gmvSum = rowsOnLatest.reduce((acc, r) => acc + parseRealAmount(r.real_amount), 0);

/** Placeholder target until OKR API; assumes ~71.3% progress when deriving target from current GMV. */
const impliedProgressRatio = 0.713;
const targetGmv = gmvSum > 0 ? Math.round(gmvSum / impliedProgressRatio) : 1_200_000;
const currentGmv = Math.round(gmvSum);
const progressPct =
  targetGmv > 0 ? Math.min(100, Math.round((currentGmv / targetGmv) * 1000) / 10) : 0;

export const goalSummary: GoalSummary = {
  period: latestDay ? `${latestDay.slice(5)} 汇总` : '月度',
  target: targetGmv,
  current: currentGmv,
  progress: progressPct,
  trend: 'down',
  deviation: Math.round((progressPct - 71.3) * 10) / 10,
};

function severityFromProduct(p: Product): ProblemSeverity {
  if (p.riskLevel === 'high') return 'critical';
  if (p.riskLevel === 'medium') return 'warning';
  return 'info';
}

const topForSignals = adsFactCatalog.getTopPriorityProducts(6);
export const todaySignals = topForSignals.map((p, idx) => {
  const st = diagnosisStructuredByProductId[p.id];
  const msg =
    (st?.core_conclusion && st.core_conclusion.slice(0, 160)) ||
    p.issues[0] ||
    '请关注该商品诊断结论';
  return {
    id: `SIG-LIVE-${p.id}-${idx}`,
    type: '诊断结论',
    productId: p.id,
    productName: p.name,
    severity: severityFromProduct(p),
    message: msg,
    timestamp: `${latestDay || '—'} 08:00:00`,
  };
});

export const highValueLeads: HighValueLead[] = topForSignals.slice(0, 5).map((p, idx) => {
  const st = diagnosisStructuredByProductId[p.id];
  const isOpp = idx % 2 === 0;
  return {
    id: `LEAD-LIVE-${p.id}`,
    type: isOpp ? 'opportunity' : 'risk',
    title: p.issues[0] || `商品 ${p.id} 运营信号`,
    description: (st?.problem_analysis || '').slice(0, 240) || '暂无问题剖析文本',
    impact: (st?.growth_analysis || '').slice(0, 120) || '—',
    productIds: [p.id],
    productCount: 1,
    urgency: p.riskLevel === 'high' ? 'high' : 'medium',
    actionable: true,
  };
});
