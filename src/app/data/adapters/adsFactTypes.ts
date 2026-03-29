import type { Product, Evidence, RootCause, Strategy, Action } from '../mockData';
import type { DiagnosisContentStructured } from './diagnosisContentParse';

export type { DiagnosisContentStructured } from './diagnosisContentParse';

/** One raw row from ads_fact_item_summary_d CSV; values are unparsed strings from PapaParse. */
export type RawItemMetricRow = Record<string, string | undefined>;

/** Card / list VM: maps to legacy Product after mapper. */
export interface ProductCardVM {
  goodsId: string;
  statistDate: string;
  displayName: string;
  /** Placeholder until product master data API. */
  category: string;
  brand: string;
  sku: string;
  priority: number;
  riskLevel: Product['riskLevel'];
  problemCount: number;
  actionCount: number;
  metrics: Product['metrics'];
  issues: string[];
  rootCauseLabels: string[];
  strategyLabels: string[];
}

/** Full diagnosis for a single (goods_id, statist_date) slice. */
export interface ProductDiagnosisSummaryVM {
  goodsId: string;
  statistDate: string;
  dataLoadTime: string;
  diagnosisGrade: string;
  structured: DiagnosisContentStructured;
  rawRow: RawItemMetricRow;
  legacyProduct: Product;
  evidencePack: EvidencePackVM;
  rootCauses: RootCause[];
  strategies: Strategy[];
  actions: Action[];
}

/** Structured evidence derived from numeric columns (plus optional narrative). */
export interface EvidencePackVM {
  goodsId: string;
  statistDate: string;
  evidences: Evidence[];
}
