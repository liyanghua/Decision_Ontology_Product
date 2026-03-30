import type { OperatorTaskPhase } from './operatorTaskPhase';

export type TaskFlowCta =
  | 'submit_approval'
  | 'reject'
  | 'defer'
  | 'go_execute'
  | 'retry'
  | 'takeover'
  | 'view_diagnosis'
  | 'archive';

export type PresentationTone =
  | 'slate'
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'orange'
  | 'red';

export type PhasePresentation = {
  labelZh: string;
  sublineZh: string;
  tone: PresentationTone;
  /** Badge / 高亮：Tailwind 类名 */
  badgeClass: string;
  borderClass: string;
  ctas: TaskFlowCta[];
  /** 可用 `{productName}` 占位 */
  nextHintTemplate: string;
};

export const OPERATOR_TASK_PRESENTATION: Record<OperatorTaskPhase, PhasePresentation> = {
  draft: {
    labelZh: '草稿',
    sublineZh: '动作尚未收口为可审批条目，需补全经营口径与标的。',
    tone: 'slate',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    borderClass: 'border-slate-200',
    ctas: ['view_diagnosis', 'archive'],
    nextHintTemplate: '在「{productName}」诊断中补充动因与预期，再提交审批。',
  },
  waiting_input: {
    labelZh: '待补信息',
    sublineZh: '关键字段或证据不足，无法进入审批队列。',
    tone: 'amber',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    borderClass: 'border-amber-200',
    ctas: ['view_diagnosis', 'defer'],
    nextHintTemplate: '回到商品诊断补齐指标与约束，再推进「{productName}」。',
  },
  diagnosing: {
    labelZh: '诊断梳理中',
    sublineZh: '结构化结论尚未定稿，动作与公司口径仍在对齐。',
    tone: 'violet',
    badgeClass: 'bg-violet-50 text-violet-900 border-violet-200',
    borderClass: 'border-violet-200',
    ctas: ['view_diagnosis', 'defer'],
    nextHintTemplate: '待诊断定稿后，系统将把推荐动作挂到「{productName}」队列。',
  },
  pending_decision: {
    labelZh: '待经营决策',
    sublineZh: '已入审批队列，等待放行或调整，以免执行侧空转。',
    tone: 'orange',
    badgeClass: 'bg-orange-50 text-orange-900 border-orange-200',
    borderClass: 'border-orange-200',
    ctas: ['submit_approval', 'reject', 'defer', 'view_diagnosis'],
    nextHintTemplate: '请对「{productName}」相关动作给出明确通过或驳回，并注明经营考量。',
  },
  approved: {
    labelZh: '已批准 · 待落地',
    sublineZh: '决策已确认，尚未进入执行流水或执行尚未启动。',
    tone: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    borderClass: 'border-emerald-200',
    ctas: ['go_execute', 'view_diagnosis', 'defer'],
    nextHintTemplate: '将「{productName}」动作排入执行窗口，并约定复盘节奏。',
  },
  executing: {
    labelZh: '执行中',
    sublineZh: '改动已在落地，请关注指标窗口与异常回传。',
    tone: 'blue',
    badgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
    borderClass: 'border-blue-200',
    ctas: ['go_execute', 'view_diagnosis'],
    nextHintTemplate: '持续跟踪「{productName}」核心指标，必要时登记异常与复盘。',
  },
  blocked: {
    labelZh: '推进受阻',
    sublineZh: '外部依赖或平台规则导致暂时无法继续，需要先解除阻塞。',
    tone: 'rose',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-200',
    borderClass: 'border-rose-200',
    ctas: ['takeover', 'defer', 'view_diagnosis'],
    nextHintTemplate: '厘清阻塞原因并升级对接人，再决定是否人工接管「{productName}」。',
  },
  failed: {
    labelZh: '未达预期 · 可恢复',
    sublineZh: '执行或校验未通过，可在评估后重试或升级人工处理。',
    tone: 'red',
    badgeClass: 'bg-red-50 text-red-900 border-red-200',
    borderClass: 'border-red-200',
    ctas: ['retry', 'takeover', 'view_diagnosis'],
    nextHintTemplate: '复盘失败原因后，选择重试一次或转为人工接管「{productName}」链路。',
  },
  needs_takeover: {
    labelZh: '需人工接管',
    sublineZh: '自动化路径已暂停，需操盘同事介入定损与续跑策略。',
    tone: 'rose',
    badgeClass: 'bg-rose-50 text-rose-950 border-rose-300',
    borderClass: 'border-rose-300',
    ctas: ['takeover', 'go_execute', 'view_diagnosis'],
    nextHintTemplate: '由接盘同事接管后，可转审批或改参数再执行「{productName}」。',
  },
  completed: {
    labelZh: '已闭环',
    sublineZh: '本动作已完成并与结果对齐，可进入复盘或归档。',
    tone: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-200',
    ctas: ['view_diagnosis', 'archive'],
    nextHintTemplate: '将「{productName}」效果沉淀进周报或案例库，排期下一周期动作。',
  },
  archived: {
    labelZh: '已归档 / 不再推进',
    sublineZh: '动作被驳回或策略下线，不再占用执行资源。',
    tone: 'slate',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    borderClass: 'border-slate-200',
    ctas: ['view_diagnosis'],
    nextHintTemplate: '若需重启「{productName}」链路，请从诊断重新生成动作。',
  },
};

export function formatNextHint(template: string, productName: string): string {
  return template.replace(/\{productName\}/g, productName || '该商品');
}
