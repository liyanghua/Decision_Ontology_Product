import type { OperatorObjectType } from '../operatorHome/operatorObjectSummary';

/** 决策卡类型（与产品口径对齐的六类） */
export type DecisionCardType =
  | 'OpportunityCard'
  | 'RiskCard'
  | 'DiagnosisCard'
  | 'StrategyCard'
  | 'ActionCard'
  | 'ReviewCard';

export type DecisionPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'unset';

/** 统一经营决策卡：可行动的盘面对象，而非纯信息提示 */
export interface DecisionCard {
  card_id: string;
  card_type: DecisionCardType;
  object_id: string;
  object_type: OperatorObjectType;
  title: string;
  summary: string;
  why_now: string;
  current_status: string;
  risk_level?: 'high' | 'medium' | 'low';
  priority: DecisionPriority;
  recommended_action: string;
  owner?: string;
  linked_memory?: string[];
  linked_asset?: string;
  href: string;
}
