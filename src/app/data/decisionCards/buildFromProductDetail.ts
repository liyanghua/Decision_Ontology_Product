import type { RootCause, Strategy } from '../mockData';
import type { ImprovementActionCardVM } from '../adapters/improvementActionParse';
import { appendFromHome } from '../operatorHome/operatorObjectSummary';
import type { DecisionCard } from './decisionCardTypes';

const OT = 'product' as const;

function clip(s: string, n: number): string {
  const t = s.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
}

/** 核心结论/结构化要点 -> 诊断决策卡 */
export function linesToDiagnosisCards(
  productId: string,
  productName: string,
  lines: string[],
  prefix: string,
  riskLevel: 'high' | 'medium' | 'low',
): DecisionCard[] {
  return lines.map((line, i) => ({
    card_id: `detail-${prefix}-${productId}-${i}`,
    card_type: 'DiagnosisCard' as const,
    object_id: productId,
    object_type: OT,
    title: `${prefix} · ${i + 1}`,
    summary: clip(line, 120),
    why_now: '与当前统计日诊断绑定，影响本周经营决策优先级。',
    current_status: '待对照证据与动作队列',
    risk_level: riskLevel,
    priority: i === 0 ? ('P1' as const) : ('P2' as const),
    recommended_action: '进入下方证据/动作区完成验证与派单',
    owner: '李明',
    linked_memory: [productName],
    linked_asset: productId,
    href: appendFromHome(`/products/${productId}`),
  }));
}

/** 增长分析要点 -> 机会决策卡 */
export function linesToOpportunityCards(
  productId: string,
  productName: string,
  lines: string[],
): DecisionCard[] {
  return lines.map((line, i) => ({
    card_id: `detail-growth-${productId}-${i}`,
    card_type: 'OpportunityCard' as const,
    object_id: productId,
    object_type: OT,
    title: `增长机会 · ${i + 1}`,
    summary: clip(line, 120),
    why_now: '增长面信号与类目/流量窗口相关，适合与投放节奏同步推进。',
    current_status: '待评估抓手',
    risk_level: 'low',
    priority: ('P2' as const),
    recommended_action: '结合策略卡与动作审批排入本周实验或加投',
    owner: '李明',
    linked_memory: [productName],
    linked_asset: productId,
    href: appendFromHome(`/products/${productId}`),
  }));
}

export function improvementVmToActionCards(
  productId: string,
  productName: string,
  cards: ImprovementActionCardVM[],
): DecisionCard[] {
  return cards.map((c, i) => ({
    card_id: `detail-improve-${productId}-${i}`,
    card_type: 'ActionCard' as const,
    object_id: productId,
    object_type: OT,
    title: c.title.trim() || `改进动作 ${i + 1}`,
    summary: [c.expectedMetric, c.targetLift].filter(Boolean).join(' · ') || '可执行优化项',
    why_now: '改进建议已结构化，适合直接进入审批与执行闭环。',
    current_status: '待审批/执行',
    risk_level: 'medium',
    priority: ('P1' as const),
    recommended_action: c.validationNote?.trim()
      ? clip(c.validationNote, 100)
      : '在动作区发起或关联对应审批单',
    owner: '李明',
    linked_memory: [productName],
    linked_asset: productId,
    href: appendFromHome(`/products/${productId}?focus=actions`),
  }));
}

export function strategyToDecisionCards(
  productId: string,
  productName: string,
  strategies: Strategy[],
  causes: RootCause[],
): DecisionCard[] {
  return strategies.map((s) => {
    const rcNames = s.targetRootCause
      .map((id) => causes.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join('、');
    const actionLine =
      s.actions?.length > 0
        ? clip(s.actions.slice(0, 3).join('；') + (s.actions.length > 3 ? '…' : ''), 100)
        : '';
    return {
      card_id: `detail-strat-${productId}-${s.id}`,
      card_type: 'StrategyCard' as const,
      object_id: productId,
      object_type: OT,
      title: s.name,
      summary: [clip(s.expectedImpact, 100), actionLine].filter(Boolean).join(' · ') || '策略待拆解',
      why_now: '策略卡连接根因与预期影响，是动作拆分的上游依据。',
      current_status: `优先级 ${s.priority} · 待拆解动作`,
      risk_level: 'medium' as const,
      priority:
        s.priority <= 1 ? ('P1' as const) : s.priority === 2 ? ('P2' as const) : ('P3' as const),
      recommended_action: rcNames
        ? `对齐根因：${clip(rcNames, 72)}${actionLine ? ` · ${actionLine}` : ''}`
        : `对齐证据包后拆解为可审批动作${actionLine ? ` · ${actionLine}` : ''}`,
      owner: '李明',
      linked_memory: [productName],
      linked_asset: productId,
      href: appendFromHome(`/products/${productId}?focus=actions`),
    };
  });
}

export function causeToDiagnosisCards(
  productId: string,
  productName: string,
  causes: RootCause[],
): DecisionCard[] {
  return causes.map((cause, index) => ({
    card_id: `detail-cause-${productId}-${cause.id}`,
    card_type: 'DiagnosisCard' as const,
    object_id: productId,
    object_type: OT,
    title: cause.name,
    summary: clip(cause.description, 120),
    why_now: `置信度 ${(cause.confidence * 100).toFixed(0)}% · 影响度 ${(cause.impact * 100).toFixed(0)}%，优先处理高置信根因。`,
    current_status: index === 0 ? '主因候选' : '次因候选',
    risk_level: index === 0 ? ('high' as const) : ('medium' as const),
    priority: index === 0 ? ('P1' as const) : ('P2' as const),
    recommended_action: '查看根因解释并映射到策略/动作',
    owner: '李明',
    linked_memory: [productName, cause.id],
    linked_asset: productId,
    href: appendFromHome(`/products/${productId}`),
  }));
}

export function displayIssueToDiagnosisCards(productId: string, productName: string, issues: string[]): DecisionCard[] {
  return issues.map((issue, i) => ({
    card_id: `detail-issue-${productId}-${i}`,
    card_type: 'DiagnosisCard' as const,
    object_id: productId,
    object_type: OT,
    title: `当前问题 · ${i + 1}`,
    summary: clip(issue, 120),
    why_now: '问题清单来自证据包与结构化诊断，是今日操盘的首要输入。',
    current_status: '待验证与分派',
    risk_level: ('high' as const),
    priority: i === 0 ? ('P1' as const) : ('P2' as const),
    recommended_action: '进入根因与策略区完成归因与拆单',
    owner: '李明',
    linked_memory: [productName],
    linked_asset: productId,
    href: appendFromHome(`/products/${productId}`),
  }));
}

/** 数据缺失要点 -> 风险决策卡 */
export function missingDataToRiskCards(productId: string, productName: string, lines: string[]): DecisionCard[] {
  return lines.map((line, i) => ({
    card_id: `detail-miss-${productId}-${i}`,
    card_type: 'RiskCard' as const,
    object_id: productId,
    object_type: OT,
    title: `数据完整性 · ${i + 1}`,
    summary: clip(line, 120),
    why_now: '缺失字段会稀释诊断置信度，需在决策前明确影响面。',
    current_status: '待补齐或标注假设',
    risk_level: ('medium' as const),
    priority: ('P2' as const),
    recommended_action: '与数据域确认采集排期或下限假设',
    owner: '李明',
    linked_memory: [productName],
    linked_asset: productId,
    href: appendFromHome(`/products/${productId}`),
  }));
}
