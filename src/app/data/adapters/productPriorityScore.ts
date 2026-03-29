/**
 * Heuristic product priority scoring for queue ordering.
 * Replace `ProductPriorityStrategy` with ML/rules engine when backend is ready.
 */
import type { RawItemMetricRow } from './adsFactTypes';
import type { DiagnosisContentStructured } from './diagnosisContentParse';

export type PriorityLevel = 'P1' | 'P2' | 'P3';

export interface PriorityScoreResult {
  /** Display score (0–100), higher = more urgent. */
  score: number;
  level: PriorityLevel;
  /** Optional term weights for debugging / future UI. */
  breakdown?: Record<string, number>;
}

export interface ProductPriorityStrategy {
  compute(row: RawItemMetricRow, structured: DiagnosisContentStructured): PriorityScoreResult;
}

function parseDecimal(s: string | undefined): number {
  if (s == null || String(s).trim() === '') return Number.NaN;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : Number.NaN;
}

function parseGrade(row: RawItemMetricRow): number {
  const n = parseInt(String(row.diagnosis_grade ?? '').trim(), 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(5, Math.max(1, n));
}

/** Ratio-style field: if absolute value in (0,1], treat as fraction of 100. */
function toDisplayPercent(raw: number): number {
  if (!Number.isFinite(raw) || raw === 0) return 0;
  if (Math.abs(raw) <= 1) return raw * 100;
  return raw;
}

function scoreToLevel(score: number): PriorityLevel {
  if (score >= 72) return 'P1';
  if (score >= 48) return 'P2';
  return 'P3';
}

export const defaultProductPriorityStrategy: ProductPriorityStrategy = {
  compute(row, structured): PriorityScoreResult {
    const g = parseGrade(row);
    const base = 12 + g * 13;

    const searchCtrRaw = parseDecimal(row.search_click_rate);
    const searchCtrPct = toDisplayPercent(searchCtrRaw);

    const payRaw = parseDecimal(row.pay_percent);
    const payPct = toDisplayPercent(payRaw);

    const bounceRaw = parseDecimal(row.goods_details_bounce);
    const bouncePct = toDisplayPercent(bounceRaw);

    const refundRaw = parseDecimal(row.refund_percent);
    const refundPct = toDisplayPercent(refundRaw);

    const growthRaw = parseDecimal(row.search_visitors_7d_rate);
    const growthPct = Number.isFinite(growthRaw) ? toDisplayPercent(growthRaw) : 0;

    let bonusCtr = 0;
    if (Number.isFinite(searchCtrPct) && searchCtrPct < 0.8) bonusCtr = 10;

    let bonusPay = 0;
    if (Number.isFinite(payPct) && payPct < 2.5) bonusPay = 12;
    else if (Number.isFinite(payPct) && payPct < 4) bonusPay = 5;

    let bonusBounce = 0;
    if (Number.isFinite(bouncePct) && bouncePct > 55) bonusBounce = 9;
    else if (Number.isFinite(bouncePct) && bouncePct > 40) bonusBounce = 4;

    let bonusRefund = 0;
    if (Number.isFinite(refundPct) && refundPct > 14) bonusRefund = 12;
    else if (Number.isFinite(refundPct) && refundPct > 10) bonusRefund = 7;

    let bonusTrafficMismatch = 0;
    const weakConv = Number.isFinite(payPct) && payPct < 2.8;
    const trafficUp = Number.isFinite(growthPct) && growthPct > 2;
    if (weakConv && trafficUp) bonusTrafficMismatch = 14;

    const rawSum = base + bonusCtr + bonusPay + bonusBounce + bonusRefund + bonusTrafficMismatch;
    const score = Math.min(100, Math.max(0, Math.round(rawSum)));

    return {
      score,
      level: scoreToLevel(score),
      breakdown: {
        base,
        bonusCtr,
        bonusPay,
        bonusBounce,
        bonusRefund,
        bonusTrafficMismatch,
      },
    };
  },
};

/**
 * One-line brief for list cards: problem + suggestions from structured diagnosis.
 */
export function buildDiagnosisBrief(
  structured: DiagnosisContentStructured,
  maxChars = 240,
): string {
  const parts: string[] = [];
  const pa = (structured.problem_analysis ?? '').trim();
  const imp = (structured.improvement_suggestions ?? '').trim();
  if (pa) parts.push(pa.replace(/\s+/g, ' '));
  if (imp) parts.push(imp.replace(/\s+/g, ' '));
  let out = parts.join(' · ');
  if (!out) return '';
  if (out.length <= maxChars) return out;
  return `${out.slice(0, Math.max(0, maxChars - 1))}…`;
}
