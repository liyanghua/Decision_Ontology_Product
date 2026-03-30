import type { HighValueLead, Product } from '../mockData';

export type OperatorObjectType = 'shop' | 'category' | 'product' | 'campaign' | 'channel';

export interface OperatorObjectSummary {
  object_id: string;
  object_type: OperatorObjectType;
  object_name: string;
  current_goal?: string;
  current_status?: string;
  risk_level?: 'high' | 'medium' | 'low';
  next_action?: string;
}

/** 商品经营对象摘要（绑定 liveCatalog Product） */
export function summarizeProduct(
  p: Product,
  opts?: { current_status?: string; next_action?: string; goal?: string },
): OperatorObjectSummary {
  const tier = p.priorityLevel ? `队列 ${p.priorityLevel}` : undefined;
  const goal =
    opts?.goal ??
    (p.diagnosisBrief?.trim()
      ? p.diagnosisBrief.slice(0, 120)
      : tier ?? (p.category ? `类目：${p.category}` : undefined));
  return {
    object_id: p.id,
    object_type: 'product',
    object_name: p.name,
    current_goal: goal,
    current_status: opts?.current_status,
    risk_level: p.riskLevel,
    next_action: opts?.next_action,
  };
}

/** 无商品 ID 时以「类目/主题」占位，不伪造商品 */
export function summarizeLeadWithoutProduct(lead: HighValueLead): OperatorObjectSummary {
  const rk =
    lead.urgency === 'high' ? 'high' : lead.urgency === 'medium' ? 'medium' : 'low';
  return {
    object_id: lead.id,
    object_type: 'category',
    object_name: lead.title.length > 36 ? `${lead.title.slice(0, 36)}…` : lead.title,
    current_goal: lead.description?.slice(0, 100),
    current_status: lead.type === 'risk' ? '风险待跟进' : '机会待评估',
    risk_level: rk,
    next_action: lead.impact?.slice(0, 80),
  };
}

/** 深链带上来源，详情页可展示轻提示 */
export function appendFromHome(href: string): string {
  const t = href.trim();
  if (!t) return t;
  return t.includes('?') ? `${t}&from=home` : `${t}?from=home`;
}
