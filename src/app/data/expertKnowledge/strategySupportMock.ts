import { listProducts } from '../liveCatalog';
import type { SupportSnippet } from './types';
import { SOURCE_BAO_KUAN_MARKETING_SOP } from './types';

function s(
  id: string,
  bucket: NonNullable<SupportSnippet['strategy_bucket']>,
  section: string,
  title: string,
  snippet: string,
  score: number,
  usage: string,
  linked_problem?: string,
): SupportSnippet {
  return {
    support_id: id,
    support_type: 'strategy',
    title,
    source_doc: SOURCE_BAO_KUAN_MARKETING_SOP,
    source_section: section,
    snippet,
    relevance_score: score,
    recommended_usage: usage,
    linked_problem: linked_problem,
    strategy_bucket: bucket,
  };
}

const BASE_HIT: SupportSnippet[] = [
  s(
    'str-hit-1',
    'hit_build',
    '第二章 · 机会洞察',
    '爆款候选筛选',
    '优先看「需求增速 × 竞争空隙 × 供给质量」三因子，再决定单链接重仓。',
    0.88,
    '今日操盘/商品排序时对照，不作为唯一 KPI。',
  ),
  s(
    'str-hit-2',
    'hit_build',
    '第三章 · 爆款路径',
    '节奏：测款—放大—防守',
    '测款期严控预算与素材变量；放大期锁定单一增长飞轮；防守期补评价与复购。',
    0.86,
    '执行看板规划周节奏时使用。',
  ),
];

const BASE_MARKET: SupportSnippet[] = [
  s(
    'str-mkt-1',
    'market_keywords',
    '第四章 · 词与流量',
    '关键词象限',
    '将词分为「核心成交」「潜力长尾」「防守品牌」「无效消耗」四类，按象限配预算与创意。',
    0.84,
    '诊断 CTR/展现场景下对照使用。',
    'keyword_weak',
  ),
  s(
    'str-mkt-2',
    'market_keywords',
    '第四章 · 竞品对标',
    '价格带卡位',
    '先锁定主竞品成交价格带与主卖点，再决定跟跑/错位/溢价叙事。',
    0.8,
    '价格类动作与调研动作参考。',
  ),
];

const BASE_VISUAL: SupportSnippet[] = [
  s(
    'str-vis-1',
    'visual_positioning',
    '第五章 · 视觉与定位',
    '场景即品类语言',
    '主图/视频前 1 秒需完成「场景 + 人物 + 季节/材质」识别，避免纯白底堆卖点。',
    0.87,
    '主图与定位动作评审时引用。',
    'main_image_weak',
  ),
  s(
    'str-vis-2',
    'visual_positioning',
    '第五章 · 视觉与定位',
    '差异化一句话',
    '用一句价值主张锁住定位，详情每屏都回指该主张，减少跳失。',
    0.82,
    '详情页优化动作前自检。',
    'conversion_weak',
  ),
];

const BASE_LISTING: SupportSnippet[] = [
  s(
    'str-list-1',
    'listing_creative',
    '第六章 · 承接转化',
    '主图信息分层',
    '第 1 层识别品类与情感；第 2 层核心参数；第 3 层信任背书；忌一图堆砌全部文案。',
    0.9,
    '主图优化与 A/B 假设设计。',
    'main_image_weak',
  ),
  s(
    'str-list-2',
    'listing_creative',
    '第六章 · 承接转化',
    'SKU 梯度',
    'SKU 命名体现尺寸/颜色/套装差异；避免多 SKU 共用无差异主图。',
    0.78,
    '多 SKU 链接整理时检查。',
  ),
  s(
    'str-list-3',
    'listing_creative',
    '第六章 · 承接转化',
    '卖点策划五连问',
    '谁在用？在什么场景？解决什么痛点？为什么是你？现在下单的理由？',
    0.85,
    '详情文案与卖点卡片策划。',
    'detail_page_weak',
  ),
  s(
    'str-list-4',
    'listing_creative',
    '第六章 · SEO',
    '标题结构',
    '核心词前置 + 卖点词 + 属性词；控制长度，避免无意义符号堆叠。',
    0.88,
    '标题优化动作对照。',
    'title_weak',
  ),
];

const BASE_READING: SupportSnippet[] = [
  s(
    'str-read-1',
    'reading',
    '附录 · 延伸阅读',
    '爆款复盘模板',
    '复盘表建议含：窗口、抓手、约束、结果、复用条件五条，避免只写感受。',
    0.72,
    '周会复盘或 Replay 页自查。',
  ),
];

function byCategoryExtras(cat: string): SupportSnippet[] {
  const c = cat.trim();
  if (c.includes('四件套') || c.includes('床品')) {
    return [
      s(
        'str-cat-bedding-1',
        'market_keywords',
    '床品类目 · 季节词',
    '季节与材质叙事',
    '春夏强调透气凉感与可机洗；秋冬强调保暖克重与绒感，创意需与季节搜索词同步。',
    0.83,
    '床上品类企划与创意方向。',
      ),
    ];
  }
  if (c.includes('枕')) {
    return [
      s(
        'str-cat-pillow-1',
        'listing_creative',
    '枕头类目 · 健康宣称',
    '功能宣称边界',
    '抗菌/护颈等功能需与资质或报告一致，页面避免绝对化疗效表述。',
    0.81,
    '枕头类详情合规自查。',
      ),
    ];
  }
  if (c.includes('被')) {
    return [
      s(
        'str-cat-quilt-1',
        'visual_positioning',
    '被芯类目 · 痛点',
    '轻薄与保暖二元叙事',
    '夏被突出轻与可水洗；冬被突出锁温与面料触感，主图场景需匹配。',
    0.79,
    '被芯主图与详情首屏策略。',
      ),
    ];
  }
  return [
    s(
      'str-cat-default-1',
      'hit_build',
    '通用 · 类目扩展',
    '跨类目复用原则',
    '跨用打法时先对齐类目决策因子与用户决策时长，再迁移创意结构。',
    0.7,
    '类目扩展或试验新类目时阅读。',
    ),
  ];
}

function dedupe(snips: SupportSnippet[]): SupportSnippet[] {
  const seen = new Set<string>();
  return snips.filter((x) => {
    if (seen.has(x.support_id)) return false;
    seen.add(x.support_id);
    return true;
  });
}

/** 合并多路策略片段并去重（先出现的优先） */
export function mergeStrategySnippets(...groups: SupportSnippet[][]): SupportSnippet[] {
  const seen = new Set<string>();
  const out: SupportSnippet[] = [];
  for (const g of groups) {
    for (const s of g) {
      if (seen.has(s.support_id)) continue;
      seen.add(s.support_id);
      out.push(s);
    }
  }
  return out;
}

export function getStrategySupportByCategory(categoryKey: string): SupportSnippet[] {
  const normalized =
    !categoryKey || categoryKey === '—' ? 'default' : categoryKey;
  return dedupe([
    ...BASE_HIT,
    ...BASE_MARKET,
    ...BASE_VISUAL,
    ...BASE_LISTING,
    ...BASE_READING,
    ...byCategoryExtras(normalized),
  ]);
}

const PROBLEM_EXTRA: Record<string, SupportSnippet[]> = {
  low_ctr: [
    s(
      'str-prob-ctr-1',
      'listing_creative',
    '打法库 · CTR',
    'CTR 自救三板斧',
    '先排除展示量暴跌；再看词路相关性；最后做主图与价格预期一致性检查。',
    0.91,
    'CTR 低于基准时优先阅读。',
      'low_ctr',
    ),
  ],
  main_image_weak: [
    s(
      'str-prob-img-1',
      'visual_positioning',
    '打法库 · 主图',
    '主图 CTR 诊断顺序',
      '清晰度 → 构图主体占比 → 卖点可读性 → 与标题承诺一致性。',
    0.89,
      '主图类根因归因时引用。',
      'main_image_weak',
    ),
  ],
  title_weak: [
    s(
      'str-prob-title-1',
      'market_keywords',
    '打法库 · 标题',
      '标题曝光不转化',
      '检查是否「大词泛匹配」带来无效曝光；必要时收缩词路做精准成交。',
    0.84,
      '标题策略相关根因。',
      'title_weak',
    ),
  ],
  conversion_weak: [],
  detail_page_weak: [],
  keyword_weak: [],
  generic: [],
};

export function getStrategySupportByProblem(problemKey: string): SupportSnippet[] {
  const key = problemKey.trim() || 'generic';
  return dedupe([
    ...(PROBLEM_EXTRA[key] ?? PROBLEM_EXTRA.generic ?? []),
    ...getStrategySupportByCategory('default'),
  ]);
}

/** 将自由文本粗映射为 problemKey（启发式） */
export function inferProblemKeyFromText(text: string): string {
  const t = text.toLowerCase();
  if (/ctr|点击/.test(t)) return 'low_ctr';
  if (/主图|图片|场景/.test(t)) return 'main_image_weak';
  if (/标题|关键词|搜索/.test(t)) return 'title_weak';
  if (/转化|下单|加购/.test(t)) return 'conversion_weak';
  if (/详情|跳失|页面/.test(t)) return 'detail_page_weak';
  if (/词|流量|曝光|推广/.test(t)) return 'keyword_weak';
  return 'generic';
}

/** 从改进建议等正文粗映射策略包 id（mock 对齐 S001/S002/S003） */
export function inferStrategyKeyFromText(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/主图|封面|素材|图片/.test(t)) return 'S001';
  if (/标题|seo|搜索词|关键词/.test(t)) return 'S002';
  if (/价格|定价|价盘/.test(t)) return 'S003';
  return undefined;
}

const GOODS_TAG: Record<string, SupportSnippet[]> = {};

export function getStrategySupportByGoodsId(goodsId: string): SupportSnippet[] {
  const products = listProducts();
  const p = products.find((x) => x.id === goodsId);
  const cat = p?.category?.trim() ? p.category : 'default';
  const fromCat = getStrategySupportByCategory(cat);
  const extra = GOODS_TAG[goodsId] ?? [];
  return dedupe([...extra, ...fromCat]);
}

const ROOT_CAUSE_SNIPS: Record<string, SupportSnippet[]> = {
  RC001: [
    s(
      'str-root-RC001',
      'listing_creative',
      '根因打法 · 主图吸引力',
      '主图吸引力弱',
      '优先做「识别—情感—参数」三层信息自检；CTR 与跳失联动观察，避免只改美不改信息。',
      0.86,
      '命中 RC001 时与策略支持并列阅读。',
    ),
  ],
  RC002: [
    s(
      'str-root-RC002',
      'market_keywords',
      '根因打法 · 标题匹配',
      '标题/词路匹配不足',
      '收缩大词泛曝光，补高意图长尾；标题首屏承诺与主图卖点对齐。',
      0.85,
      '命中 RC002 时参考。',
    ),
  ],
  RC003: [
    s(
      'str-root-RC003',
      'market_keywords',
      '根因打法 · 价格带',
      '价格竞争力',
      '先对齐竞品到手价与促销节奏，再决定跟价、件套拆分或赠品差异化。',
      0.84,
      '命中 RC003 时参考。',
    ),
  ],
};

export function getStrategySupportByRootCauseKey(key: string): SupportSnippet[] {
  const k = key.trim();
  return dedupe(ROOT_CAUSE_SNIPS[k] ?? []);
}

const STRATEGY_ID_SNIPS: Record<string, SupportSnippet[]> = {
  S001: [
    s(
      'str-st-S001',
      'listing_creative',
      '策略包 · S001 主图',
      '主图优化策略落地',
      '先定一版「识别向」主图再通过 A/B 放量；停止规则写清避免反复改稿。',
      0.87,
      '与动作审批/执行的主图类动作联动。',
    ),
  ],
  S002: [
    s(
      'str-st-S002',
      'market_keywords',
      '策略包 · S002 标题',
      '标题优化策略落地',
      '改标题前后留存搜索词报表截图，便于复盘与回滚。',
      0.84,
      '标题类动作评审参阅。',
    ),
  ],
  S003: [
    s(
      'str-st-S003',
      'market_keywords',
      '策略包 · S003 价格',
      '价格调整前置',
      '调价需同步优惠券、满减与详情说明，防客诉与口径不一致。',
      0.82,
      '价格带/调价动作参阅。',
    ),
  ],
};

export function getStrategySupportByStrategyKey(key: string): SupportSnippet[] {
  const k = key.trim();
  return dedupe(STRATEGY_ID_SNIPS[k] ?? []);
}

export function getStrategySupportByRiskKey(
  key: 'low' | 'medium' | 'high',
): SupportSnippet[] {
  const table: Record<string, SupportSnippet[]> = {
    high: [
      s(
        'str-risk-high',
        'reading',
        '审批 · 高风险',
        '高风险动作评审',
        '需二次确认影响面与回滚路径；建议附数据假设与历史相似案例摘要。',
        0.9,
        '风险等级为「高」时必读。',
      ),
    ],
    medium: [
      s(
        'str-risk-medium',
        'reading',
        '审批 · 中风险',
        '中风险动作评审',
        '建议设定观察窗口与停止规则；标题/价格类优先小流量验证。',
        0.83,
        '风险等级为「中」时参考。',
      ),
    ],
    low: [
      s(
        'str-risk-low',
        'reading',
        '审批 · 低风险',
        '低风险快速通道',
        '仍建议记录预期指标与验收口径，便于执行后对照。',
        0.75,
        '低风险可加快但仍留痕。',
      ),
    ],
  };
  return dedupe(table[key] ?? []);
}

export function getStrategySupportByReplayContext(versionDiff: boolean): SupportSnippet[] {
  if (!versionDiff) return [];
  return dedupe([
    s(
      'str-replay-diff-1',
      'reading',
      'Replay · 版本对比',
      '差异阅读顺序',
      '先核对统计日与取数口径一致，再比结构化字段；差异大时优先看 problem / conclusion 两段。',
      0.88,
      '开启「对比日」时使用。',
    ),
    s(
      'str-replay-diff-2',
      'hit_build',
      'Replay · 版本对比',
      '避免过度解读单次波动',
      '单次模型输出差异不等于策略失效；结合外部活动与库存一并记录。',
      0.8,
      '写审计结论前自检。',
    ),
  ]);
}

export type TodayContextSignal =
  | 'opportunity'
  | 'risk'
  | 'critical'
  | 'neutral';

export function getStrategySupportByTodayContext(opts: {
  signalType: TodayContextSignal;
  themeKey?: string;
}): SupportSnippet[] {
  const out: SupportSnippet[] = [];
  if (opts.signalType === 'opportunity') {
    out.push(
      s(
        'str-today-opp',
        'hit_build',
        '今日操盘 · 机会',
        '机会信号',
        '机会列表优先看可落地抓手与涉及商品；先匹配 1 条最短路径再扩容。',
        0.85,
        '高价值机会区语境。',
      ),
    );
  }
  if (opts.signalType === 'risk') {
    out.push(
      s(
        'str-today-risk',
        'reading',
        '今日操盘 · 风险',
        '风险信号',
        '风险项先标影响面与时间点，再决定上升或并行处理，避免只堆监控不闭环。',
        0.84,
        '风险 leads 语境。',
      ),
    );
  }
  if (opts.signalType === 'critical') {
    out.push(
      s(
        'str-today-crit',
        'reading',
        '今日操盘 · 紧急',
        '紧急信号',
        '紧急信号默认缩短反馈周期；明确单一决策人与对外口径。',
        0.87,
        '严重信号列表语境。',
      ),
    );
  }
  const theme = (opts.themeKey ?? '').trim();
  if (theme === 'LEAD001') {
    out.push(
      s(
        'str-theme-LEAD001',
        'market_keywords',
        '主题 · LEAD001',
        '家纺季节词占位',
        '季节切换窗口抢「材质+场景」心智词，素材与落地价同步。',
        0.82,
        '与今日机会 LEAD001 主题对齐。',
      ),
    );
  } else if (theme === 'LEAD002') {
    out.push(
      s(
        'str-theme-LEAD002',
        'listing_creative',
        '主题 · LEAD002',
        '详情信任背书',
        '详情前 3 屏集中检测报告/认证与用户证言，减少理性跳失。',
        0.81,
        '与 LEAD002 主题对齐。',
      ),
    );
  } else if (theme === 'LEAD003') {
    out.push(
      s(
        'str-theme-LEAD003',
        'market_keywords',
        '主题 · LEAD003',
        '长尾词洼地',
        '长尾词先占坑再优化承接；注意与主搜词的预算抢占关系。',
        0.8,
        '与 LEAD003 主题对齐。',
      ),
    );
  } else if (theme.startsWith('LEAD-LIVE-')) {
    out.push(
      s(
        'str-theme-lead-live',
        'hit_build',
        '今日主题（操盘队列）',
        '信号与链接联动',
        '该主题由今日重点商品信号衍生，请结合 goods_id 详情页的结构化诊断与动作队列确认优先级。',
        0.83,
        '今日操盘台机会列表语境。',
      ),
    );
  }
  return dedupe(out);
}

export function getStrategySupportByExecutionContext(): SupportSnippet[] {
  return dedupe([
    s(
      'str-exec-1',
      'reading',
      '执行页 · 复盘',
      '实际 vs 预期',
      '每条执行记录对齐「假设—指标—窗口」；未达预期写清外部干扰或假设失效。',
      0.84,
      '执行与结果列表页使用。',
    ),
    s(
      'str-exec-2',
      'hit_build',
      '执行页 · 跟踪',
      '下一复查点',
      '为每条动作设下次诊断或数据复查日，避免执行后无 owner。',
      0.82,
      '跟踪节奏占位。',
    ),
  ]);
}
