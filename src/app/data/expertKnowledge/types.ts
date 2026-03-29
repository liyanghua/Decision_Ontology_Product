import type { DiagnosisPhaseId, SopRoleId } from '../sop/diagnosisFlowTypes';

export type SupportType = 'flow' | 'strategy';

/** 策略抽屉分组（用于 UI 聚合，非本体字段） */
export type StrategySnippetBucket =
  | 'hit_build'
  | 'market_keywords'
  | 'visual_positioning'
  | 'listing_creative'
  | 'reading';

export interface SupportSnippet {
  support_id: string;
  support_type: SupportType;
  title: string;
  source_doc: string;
  source_section: string;
  snippet: string;
  relevance_score: number;
  recommended_usage: string;
  linked_problem?: string;
  linked_stage?: DiagnosisPhaseId;
  linked_action?: string;
  strategy_bucket?: StrategySnippetBucket;
}

export interface FlowSupportDeliverableHint {
  label: string;
  hint: string;
}

export interface FlowSupportRoleHint {
  roleId: SopRoleId;
  label: string;
  hint: string;
}

export interface FlowSupportBundle {
  stageKey: DiagnosisPhaseId;
  stageSummary: string;
  deliverableHints: FlowSupportDeliverableHint[];
  roleHints: FlowSupportRoleHint[];
  executionReminders: string[];
  riskChecklist: string[];
  citations: SupportSnippet[];
}

/** 动作级补充：与 stage bundle merge */
export interface FlowSupportActionOverlay {
  executionReminders?: string[];
  riskChecklist?: string[];
  citations?: SupportSnippet[];
  stageSummaryAppend?: string;
}

export const SOURCE_TAO_LINK_DIAGNOSIS_SOP = '《淘天店铺链接诊断全流程》';
export const SOURCE_BAO_KUAN_MARKETING_SOP = '《爆款营销方案 SOP》';

export const KNOWLEDGE_SUPPORT_DISCLAIMER_LINES = [
  '以下为专家知识辅助材料（supporting knowledge），用于解释与建议。',
  '不修改诊断事实与指标结论；诊断真源仍以数据与结构化诊断为准。',
  '非真源资产层内容；当前不参与自动发布与生产写回。',
] as const;
