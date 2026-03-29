import type { DiagnosisPhaseId } from '../sop/diagnosisFlowTypes';
import type { FlowSupportBundle } from './types';
import type { SupportSnippet } from './types';

export type KnowledgePageId =
  | 'product_detail'
  | 'action_approval'
  | 'replay_explain'
  | 'today_command'
  | 'product_action_board'
  | 'execution';

export type TodaySignalType = 'opportunity' | 'risk' | 'critical' | 'neutral';

export interface KnowledgeContextInput {
  page: KnowledgePageId;
  goodsId?: string;
  /** 商品类目（原始文案，如「床上四件套」） */
  category?: string;
  problemKey?: string;
  rootCauseKey?: string;
  strategyKey?: string;
  actionKey?: string;
  stageKey?: DiagnosisPhaseId;
  riskKey?: 'low' | 'medium' | 'high';
  signalType?: TodaySignalType;
  themeKey?: string;
  /** Replay 是否处于对比两版诊断输出的语境 */
  versionDiff?: boolean;
}

export interface ResolvedKnowledgeSupport {
  flowBundle: FlowSupportBundle;
  strategySnippets: SupportSnippet[];
}
