import type {
  DiagnosisPhaseId,
  DeliverableKind,
  DeliverableStatusRow,
  DeliverableUiStatus,
  FlowContextInput,
  PhaseDefinition,
  SopRoleId,
  SopRoute,
} from './diagnosisFlowTypes';

export const PHASE_ORDER: DiagnosisPhaseId[] = [
  'prepare',
  'collect',
  'diagnose',
  'optimize',
  'deliver',
  'review',
];

export const DELIVERABLE_LABEL_ZH: Record<DeliverableKind, string> = {
  data_summary: '数据汇总',
  issue_list: '问题清单',
  diagnosis_conclusion: '诊断结论',
  action_list: '优化动作清单',
  risk_followup_plan: '风险与跟踪计划',
  prd_archive: 'PRD / 归档结果',
};

export const ROLE_LABEL_ZH: Record<SopRoleId, string> = {
  ops_owner: '运营负责人',
  link_ops: '链接运营',
  data_specialist: '数据专员',
  compliance: '合规专员',
  agent: '智能体',
};

export const ROLE_HINT_ZH: Record<SopRoleId, string> = {
  ops_owner: '统筹全流程、审核输出物、协调资源',
  link_ops: '链接基础信息、SKU、优化动作落地',
  data_specialist: '全维度数据采集、异常标注与分析佐证',
  compliance: '标题/主图/详情合规与资质风险',
  agent: '标准化 PRD 生成与文档归档（演示占位）',
};

/** 与《淘天店铺链接诊断全流程》六阶段对齐（前台精简，不含工具路径）。 */
export const DIAGNOSIS_PHASES: PhaseDefinition[] = [
  {
    id: 'prepare',
    name: '诊断准备',
    goal: '明确诊断链接范围、统计窗口与目标，确认分工与数据/合规准备就绪。',
    deliverables: [],
    roles: ['ops_owner', 'data_specialist', 'link_ops', 'compliance', 'agent'],
    nextStepHint: '进入数据采集：拉齐链接维度指标并形成可复核的数据汇总。',
  },
  {
    id: 'collect',
    name: '数据采集',
    goal: '按链接汇总基础、流量、转化等经营数据，标注异常并保留可追溯说明。',
    deliverables: ['data_summary'],
    roles: ['data_specialist', 'link_ops'],
    nextStepHint: '对齐异常点后进入问题诊断，沉淀问题清单与结论。',
  },
  {
    id: 'diagnose',
    name: '问题诊断',
    goal: '基于数据形成可量化问题、优先级与状态判断，结论需有数据支撑。',
    deliverables: ['issue_list', 'diagnosis_conclusion'],
    roles: ['ops_owner', 'data_specialist', 'link_ops', 'compliance'],
    nextStepHint: '制定与问题对应的优化动作、风险应对与跟踪计划。',
  },
  {
    id: 'optimize',
    name: '优化动作',
    goal: '输出可执行、可量化、可验收的动作清单，并完成合规与跟踪节奏约定。',
    deliverables: ['action_list', 'risk_followup_plan'],
    roles: ['ops_owner', 'link_ops', 'data_specialist', 'compliance'],
    nextStepHint: '定稿报告与 PRD 输出包，分发并进入落地与归档。',
  },
  {
    id: 'deliver',
    name: '结果输出',
    goal: '形成诊断报告与标准化输出包（含 PRD），完成团队同步与归档。',
    deliverables: ['prd_archive'],
    roles: ['ops_owner', 'agent'],
    nextStepHint: '按跟踪计划验证效果，进入周期性复盘与复查。',
  },
  {
    id: 'review',
    name: '复盘跟踪',
    goal: '持续跟踪动作执行与指标变化，对照预期复盘并安排复查窗口。',
    deliverables: ['risk_followup_plan'],
    roles: ['ops_owner', 'data_specialist', 'link_ops', 'compliance'],
    nextStepHint: '启动下一轮诊断筹备或迭代优化动作清单。',
  },
];

export function getPhaseById(id: DiagnosisPhaseId): PhaseDefinition | undefined {
  return DIAGNOSIS_PHASES.find((p) => p.id === id);
}

/**
 * 启发式阶段（演示用）；后续可用服务端 `currentPhaseId` 覆盖。
 */
export function inferPhaseForContext(ctx: FlowContextInput): DiagnosisPhaseId {
  switch (ctx.route) {
    case 'approvals':
      return 'optimize';
    case 'execution':
      return 'review';
    case 'replay':
      if (ctx.hasStructuredDiagnosis) return 'diagnose';
      if (ctx.hasMetricsRow) return 'collect';
      return 'prepare';
    case 'detail':
    default:
      if (!ctx.hasGoodsId) return 'prepare';
      if (!ctx.hasMetricsRow) return 'prepare';
      if (!ctx.hasStructuredDiagnosis) return 'collect';
      if (ctx.pendingActionCount > 0) return 'optimize';
      return 'diagnose';
  }
}

/** 阶段在 six-step 中的进度（1–6），用于进度条。 */
export function phaseStepIndex(id: DiagnosisPhaseId): number {
  return PHASE_ORDER.indexOf(id) + 1;
}

export interface DeliverableSignals {
  hasDataSummary: boolean;
  hasIssueList: boolean;
  hasDiagnosisConclusion: boolean;
  hasActionList: boolean;
  hasRiskFollowup: boolean;
  /** MVP：真实 PRD 未接，多为 pending/演示 */
  hasPrdArchive: boolean;
}

function statusFor(
  done: boolean,
  partial: boolean,
): DeliverableUiStatus {
  if (done) return 'done';
  if (partial) return 'partial';
  return 'pending';
}

export function buildDeliverableStatuses(sig: DeliverableSignals): DeliverableStatusRow[] {
  const rows: DeliverableStatusRow[] = [
    {
      kind: 'data_summary',
      label: DELIVERABLE_LABEL_ZH.data_summary,
      status: statusFor(sig.hasDataSummary, false),
      hint: sig.hasDataSummary ? '已从本行指标与诊断快照抽取' : '待数据汇总齐备',
    },
    {
      kind: 'issue_list',
      label: DELIVERABLE_LABEL_ZH.issue_list,
      status: statusFor(sig.hasIssueList, false),
    },
    {
      kind: 'diagnosis_conclusion',
      label: DELIVERABLE_LABEL_ZH.diagnosis_conclusion,
      status: statusFor(sig.hasDiagnosisConclusion, false),
    },
    {
      kind: 'action_list',
      label: DELIVERABLE_LABEL_ZH.action_list,
      status: statusFor(sig.hasActionList, false),
    },
    {
      kind: 'risk_followup_plan',
      label: DELIVERABLE_LABEL_ZH.risk_followup_plan,
      status: statusFor(sig.hasRiskFollowup, false),
      hint: '可结合「数据缺失与影响」与审批风险区',
    },
    {
      kind: 'prd_archive',
      label: DELIVERABLE_LABEL_ZH.prd_archive,
      status: statusFor(sig.hasPrdArchive, false),
      hint: '联调智能体 PRD 后在此标记归档完成',
    },
  ];
  return rows;
}

/** 按路由给出「流程定位」说明（Replay 等页使用）。 */
export function sopRouteNarrative(route: SopRoute): string {
  switch (route) {
    case 'replay':
      return '本页用于审计「数据采集 → 问题诊断」环节的输入与输出，不替代线上诊断引擎。';
    case 'approvals':
      return '当前处于 SOP「优化动作」阶段：对动作清单进行评审与放行。';
    case 'execution':
      return '当前贴近 SOP「结果输出 / 复盘跟踪」：关注落地效果与复查节奏。';
    case 'detail':
    default:
      return '主链路：数据 → 诊断 → 策略 → 动作；下方为淘天链接诊断 SOP 流程骨架，便于分工与验收。';
  }
}
