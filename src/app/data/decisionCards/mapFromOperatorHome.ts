import type {
  InProgressTaskVM,
  OpportunityRiskCardVM,
  SuggestedActionVM,
  TodaySpotlightItem,
} from '../operatorHome/operatorHomeData';
import type { DecisionCard, DecisionPriority } from './decisionCardTypes';

function priorityFromUrgency(u?: 'high' | 'medium' | 'low'): DecisionPriority {
  if (u === 'high') return 'P1';
  if (u === 'medium') return 'P2';
  if (u === 'low') return 'P3';
  return 'unset';
}

function priorityFromHint(hint?: string): DecisionPriority {
  if (hint === '高') return 'P1';
  if (hint === '中') return 'P2';
  if (hint === '低') return 'P3';
  return 'unset';
}

export function opportunityRiskVmToDecisionCard(vm: OpportunityRiskCardVM): DecisionCard {
  const isRisk = vm.kind === 'risk';
  return {
    card_id: `home-lead-${vm.id}`,
    card_type: isRisk ? 'RiskCard' : 'OpportunityCard',
    object_id: vm.primaryObject.object_id,
    object_type: vm.primaryObject.object_type,
    title: vm.title,
    summary: vm.description.length > 160 ? `${vm.description.slice(0, 160)}…` : vm.description,
    why_now:
      vm.impactHint.trim() ||
      (isRisk ? '风险信号已入库，需优先核对影响面与止损窗口。' : '机会窗口与队列信号对齐，便于落地最短路径。'),
    current_status: vm.primaryObject.current_status ?? (isRisk ? '风险待处置' : '机会待跟进'),
    risk_level: vm.primaryObject.risk_level ?? (isRisk ? 'high' : undefined),
    priority: priorityFromUrgency(vm.urgency),
    recommended_action:
      vm.suggestedActionShort ??
      (isRisk ? '进诊断核对关键风险，按推荐打法止损并安排复盘' : '进商品诊断落实机会抓手与推荐打法'),
    owner: '李明',
    linked_memory: [vm.primaryObject.current_goal, vm.primaryObject.next_action].filter(
      Boolean,
    ) as string[],
    linked_asset: vm.productId,
    href: vm.href,
  };
}

export function inProgressVmToDecisionCard(vm: InProgressTaskVM): DecisionCard {
  const isDone = vm.task.status === 'completed';
  const isPending = vm.task.status === 'pending_decision';
  const isPrestage =
    vm.task.status === 'waiting_input' || vm.task.status === 'diagnosing';
  return {
    card_id: `home-task-${vm.id}`,
    card_type: isDone ? 'ReviewCard' : 'ActionCard',
    object_id: vm.primaryObject.object_id,
    object_type: vm.primaryObject.object_type,
    title: vm.title,
    summary: vm.context,
    why_now: isPrestage
      ? '前置准备没收口，后面的拍板和执行都会被拖慢，建议先把这一步补齐。'
      : isPending
        ? '待审批动作卡住闭环，需尽快确认或驳回以免队列积压。'
        : isDone
          ? '已完成动作可进行结果核对与下一周期排期。'
          : '执行中任务需对齐指标窗口与资源投入。',
    current_status: vm.task.statusLabel,
    risk_level: vm.primaryObject.risk_level,
    priority: isPrestage || isPending ? 'P1' : isDone ? 'P3' : 'P2',
    recommended_action:
      vm.primaryObject.next_action?.trim() && vm.primaryObject.next_action !== vm.title
        ? vm.primaryObject.next_action
        : isPrestage
          ? `去推进：${vm.title}`
          : isPending
            ? '去审批：确认或调整后推进落地'
            : `去推进：${vm.title}`,
    owner: vm.task.ownerLabel,
    linked_memory: vm.primaryObject.current_goal ? [vm.primaryObject.current_goal] : undefined,
    linked_asset: vm.productId,
    href: vm.hrefPrimary,
  };
}

export function suggestedVmToDecisionCard(vm: SuggestedActionVM): DecisionCard {
  return {
    card_id: `home-suggest-${vm.id}`,
    card_type: 'ActionCard',
    object_id: vm.primaryObject.object_id,
    object_type: vm.primaryObject.object_type,
    title: vm.title,
    summary: vm.detail?.trim()
      ? vm.detail.length > 140
        ? `${vm.detail.slice(0, 140)}…`
        : vm.detail
      : '系统生成的待审优化动作。',
    why_now: '建议动作与当前诊断结论绑定，早审早落地有利于抓住指标窗口。',
    current_status: vm.task.statusLabel,
    risk_level: vm.primaryObject.risk_level,
    priority: priorityFromHint(vm.priorityHint),
    recommended_action:
      vm.primaryObject.next_action?.trim() && vm.primaryObject.next_action !== vm.title
        ? vm.primaryObject.next_action
        : '看诊断里的打法，再去审批推进',
    owner: vm.task.ownerLabel,
    linked_memory: vm.primaryObject.current_goal ? [vm.primaryObject.current_goal] : undefined,
    linked_asset: vm.productId,
    href: vm.processHref,
  };
}

export function spotlightToDecisionCard(s: TodaySpotlightItem): DecisionCard {
  const o = s.object;
  return {
    card_id: `home-spot-${o.object_id}`,
    card_type: 'DiagnosisCard',
    object_id: o.object_id,
    object_type: o.object_type,
    title: `${o.object_name} · 队列优先跟进`,
    summary: s.tagline.length > 120 ? `${s.tagline.slice(0, 120)}…` : s.tagline,
    why_now: '按优先级与风险加权排序，今日应首先消化该对象盘面。',
    current_status: o.current_status ?? '待核对',
    risk_level: o.risk_level,
    priority: o.risk_level === 'high' ? 'P1' : o.risk_level === 'medium' ? 'P2' : 'P3',
    recommended_action: o.next_action ?? '进单链诊断核对指标与推荐打法',
    owner: '李明',
    linked_memory: o.current_goal ? [o.current_goal] : undefined,
    linked_asset: o.object_id,
    href: s.href,
  };
}
