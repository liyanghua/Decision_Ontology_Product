// Mock data for the application

export type RiskLevel = 'high' | 'medium' | 'low';
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'running' | 'completed' | 'failed';
export type ProblemSeverity = 'critical' | 'warning' | 'info';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  sku: string;
  priority: number;
  riskLevel: RiskLevel;
  problemCount: number;
  actionCount: number;
  metrics: {
    ctr_7d: number;
    impression_7d: number;
    conversion_7d: number;
    revenue_7d: number;
    category_ctr_p30: number;
  };
  issues: string[];
  rootCauses: string[];
  recommendedStrategies: string[];
}

export interface Evidence {
  id: string;
  type: string;
  metric: string;
  actual: number | string;
  expected: number | string;
  deviation: number;
  severity: ProblemSeverity;
}

export interface RootCause {
  id: string;
  name: string;
  confidence: number;
  impact: number;
  evidence: string[];
  description: string;
}

export interface Strategy {
  id: string;
  name: string;
  targetRootCause: string[];
  priority: number;
  expectedImpact: string;
  actions: string[];
}

export interface Action {
  id: string;
  name: string;
  type: string;
  productId: string;
  productName: string;
  strategyId: string;
  status: ActionStatus;
  riskLevel: RiskLevel;
  reason: string;
  expectedImpact: string;
  actualImpact?: string;
  createdAt: string;
  approvedAt?: string;
  executedAt?: string;
  completedAt?: string;
  approver?: string;
}

export interface Execution {
  id: string;
  actionId: string;
  actionName: string;
  productName: string;
  status: ActionStatus;
  progress: number;
  startTime: string;
  endTime?: string;
  logs: ExecutionLog[];
  expectedOutcome: string;
  actualOutcome?: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface HighValueLead {
  id: string;
  type: 'opportunity' | 'risk';
  title: string;
  description: string;
  impact: string;
  productIds: string[];
  productCount: number;
  urgency: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface GoalSummary {
  period: string;
  target: number;
  current: number;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  deviation: number;
}

export const products: Product[] = [
  {
    id: 'P100891',
    name: '春夏凉感四件套',
    category: '床上四件套',
    brand: '梓晨家居',
    sku: 'SKU-CSL-001',
    priority: 95,
    riskLevel: 'high',
    problemCount: 3,
    actionCount: 5,
    metrics: {
      ctr_7d: 1.2,
      impression_7d: 18230,
      conversion_7d: 2.8,
      revenue_7d: 12450,
      category_ctr_p30: 2.1,
    },
    issues: ['点击率偏低', '主图吸引力弱', '标题匹配度低'],
    rootCauses: ['主图吸引力弱', '标题匹配低', '价格带偏差'],
    recommendedStrategies: ['主图优化策略', '标题优化策略'],
  },
  {
    id: 'P100892',
    name: '冰丝夏季薄款被子',
    category: '被芯被罩',
    brand: '梓晨家居',
    sku: 'SKU-BS-002',
    priority: 88,
    riskLevel: 'medium',
    problemCount: 2,
    actionCount: 3,
    metrics: {
      ctr_7d: 2.3,
      impression_7d: 15670,
      conversion_7d: 3.2,
      revenue_7d: 18900,
      category_ctr_p30: 2.8,
    },
    issues: ['转化率低于预期', '竞品价格优势'],
    rootCauses: ['价格竞争力弱', '详情页说服力不足'],
    recommendedStrategies: ['价格优化策略', '详情页优化'],
  },
  {
    id: 'P100893',
    name: '纯棉抗菌枕头',
    category: '枕头枕芯',
    brand: '优眠家纺',
    sku: 'SKU-ZT-003',
    priority: 76,
    riskLevel: 'medium',
    problemCount: 1,
    actionCount: 2,
    metrics: {
      ctr_7d: 3.1,
      impression_7d: 8920,
      conversion_7d: 4.5,
      revenue_7d: 8600,
      category_ctr_p30: 3.3,
    },
    issues: ['流量不足'],
    rootCauses: ['关键词竞争力弱', '推广预算不足'],
    recommendedStrategies: ['关键词优化策略', '预算优化'],
  },
  {
    id: 'P100894',
    name: '记忆棉颈椎护枕',
    category: '枕头枕芯',
    brand: '优眠家纺',
    sku: 'SKU-JY-004',
    priority: 65,
    riskLevel: 'low',
    problemCount: 1,
    actionCount: 1,
    metrics: {
      ctr_7d: 3.8,
      impression_7d: 12450,
      conversion_7d: 5.2,
      revenue_7d: 15200,
      category_ctr_p30: 3.5,
    },
    issues: ['季节性需求下降'],
    rootCauses: ['季节性因素'],
    recommendedStrategies: ['时段优化策略'],
  },
];

export const evidencePacks = {
  P100891: [
    {
      id: 'E001',
      type: '点击率指标',
      metric: 'CTR 7日',
      actual: '1.2%',
      expected: '2.1%',
      deviation: -42.9,
      severity: 'critical' as ProblemSeverity,
    },
    {
      id: 'E002',
      type: '图片质量评分',
      metric: 'main_image_quality_score',
      actual: '0.42',
      expected: '0.75',
      deviation: -44.0,
      severity: 'critical' as ProblemSeverity,
    },
    {
      id: 'E003',
      type: '标题相关性',
      metric: 'title_relevance_score',
      actual: '0.87',
      expected: '0.92',
      deviation: -5.4,
      severity: 'warning' as ProblemSeverity,
    },
    {
      id: 'E004',
      type: '曝光量',
      metric: 'impression_7d',
      actual: '18,230',
      expected: '15,000',
      deviation: 21.5,
      severity: 'info' as ProblemSeverity,
    },
  ],
};

export const rootCauses = {
  P100891: [
    {
      id: 'RC001',
      name: '主图吸引力弱',
      confidence: 0.89,
      impact: 0.85,
      evidence: ['E002', 'E001'],
      description: '主图质量评分显著低于品类基准，缺乏场景化展示，卖点不突出，导致用户点击意愿低',
    },
    {
      id: 'RC002',
      name: '标题匹配度低',
      confidence: 0.72,
      impact: 0.65,
      evidence: ['E003'],
      description: '标题关键词与用户搜索意图匹配度不足，缺少高转化核心词',
    },
    {
      id: 'RC003',
      name: '价格带偏差',
      confidence: 0.68,
      impact: 0.55,
      evidence: ['E001'],
      description: '价格定位高于品类主流价格带，对价格敏感用户吸引力不足',
    },
  ],
};

export const strategies = {
  P100891: [
    {
      id: 'S001',
      name: '主图优化策略',
      targetRootCause: ['RC001'],
      priority: 95,
      expectedImpact: 'CTR 预期提升 40-60%',
      actions: ['生成新主图方案', '启动 A/B 测试', '监测点击率变化'],
    },
    {
      id: 'S002',
      name: '标题优化策略',
      targetRootCause: ['RC002'],
      priority: 80,
      expectedImpact: '搜索流量预期提升 25-35%',
      actions: ['调整标题关键词', '优化长尾词布局'],
    },
    {
      id: 'S003',
      name: '价格调整策略',
      targetRootCause: ['RC003'],
      priority: 70,
      expectedImpact: '转化率预期提升 15-20%',
      actions: ['价格带调研', '竞品价格监控', '动态定价测试'],
    },
  ],
};

export const actions: Action[] = [
  {
    id: 'A001',
    name: '生成新主图方案',
    type: '内容优化',
    productId: 'P100891',
    productName: '春夏凉感四件套',
    strategyId: 'S001',
    status: 'pending',
    riskLevel: 'low',
    reason: '当前主图质量评分 0.42，显著低于基准 0.75',
    expectedImpact: 'CTR 提升 40-60%，预计 7 日增收 ¥8,000-12,000',
    createdAt: '2026-03-28 09:30:00',
  },
  {
    id: 'A002',
    name: '启动主图 A/B 测试',
    type: '测试验证',
    productId: 'P100891',
    productName: '春夏凉感四件套',
    strategyId: 'S001',
    status: 'pending',
    riskLevel: 'low',
    reason: '���主图方案需要测试验证效果',
    expectedImpact: '预计测试周期 3-5 天，获取可靠数据',
    createdAt: '2026-03-28 09:35:00',
  },
  {
    id: 'A003',
    name: '调整标题关键词',
    type: '内容优化',
    productId: 'P100891',
    productName: '春夏凉感四件套',
    strategyId: 'S002',
    status: 'approved',
    riskLevel: 'medium',
    reason: '标题相关性评分 0.87，低于目标 0.92',
    expectedImpact: '搜索流量提升 25-35%',
    createdAt: '2026-03-27 14:20:00',
    approvedAt: '2026-03-27 15:30:00',
    approver: '李明 - 商品运营负责人',
  },
  {
    id: 'A004',
    name: '价格带调研',
    type: '数据分析',
    productId: 'P100891',
    productName: '春夏凉感四件套',
    strategyId: 'S003',
    status: 'running',
    riskLevel: 'low',
    reason: '了解品类主流价格带分布',
    expectedImpact: '为定价优化提供数据支持',
    createdAt: '2026-03-27 10:00:00',
    approvedAt: '2026-03-27 11:00:00',
    executedAt: '2026-03-27 11:30:00',
    approver: '张伟 - 品类负责人',
  },
  {
    id: 'A005',
    name: '优化详情页说服力',
    type: '内容优化',
    productId: 'P100892',
    productName: '冰丝夏季薄款被子',
    strategyId: 'S004',
    status: 'pending',
    riskLevel: 'medium',
    reason: '转化率低于预期，详情页跳出率高',
    expectedImpact: '转化率提升 20-30%',
    createdAt: '2026-03-28 08:00:00',
  },
  {
    id: 'A006',
    name: '关键词竞争力优化',
    type: '推广优化',
    productId: 'P100893',
    productName: '纯棉抗菌枕头',
    strategyId: 'S005',
    status: 'completed',
    riskLevel: 'low',
    reason: '流量不足，关键词竞争力弱',
    expectedImpact: '曝光量提升 30-40%',
    actualImpact: '曝光量提升 38%，达到预期',
    createdAt: '2026-03-25 09:00:00',
    approvedAt: '2026-03-25 10:00:00',
    executedAt: '2026-03-25 14:00:00',
    completedAt: '2026-03-27 18:00:00',
    approver: '王芳 - 增长负责人',
  },
];

export const executions: Execution[] = [
  {
    id: 'EX001',
    actionId: 'A004',
    actionName: '价格带调研',
    productName: '春夏凉感四件套',
    status: 'running',
    progress: 65,
    startTime: '2026-03-27 11:30:00',
    expectedOutcome: '获得品类价格带分布数据，为定价策略提供支持',
    logs: [
      {
        id: 'L001',
        timestamp: '2026-03-27 11:30:00',
        level: 'info',
        message: '开始执行价格带调研任务',
      },
      {
        id: 'L002',
        timestamp: '2026-03-27 12:00:00',
        level: 'info',
        message: '已采集 120 个竞品价格数据',
      },
      {
        id: 'L003',
        timestamp: '2026-03-27 14:30:00',
        level: 'info',
        message: '价格带分析完成 65%',
      },
    ],
  },
  {
    id: 'EX002',
    actionId: 'A006',
    actionName: '关键词竞争力优化',
    productName: '纯棉抗菌枕头',
    status: 'completed',
    progress: 100,
    startTime: '2026-03-25 14:00:00',
    endTime: '2026-03-27 18:00:00',
    expectedOutcome: '曝光量提升 30-40%',
    actualOutcome: '曝光量提升 38%，从日均 1,274 提升至 1,758',
    logs: [
      {
        id: 'L004',
        timestamp: '2026-03-25 14:00:00',
        level: 'info',
        message: '开始执行关键词优化',
      },
      {
        id: 'L005',
        timestamp: '2026-03-25 14:30:00',
        level: 'info',
        message: '已更新 15 个关键词出价',
      },
      {
        id: 'L006',
        timestamp: '2026-03-26 10:00:00',
        level: 'info',
        message: '观察到曝光量开始上升',
      },
      {
        id: 'L007',
        timestamp: '2026-03-27 18:00:00',
        level: 'info',
        message: '执行完成，曝光量提升 38%',
      },
    ],
  },
  {
    id: 'EX003',
    actionId: 'A007',
    actionName: '促销活动配置',
    productName: '记忆棉颈椎护枕',
    status: 'failed',
    progress: 30,
    startTime: '2026-03-26 16:00:00',
    endTime: '2026-03-26 17:30:00',
    expectedOutcome: '促销活动上线，转化率提升',
    actualOutcome: '活动配置失败，库存数据同步异常',
    logs: [
      {
        id: 'L008',
        timestamp: '2026-03-26 16:00:00',
        level: 'info',
        message: '开始配置促销活动',
      },
      {
        id: 'L009',
        timestamp: '2026-03-26 16:45:00',
        level: 'warning',
        message: '库存数据同步延迟',
      },
      {
        id: 'L010',
        timestamp: '2026-03-26 17:30:00',
        level: 'error',
        message: '执行失败：库存数据同步异常，无法完成活动配置',
      },
    ],
  },
];

export const todaySignals = [
  {
    id: 'SIG001',
    type: 'CTR 异常',
    productId: 'P100891',
    productName: '春夏凉感四件套',
    severity: 'critical' as ProblemSeverity,
    message: 'CTR 连续 3 天低于基准 40%',
    timestamp: '2026-03-28 08:00:00',
  },
  {
    id: 'SIG002',
    type: '转化率下降',
    productId: 'P100892',
    productName: '冰丝夏季薄款被子',
    severity: 'warning' as ProblemSeverity,
    message: '转化率较上周下降 15%',
    timestamp: '2026-03-28 07:30:00',
  },
  {
    id: 'SIG003',
    type: '竞品价格变动',
    productId: 'P100891',
    productName: '春夏凉感四件套',
    severity: 'warning' as ProblemSeverity,
    message: '主要竞品价格下调 8%',
    timestamp: '2026-03-28 06:00:00',
  },
  {
    id: 'SIG004',
    type: '库存预警',
    productId: 'P100892',
    productName: '冰丝夏季薄款被子',
    severity: 'warning' as ProblemSeverity,
    message: '库存低于安全线，预计 5 天售罄',
    timestamp: '2026-03-28 05:00:00',
  },
];

export const highValueLeads: HighValueLead[] = [
  {
    id: 'LEAD001',
    type: 'opportunity',
    title: '床上四件套品类 CTR 整体下滑',
    description: '品类内 3 个商品 CTR 同时下降，主图质量普遍低于基准，存在批量优化机会',
    impact: '优化后预计品类 7 日 GMV 提升 ¥35,000+',
    productIds: ['P100891', 'P100895', 'P100896'],
    productCount: 3,
    urgency: 'high',
    actionable: true,
  },
  {
    id: 'LEAD002',
    type: 'risk',
    title: '夏季商品库存周转风险',
    description: '2 个夏季商品库存高于安全线 120%，季节窗口剩余 45 天，需加速动销',
    impact: '若不处理，预计库存积压损失 ¥28,000',
    productIds: ['P100892', 'P100891'],
    productCount: 2,
    urgency: 'high',
    actionable: true,
  },
  {
    id: 'LEAD003',
    type: 'opportunity',
    title: '枕芯品类关键词流量洼地',
    description: '发现 8 个高潜力长尾词，竞争度低但搜索量稳定，可快速占位',
    impact: '预计带来日均 2,500+ 新增曝光',
    productIds: ['P100893', 'P100894'],
    productCount: 2,
    urgency: 'medium',
    actionable: true,
  },
];

export const goalSummary: GoalSummary = {
  period: '3月',
  target: 1200000,
  current: 856000,
  progress: 71.3,
  trend: 'down',
  deviation: -8.7,
};

export const knowledgeSupport = {
  main_image_optimization: {
    title: '主图优化最佳实践',
    type: '策略指南',
    content: `
## 主图优化核心要点

### 场景化展示
- 展示产品在真实使用场景中的状态
- 强调季节属性（如夏季清凉感）
- 突出使用场景（如卧室、床上）

### 卖点可视化
- 将核心卖点通过视觉化方式呈现
- 使用对比图展示产品优势
- 突出材质、工艺等差异化特征

### 品类基准参考
- 床上四件套品类主图质量基准：0.75
- 高点击率主图特征：清晰度高、构图简洁、卖点突出
- 避免过度修图，保持真实感
    `,
    relatedStrategies: ['S001'],
    source: '电商运营知识库 - 内容优化篇',
  },
  title_optimization: {
    title: '商品标题优化指南',
    type: '策略指南',
    content: `
## 标题优化策略

### 关键词布局
- 核心词前置（品类词、品牌词）
- 长尾词补充（材质、功能、适用场景）
- 避免关键词堆砌

### 匹配度提升
- 分析用户搜索词热度
- 匹配高转化搜索意图
- 定期更新季节性关键词

### 标题结构
- 品牌 + 核心卖点 + 品类 + 材质/功能
- 控制在 30-60 字符
- 避免特殊符号过多
    `,
    relatedStrategies: ['S002'],
    source: '电商运营知识库 - SEO 优化篇',
  },
};
