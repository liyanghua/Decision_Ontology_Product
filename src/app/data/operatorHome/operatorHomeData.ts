/**
 * 经营搭档首页数据层：默认由 liveCatalog 驱动，后续可整体替换为 HTTP 实现，保持函数签名与 VM 类型不变。
 */
import type { Product } from '../mockData';
import {
  listProducts,
  actions,
  highValueLeads,
  todayFocusProducts,
  goalSummary,
} from '../liveCatalog';
import {
  appendFromHome,
  summarizeLeadWithoutProduct,
  summarizeProduct,
  type OperatorObjectSummary,
} from './operatorObjectSummary';

export type { OperatorObjectSummary, OperatorObjectType } from './operatorObjectSummary';

export type TodaySpotlightItem = {
  object: OperatorObjectSummary;
  href: string;
  tagline: string;
};

export type TodaySummaryVM = {
  period: string;
  targetGmvLabel: string;
  currentGmvLabel: string;
  progressPct: number;
  headline: string;
  subline: string;
  opportunityCount: number;
  riskCount: number;
  /** 今日优先跟进的经营对象（以商品为主） */
  spotlights: TodaySpotlightItem[];
};

export type OpportunityRiskCardVM = {
  id: string;
  kind: 'opportunity' | 'risk';
  title: string;
  description: string;
  impactHint: string;
  urgency?: 'high' | 'medium' | 'low';
  productId?: string;
  href: string;
  primaryObject: OperatorObjectSummary;
  suggestedActionShort?: string;
};

export type QuickTaskVM = {
  id: string;
  label: string;
  description: string;
  href: string;
  iconKey?:
    | 'products'
    | 'today'
    | 'approvals'
    | 'execution'
    | 'replay'
    | 'diagnosis'
    | 'opportunity'
    | 'replayActivity'
    | 'contentTraffic';
};

export type InProgressTaskStatus = 'in_progress' | 'pending_confirm' | 'completed';

export type InProgressTaskVM = {
  id: string;
  title: string;
  context: string;
  status: InProgressTaskStatus;
  statusLabel: string;
  hrefPrimary: string;
  productId?: string;
  actionId?: string;
  primaryObject: OperatorObjectSummary;
};

export type MemoryProfileVM = {
  shopName: string;
  categoryFocus: string;
  monthlyGoal: string;
  queueNote?: string;
};

export type SuggestedActionVM = {
  id: string;
  title: string;
  detail?: string;
  priorityHint?: string;
  productId: string;
  actionId?: string;
  detailHref: string;
  processHref: string;
  primaryObject: OperatorObjectSummary;
};

export type OperatorHomeDemoModel = {
  userName: string;
  heroTagline: string;
  taskPromptExamples: string[];
  summary: TodaySummaryVM;
  opportunityRiskCards: OpportunityRiskCardVM[];
  quickTasks: QuickTaskVM[];
  inProgressTasks: InProgressTaskVM[];
  memory: MemoryProfileVM;
  suggestedActions: SuggestedActionVM[];
};

export type OperatorHomeModelResult = {
  model: OperatorHomeDemoModel;
  isEmpty: boolean;
};

function formatWan(n: number): string {
  return `¥${(n / 10000).toFixed(n >= 100_000 ? 0 : 1)}万`;
}

function productProblemCount(p: { problemCount?: number; issues?: string[] }): number {
  if (typeof p.problemCount === 'number' && p.problemCount > 0) return p.problemCount;
  return p.issues?.length ?? 0;
}

function spotlightScore(p: Product): number {
  const riskPts = p.riskLevel === 'high' ? 40 : p.riskLevel === 'medium' ? 15 : 0;
  const prob = productProblemCount(p);
  return p.priority + riskPts + prob * 3;
}

function productMap(): Map<string, Product> {
  return new Map(listProducts().map((p) => [p.id, p]));
}

/** 顶区问候与一句话任务示例（日后可接用户/租户配置） */
export function getOperatorHomeShell(): Pick<
  OperatorHomeDemoModel,
  'userName' | 'heroTagline' | 'taskPromptExamples'
> {
  return {
    userName: '李明',
    heroTagline:
      '先盯今日重点与关键风险，再按推荐打法去推进；落地后到执行里看进度，回放里看结果，最后形成经验。',
    taskPromptExamples: [
      '今天最该先处理哪几个链接',
      '最近有哪些高风险要优先止损',
      '机会款的推荐打法是什么',
    ],
  };
}

export function getOperatorHomeEmpty(): boolean {
  return listProducts().length === 0;
}

export function getTodaySummary(): TodaySummaryVM {
  const plist = listProducts();
  const g = goalSummary;
  const opps = highValueLeads.filter((l) => l.type === 'opportunity');
  const risks = highValueLeads.filter((l) => l.type === 'risk');
  const problemSkuCount = plist.filter((p) => productProblemCount(p) > 0).length;

  const pendingProductIds = new Set(
    actions.filter((a) => a.status === 'pending').map((a) => a.productId),
  );
  const sorted = [...plist].sort((a, b) => {
    const aw = pendingProductIds.has(a.id) ? 1 : 0;
    const bw = pendingProductIds.has(b.id) ? 1 : 0;
    if (bw !== aw) return bw - aw;
    return spotlightScore(b) - spotlightScore(a);
  });
  const spotlights: TodaySpotlightItem[] = sorted.slice(0, 3).map((p) => {
    const issueFirst = p.issues?.[0]?.trim();
    const tagline =
      (p.diagnosisBrief?.trim() && p.diagnosisBrief.slice(0, 100)) ||
      issueFirst ||
      '已在操盘队列中，建议进入诊断核对指标与动作。';
    return {
      object: summarizeProduct(p, {
        current_status: productProblemCount(p) > 0 ? '有待跟进问题' : '队列正常',
        next_action: issueFirst ? `优先：${issueFirst.slice(0, 52)}${issueFirst.length > 52 ? '…' : ''}` : undefined,
      }),
      href: appendFromHome(`/products/${p.id}`),
      tagline,
    };
  });

  return {
    period: `${g.period}`,
    targetGmvLabel: formatWan(g.target),
    currentGmvLabel: formatWan(g.current),
    progressPct: g.progress,
    headline: `优先处理 ${Math.max(problemSkuCount, opps.length + risks.length)} 个商品相关盘面`,
    subline: `关键机会 ${opps.length} 条，关键风险 ${risks.length} 条；建议按优先级逐个去推进，早审早落地。`,
    opportunityCount: opps.length,
    riskCount: risks.length,
    spotlights,
  };
}

export function getOpportunityRiskCards(): OpportunityRiskCardVM[] {
  const pmap = productMap();
  return highValueLeads.slice(0, 6).map((lead) => {
    const pid = lead.productIds[0];
    const product = pid ? pmap.get(pid) : undefined;
    const primaryObject =
      product != null
        ? summarizeProduct(product, {
            current_status: lead.type === 'risk' ? '风险待处置' : '机会待跟进',
            next_action: lead.title.length > 48 ? `${lead.title.slice(0, 48)}…` : lead.title,
          })
        : summarizeLeadWithoutProduct(lead);

    const baseHref =
      pid != null
        ? `/products/${pid}`
        : lead.type === 'risk'
          ? '/products?risk=high'
          : '/today?focus=opportunity';
    const href = appendFromHome(baseHref);

    return {
      id: lead.id,
      kind: lead.type,
      title: lead.title,
      description: lead.description,
      impactHint: lead.impact,
      urgency: lead.urgency,
      productId: pid,
      href,
      primaryObject,
      suggestedActionShort: lead.impact?.trim() || (lead.type === 'opportunity' ? '结合盘面推进落地动作' : '优先止损与复盘闭环'),
    };
  });
}

const FALLBACK_QUICK_TASKS: QuickTaskVM[] = [
  {
    id: 'qt-diag',
    label: '商品诊断',
    description: '进队列，打开单链诊断与推荐打法',
    href: '/products',
    iconKey: 'diagnosis',
  },
  {
    id: 'qt-opp',
    label: '高价值机会',
    description: '看今日机会盘面与优先跟进',
    href: '/today?focus=opportunity',
    iconKey: 'opportunity',
  },
  {
    id: 'qt-replay',
    label: '看结果对比',
    description: '对照指标与诊断结论的变化',
    href: '/replay',
    iconKey: 'replayActivity',
  },
  {
    id: 'qt-content',
    label: '流量与内容关注',
    description: '异常信号与引流关注点',
    href: '/today?focus=signals',
    iconKey: 'contentTraffic',
  },
];

export function getQuickTasks(): QuickTaskVM[] {
  const plist = listProducts();
  if (!plist.length) return FALLBACK_QUICK_TASKS;
  return [
    {
      id: 'qt-diag',
      label: '商品诊断',
      description: '进队列，打开单链诊断与推荐打法',
      href: '/products',
      iconKey: 'diagnosis',
    },
    {
      id: 'qt-opp',
      label: '高价值机会',
      description: '看今日机会盘面与优先跟进',
      href: '/today?focus=opportunity',
      iconKey: 'opportunity',
    },
    {
      id: 'qt-replay',
      label: '看结果对比',
      description: '对照指标与诊断结论的变化',
      href: '/replay',
      iconKey: 'replayActivity',
    },
    {
      id: 'qt-content',
      label: '流量与内容关注',
      description: '异常信号与引流关注点',
      href: '/today?focus=signals',
      iconKey: 'contentTraffic',
    },
  ];
}

function actionToPrimaryObject(
  a: (typeof actions)[0],
  pmap: Map<string, Product>,
  statusLabel: string,
): OperatorObjectSummary {
  const nextLine =
    a.reason?.trim() != null && a.reason.trim() !== ''
      ? a.reason.trim().length > 100
        ? `${a.reason.trim().slice(0, 100)}…`
        : a.reason.trim()
      : a.name;
  const prod = pmap.get(a.productId);
  if (prod != null) {
    return summarizeProduct(prod, {
      current_status: statusLabel,
      next_action: nextLine,
      goal: a.expectedImpact?.slice(0, 100),
    });
  }
  return {
    object_id: a.productId,
    object_type: 'product',
    object_name: a.productName,
    risk_level: a.riskLevel,
    current_status: statusLabel,
    next_action: nextLine,
    current_goal: a.expectedImpact?.slice(0, 100),
  };
}

function pushInProgress(
  acc: InProgressTaskVM[],
  a: (typeof actions)[0],
  status: InProgressTaskStatus,
  pmap: Map<string, Product>,
) {
  const stLabel =
    status === 'pending_confirm' ? '待确认' : status === 'in_progress' ? '进行中' : '已完成';
  let hrefPrimary: string;
  if (status === 'pending_confirm') {
    hrefPrimary = appendFromHome(`/approvals?actionId=${encodeURIComponent(a.id)}`);
  } else if (status === 'in_progress') {
    hrefPrimary = appendFromHome(`/products/${a.productId}`);
  } else {
    hrefPrimary = appendFromHome(`/products/${a.productId}?focus=actions`);
  }
  acc.push({
    id: a.id,
    title: a.name,
    context: `${a.productName} · ${a.type}`,
    status,
    statusLabel: stLabel,
    hrefPrimary,
    productId: a.productId,
    actionId: a.id,
    primaryObject: actionToPrimaryObject(a, pmap, stLabel),
  });
}

export function getInProgressTasks(): InProgressTaskVM[] {
  const pmap = productMap();
  const acc: InProgressTaskVM[] = [];
  const pend = actions.filter((a) => a.status === 'pending');
  const run = actions.filter((a) => a.status === 'running');
  const done = actions.filter((a) => a.status === 'completed');
  pend.slice(0, 2).forEach((a) => pushInProgress(acc, a, 'pending_confirm', pmap));
  run.slice(0, 2).forEach((a) => pushInProgress(acc, a, 'in_progress', pmap));
  done.slice(0, 2).forEach((a) => pushInProgress(acc, a, 'completed', pmap));
  return acc;
}

export function getSuggestedActions(): SuggestedActionVM[] {
  const pmap = productMap();
  const pend = actions.filter((a) => a.status === 'pending').slice(0, 6);
  return pend.map((a) => ({
    id: a.id,
    title: a.name,
    detail: a.reason,
    priorityHint: a.riskLevel === 'high' ? '高' : a.riskLevel === 'medium' ? '中' : '低',
    productId: a.productId,
    actionId: a.id,
    detailHref: appendFromHome(`/products/${a.productId}?focus=actions`),
    processHref: appendFromHome(`/approvals?actionId=${encodeURIComponent(a.id)}`),
    primaryObject: actionToPrimaryObject(a, pmap, '待审批'),
  }));
}

export function getMemoryProfile(): MemoryProfileVM {
  const plist = listProducts();
  const memTopCats = [...new Set(todayFocusProducts.map((p) => p.category).filter(Boolean))].slice(
    0,
    4,
  );
  if (!plist.length) {
    return {
      shopName: '—',
      categoryFocus: '—',
      monthlyGoal: '—',
    };
  }
  return {
    shopName: '梓晨家居旗舰店',
    categoryFocus:
      memTopCats.length > 0 ? memTopCats.join('、') : '家纺 · 床上四件套、被芯被罩、夏季凉感系列',
    monthlyGoal: '本月目标：提升 CTR 与转化率，稳住核心链接 GMV 占比',
    queueNote: `当前队列 ${plist.length} 个商品，TOP 已按优先级排序。`,
  };
}

function emptyModel(): OperatorHomeDemoModel {
  const shell = getOperatorHomeShell();
  return {
    ...shell,
    heroTagline: '加载商品队列后，可在此查看今日重点与推进动作',
    summary: {
      period: '—',
      targetGmvLabel: '—',
      currentGmvLabel: '—',
      progressPct: 0,
      headline: '暂无队列数据',
      subline: '进入商品操盘台以加载当前负责商品。',
      opportunityCount: 0,
      riskCount: 0,
      spotlights: [],
    },
    opportunityRiskCards: [],
    quickTasks: getQuickTasks(),
    inProgressTasks: [],
    memory: getMemoryProfile(),
    suggestedActions: [],
  };
}

/** 组装首页模型（推荐给页面的唯一入口之一） */
export function loadOperatorHomePageModel(): OperatorHomeModelResult {
  if (getOperatorHomeEmpty()) {
    return { isEmpty: true, model: emptyModel() };
  }

  const shell = getOperatorHomeShell();

  return {
    isEmpty: false,
    model: {
      ...shell,
      summary: getTodaySummary(),
      opportunityRiskCards: getOpportunityRiskCards(),
      quickTasks: getQuickTasks(),
      inProgressTasks: getInProgressTasks(),
      memory: getMemoryProfile(),
      suggestedActions: getSuggestedActions(),
    },
  };
}

/** @deprecated 与 loadOperatorHomePageModel 等价 */
export function buildOperatorHomeModel(): OperatorHomeModelResult {
  return loadOperatorHomePageModel();
}

export function buildOperatorHomeDemoData(): OperatorHomeDemoModel {
  return loadOperatorHomePageModel().model;
}
