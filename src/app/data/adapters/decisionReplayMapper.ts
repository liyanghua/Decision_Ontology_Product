import type { ProductCatalogService } from '../productCatalogService';
import type { RawItemMetricRow } from './adsFactTypes';
import { getStructuredDiagnosis } from './diagnosisContentParse';
import { DETAIL_METRIC_KEYS } from './detailViewMetrics';
import type { DecisionObject, DecisionRequest, DecisionRun } from './decisionReplayTypes';

const EXTRA_SNAPSHOT_KEYS = ['diagnosis_grade'] as const;

export function buildDecisionRequestFromRow(row: RawItemMetricRow): DecisionRequest {
  const goodsId = String(row.goods_id ?? '').trim();
  const statistDate = String(row.statist_date ?? '').trim();
  const dataLoadTime = String(row.data_load_time ?? '').trim() || undefined;

  const keyMetrics: Record<string, string> = {};
  for (const k of DETAIL_METRIC_KEYS) {
    const v = row[k];
    keyMetrics[k] = v != null && String(v).trim() !== '' ? String(v) : '';
  }
  for (const k of EXTRA_SNAPSHOT_KEYS) {
    const v = row[k];
    keyMetrics[k] = v != null && String(v).trim() !== '' ? String(v) : '';
  }

  return {
    schemaVersion: '0.1',
    goodsId,
    statistDate,
    dataLoadTime,
    keyMetrics,
  };
}

export function buildDecisionRunFromRow(row: RawItemMetricRow): DecisionRun {
  const request = buildDecisionRequestFromRow(row);
  const statistDate = request.statistDate;
  const goodsId = request.goodsId;
  const id = goodsId && statistDate ? `${goodsId}@${statistDate}` : `${goodsId}@unknown`;
  const rawJson = String(row.diagnosis_content_json ?? '');
  const structured = getStructuredDiagnosis(row);
  const grade = String(row.diagnosis_grade ?? '').trim();
  const recordedAt =
    request.dataLoadTime && request.dataLoadTime.trim() !== ''
      ? request.dataLoadTime
      : statistDate || '—';

  return {
    id,
    request,
    diagnosisGrade: grade,
    diagnosisContentRawJson: rawJson,
    structured,
    source: 'ads_fact_csv_replay',
    recordedAt,
  };
}

export function buildDecisionObjectFromRow(row: RawItemMetricRow): DecisionObject {
  return {
    schemaVersion: '0.1',
    run: buildDecisionRunFromRow(row),
  };
}

/** Resolve one replay object using the same row picking as `getProductDiagnosis`. */
export function getDecisionObjectForReplay(
  catalog: ProductCatalogService,
  goodsId: string,
  statistDate?: string,
): DecisionObject | undefined {
  const vm = catalog.getProductDiagnosis(goodsId, statistDate);
  if (!vm?.rawRow) return undefined;
  return buildDecisionObjectFromRow(vm.rawRow);
}
