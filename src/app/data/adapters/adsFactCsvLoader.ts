import Papa from 'papaparse';
import { validateCsvHeaders } from './adsFactSchema';
import type { RawItemMetricRow } from './adsFactTypes';

export function loadRawRowsFromText(csvText: string): RawItemMetricRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors?.length) {
    console.warn('[ads_fact] PapaParse errors:', parsed.errors.slice(0, 3));
  }

  if (parsed.meta.fields?.length) {
    validateCsvHeaders(parsed.meta.fields);
  }

  const rows: RawItemMetricRow[] = [];
  for (const r of parsed.data) {
    if (!r || typeof r !== 'object') continue;
    const goodsId = r.goods_id?.trim?.() ?? String(r.goods_id ?? '').trim();
    if (!goodsId) continue;
    rows.push(r as RawItemMetricRow);
  }
  return rows;
}
