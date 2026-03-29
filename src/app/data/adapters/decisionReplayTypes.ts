import type { DiagnosisContentStructured } from './diagnosisContentParse';

/** Offline snapshot replay only; future HTTP runs may extend union. */
export type DecisionReplaySource = 'ads_fact_csv_replay';

/** Input snapshot for one diagnosis execution (audit trail). */
export interface DecisionRequest {
  schemaVersion?: string;
  goodsId: string;
  statistDate: string;
  dataLoadTime?: string;
  /** Raw CSV cell strings for selected metric columns. */
  keyMetrics: Record<string, string>;
}

/** Single persisted run: input + model output fields. */
export interface DecisionRun {
  id: string;
  request: DecisionRequest;
  diagnosisGrade: string;
  /** Exact cell from `diagnosis_content_json`. */
  diagnosisContentRawJson: string;
  structured: DiagnosisContentStructured;
  source: DecisionReplaySource;
  /** Best-effort timestamp from row (data_load_time or statist_date). */
  recordedAt: string;
}

/**
 * Wrapper for ontology / explainability evolution without breaking UI contracts.
 */
export interface DecisionObject {
  schemaVersion: '0.1';
  run: DecisionRun;
  lineage?: string;
  explainabilityRef?: string;
}
