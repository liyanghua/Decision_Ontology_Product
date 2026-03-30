import type { TaskAction, TaskBadgeTone, TaskStatus } from './taskTypes';

export type TaskStatusPresentation = {
  labelZh: string;
  sublineZh: string;
  tone: TaskBadgeTone;
  badgeClass: string;
  borderClass: string;
  availableActions: TaskAction[];
  nextHintTemplate: string;
  allowTakeover: boolean;
  allowRetry: boolean;
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusPresentation> = {
  draft: {
    labelZh: '待收口',
    sublineZh: '动作还在收口，需先补齐经营目标与落地方向。',
    tone: 'slate',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    borderClass: 'border-slate-200',
    availableActions: ['view_diagnosis', 'archive'],
    nextHintTemplate: '先把「{productName}」这条动作的经营目标、影响范围和打法收完整，再决定是否推进。',
    allowTakeover: false,
    allowRetry: false,
  },
  waiting_input: {
    labelZh: '待补关键信息',
    sublineZh: '推进所需关键信息不全，当前还不能继续往下走。',
    tone: 'amber',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    borderClass: 'border-amber-200',
    availableActions: ['fill_inputs', 'view_diagnosis', 'defer'],
    nextHintTemplate: '回到「{productName}」补齐关键指标、约束和证据包，再继续往下推。',
    allowTakeover: false,
    allowRetry: false,
  },
  diagnosing: {
    labelZh: '诊断梳理中',
    sublineZh: '问题与打法还在梳理，先把诊断结论收口。',
    tone: 'violet',
    badgeClass: 'bg-violet-50 text-violet-900 border-violet-200',
    borderClass: 'border-violet-200',
    availableActions: ['finish_diagnosis', 'view_diagnosis', 'defer'],
    nextHintTemplate: '先完成「{productName}」诊断收口，把问题、根因和打法拉到同一口径。',
    allowTakeover: false,
    allowRetry: false,
  },
  pending_decision: {
    labelZh: '待经营拍板',
    sublineZh: '打法已成型，等经营负责人拍板后再放行。',
    tone: 'orange',
    badgeClass: 'bg-orange-50 text-orange-900 border-orange-200',
    borderClass: 'border-orange-200',
    availableActions: ['submit_approval', 'reject', 'defer', 'view_diagnosis'],
    nextHintTemplate: '请对「{productName}」给出通过、驳回或延后意见，别让队列空等。',
    allowTakeover: false,
    allowRetry: false,
  },
  approved: {
    labelZh: '已放行待落地',
    sublineZh: '经营已放行，等待排入执行窗口。',
    tone: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    borderClass: 'border-emerald-200',
    availableActions: ['go_execute', 'view_diagnosis', 'defer'],
    nextHintTemplate: '把「{productName}」排入本轮执行窗口，并约定回看节点。',
    allowTakeover: false,
    allowRetry: false,
  },
  executing: {
    labelZh: '推进中',
    sublineZh: '任务已进入落地环节，需盯住结果窗口和异常回传。',
    tone: 'blue',
    badgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
    borderClass: 'border-blue-200',
    availableActions: ['go_execute', 'mark_completed', 'view_diagnosis'],
    nextHintTemplate: '继续盯住「{productName}」的关键指标与执行回传，发现异常及时处理。',
    allowTakeover: false,
    allowRetry: false,
  },
  blocked: {
    labelZh: '推进受阻',
    sublineZh: '当前被外部依赖或条件限制卡住，先解堵再续跑。',
    tone: 'rose',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-200',
    borderClass: 'border-rose-200',
    availableActions: ['takeover', 'defer', 'view_diagnosis'],
    nextHintTemplate: '先把「{productName}」这条链路的卡点拆清，再判断是否需要人工接手。',
    allowTakeover: true,
    allowRetry: false,
  },
  failed: {
    labelZh: '结果未达预期',
    sublineZh: '这次推进没跑通，需要复盘原因再决定重试或接手。',
    tone: 'red',
    badgeClass: 'bg-red-50 text-red-900 border-red-200',
    borderClass: 'border-red-200',
    availableActions: ['retry', 'takeover', 'view_diagnosis'],
    nextHintTemplate: '先复盘「{productName}」这次为什么没跑通，再决定重试还是转人工接手。',
    allowTakeover: true,
    allowRetry: true,
  },
  needs_takeover: {
    labelZh: '需要你接手',
    sublineZh: '自动推进先停在这里，需要人工接手定损和续跑。',
    tone: 'rose',
    badgeClass: 'bg-rose-50 text-rose-950 border-rose-300',
    borderClass: 'border-rose-300',
    availableActions: ['go_execute', 'mark_completed', 'archive', 'view_diagnosis'],
    nextHintTemplate: '由人工接手「{productName}」后，决定是回到执行还是重新拍板。',
    allowTakeover: true,
    allowRetry: true,
  },
  completed: {
    labelZh: '已闭环待复盘',
    sublineZh: '这一轮已经闭环，可整理结果并准备复盘。',
    tone: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-200',
    availableActions: ['view_diagnosis', 'archive'],
    nextHintTemplate: '把「{productName}」这轮结果沉淀下来，再安排下一轮推进。',
    allowTakeover: false,
    allowRetry: false,
  },
  archived: {
    labelZh: '已收档',
    sublineZh: '本轮不再继续，占位收档，不再消耗推进资源。',
    tone: 'slate',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    borderClass: 'border-slate-200',
    availableActions: ['view_diagnosis'],
    nextHintTemplate: '如果要重启「{productName}」，建议从诊断重新生成这轮动作。',
    allowTakeover: false,
    allowRetry: false,
  },
};

export function formatNextHint(template: string, productName: string): string {
  return template.replace(/\{productName\}/g, productName || '该商品');
}

export function getTaskActionLabel(action: TaskAction, status?: TaskStatus): string {
  if (action === 'fill_inputs') return '信息已补齐';
  if (action === 'finish_diagnosis') return '诊断已收口';
  if (action === 'submit_approval') return '批准';
  if (action === 'reject') return '驳回';
  if (action === 'defer') return '暂缓处理';
  if (action === 'go_execute') return '去推进';
  if (action === 'retry') return '重新执行';
  if (action === 'takeover') return '人工处理';
  if (action === 'mark_completed') return '处理完成';
  if (action === 'archive') return status === 'needs_takeover' ? '本轮收档' : '归档';
  return '看诊断里的打法';
}
