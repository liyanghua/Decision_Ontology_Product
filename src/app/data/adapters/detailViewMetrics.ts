import type { RawItemMetricRow } from './adsFactTypes';

/** Core metrics required for Product Diagnosis Detail (ads_fact_item_summary_d). */
export const DETAIL_METRIC_KEYS = [
  'visitors',
  'search_visitors',
  'search_click_rate',
  'pay_percent',
  'add_percent',
  'goods_like_num_percent',
  'uv_value',
  'avg_stay_time',
  'goods_details_bounce',
  'refund_percent',
] as const;

export type DetailMetricKey = (typeof DETAIL_METRIC_KEYS)[number];

export const DETAIL_METRIC_LABEL_ZH: Record<DetailMetricKey, string> = {
  visitors: '访客数',
  search_visitors: '搜索引导访客数',
  search_click_rate: '搜索点击率',
  pay_percent: '支付转化率',
  add_percent: '加购率',
  goods_like_num_percent: '收藏率',
  uv_value: 'UV 价值',
  avg_stay_time: '平均停留时长',
  goods_details_bounce: '商品详情页跳出率',
  refund_percent: '销售退款率',
};

function isRawMissing(v: string | undefined): boolean {
  return v == null || String(v).trim() === '';
}

function parseNumber(s: string | undefined): number | null {
  if (isRawMissing(s)) return null;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function isRatioStyleKey(key: DetailMetricKey): boolean {
  return (
    key.includes('percent') ||
    key.endsWith('_rate') ||
    key === 'search_click_rate' ||
    key === 'goods_details_bounce'
  );
}

export type DetailMetricCell = {
  key: DetailMetricKey;
  label: string;
  displayValue: string;
  rawMissing: boolean;
  kind: 'percent' | 'number' | 'decimal';
};

export function getDetailMetricCells(row: RawItemMetricRow): DetailMetricCell[] {
  return DETAIL_METRIC_KEYS.map((key) => {
    const raw = row[key];
    const rawMissing = isRawMissing(raw);
    const label = DETAIL_METRIC_LABEL_ZH[key];

    if (rawMissing) {
      return {
        key,
        label,
        displayValue: '—',
        rawMissing: true,
        kind: key === 'visitors' || key === 'search_visitors' ? 'number' : 'percent',
      };
    }

    const n = parseNumber(raw)!;

    if (key === 'visitors' || key === 'search_visitors') {
      return {
        key,
        label,
        displayValue: Math.round(n).toLocaleString('zh-CN'),
        rawMissing: false,
        kind: 'number',
      };
    }

    if (isRatioStyleKey(key)) {
      const pct = Math.abs(n) <= 1 ? n * 100 : n;
      return {
        key,
        label,
        displayValue: `${Number(pct.toFixed(2))}%`,
        rawMissing: false,
        kind: 'percent',
      };
    }

    if (key === 'uv_value') {
      return {
        key,
        label,
        displayValue: Number(n.toFixed(2)).toLocaleString('zh-CN'),
        rawMissing: false,
        kind: 'decimal',
      };
    }

    return {
      key,
      label,
      displayValue: Number(n.toFixed(2)).toLocaleString('zh-CN'),
      rawMissing: false,
      kind: 'decimal',
    };
  });
}

export function listMissingDetailKeys(row: RawItemMetricRow | undefined): DetailMetricKey[] {
  if (!row) return [...DETAIL_METRIC_KEYS];
  return DETAIL_METRIC_KEYS.filter((k) => isRawMissing(row[k]));
}

export function missingDetailLabels(keys: DetailMetricKey[]): string[] {
  return keys.map((k) => DETAIL_METRIC_LABEL_ZH[k] ?? k);
}

export type DiagnosisRiskLevel = 'high' | 'medium' | 'low';

/** Align with adsFactMapper: numeric grade higher => more risk. */
export function diagnosisGradeToLevel(gradeRaw: string | undefined): DiagnosisRiskLevel {
  const n = parseInt(String(gradeRaw ?? '').trim(), 10);
  if (Number.isNaN(n)) return 'low';
  if (n >= 3) return 'high';
  if (n >= 2) return 'medium';
  return 'low';
}

export function riskLevelLabelZh(level: DiagnosisRiskLevel): string {
  if (level === 'high') return '高';
  if (level === 'medium') return '中';
  return '低';
}
