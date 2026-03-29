import type { DiagnosisPhaseId } from '../sop/diagnosisFlowTypes';
import {
  DELIVERABLE_LABEL_ZH,
  ROLE_LABEL_ZH,
  ROLE_HINT_ZH,
  getPhaseById,
} from '../sop/diagnosisFlowSkeleton';
import type {
  FlowSupportActionOverlay,
  FlowSupportBundle,
  SupportSnippet,
} from './types';
import { SOURCE_TAO_LINK_DIAGNOSIS_SOP } from './types';

function citation(
  id: string,
  section: string,
  title: string,
  snippet: string,
  stage: DiagnosisPhaseId,
): SupportSnippet {
  return {
    support_id: id,
    support_type: 'flow',
    title,
    source_doc: SOURCE_TAO_LINK_DIAGNOSIS_SOP,
    source_section: section,
    snippet,
    relevance_score: 0.9,
    recommended_usage: '对照本阶段验收清单与会议纪要保持措辞一致。',
    linked_stage: stage,
  };
}

const STAGE_EXTRAS: Record<
  DiagnosisPhaseId,
  { reminders: string[]; risks: string[]; cites: SupportSnippet[] }
> = {
  prepare: {
    reminders: [
      '确认 goods_id 与统计窗口口径与数仓一致后再开诊断会。',
      '合规与资质材料缺失时，先标注为阻塞项而非强行下结论。',
    ],
    risks: [
      '范围不清易导致重复劳动；书面确认「本期诊断链接清单」。',
      '统计日错配会把异常归因到错误版本。',
    ],
    cites: [
      citation(
        'flow-cite-prepare-1',
        '第一章 · 诊断准备',
        '明确链路与窗口',
        '诊断前需锁定链接范围、统计窗口与角色分工，避免口头约定漂移。',
        'prepare',
      ),
    ],
  },
  collect: {
    reminders: [
      '指标缺失用「未返回」标注并记录字段名，便于数据侧追查。',
      '同一链接多统计日对比时保留可取到的最早对照日。',
    ],
    risks: [
      '手工补数若未经复核，不宜写入正式诊断结论主文。',
      '漏斗链路不全时，优先标注「不可解释区间」而非猜测。',
    ],
    cites: [
      citation(
        'flow-cite-collect-1',
        '第二章 · 数据采集',
        '数据汇总可追溯',
        '采集结果应能回溯到取数时间与口径说明，关键异常需打点注释。',
        'collect',
      ),
    ],
  },
  diagnose: {
    reminders: [
      '问题表述尽量「指标 + 对比基线 + 时间窗」三元组。',
      '根因需写置信度与反证路径，避免单点截图下结论。',
    ],
    risks: [
      '把相关当因果：需区分主因与伴生现象。',
      '跨品类类比需标明样本与适用边界。',
    ],
    cites: [
      citation(
        'flow-cite-diagnose-1',
        '第三章 · 问题诊断',
        '结论需数据支撑',
        '诊断结论应能被数据表或趋势复核，禁止纯主观定性。',
        'diagnose',
      ),
    ],
  },
  optimize: {
    reminders: [
      '动作需可验收：写清负责人、截止时间、量化目标和回滚条件。',
      '审批备注应可检索，避免只口头同步。',
    ],
    risks: [
      '高风险动作（标题/价格）需单独列出合规与会签路径。',
      '并行多动作时标注相互依赖，防止验收口径冲突。',
    ],
    cites: [
      citation(
        'flow-cite-optimize-1',
        '第四章 · 优化动作',
        '动作清单可执行',
        '优化动作应可量化、可验收，并约定跟踪节奏。',
        'optimize',
      ),
    ],
  },
  deliver: {
    reminders: [
      '报告与 PRD 输出包版本号对齐，附件列表与邮件/IM 通知一致。',
      '归档路径写入团队 wiki 或工单，避免事后找不到。',
    ],
    risks: [
      '对外承诺未写入输出包可能被误读为团队共识。',
      '缺少回滚/灰度说明时，执行容易超范围。',
    ],
    cites: [
      citation(
        'flow-cite-deliver-1',
        '第五章 · 结果输出',
        '输出包分发',
        '诊断报告与标准化输出包需完成团队同步并完成归档登记。',
        'deliver',
      ),
    ],
  },
  review: {
    reminders: [
      '复盘会议聚焦「预期 vs 实际」与下一窗口复查日。',
      '未达标动作进入升级或拆分，不要无限延期。',
    ],
    risks: [
      '指标波动受大促/规则影响时需剔除干扰再复盘。',
      '跟踪计划断层会导致同一问题反复进入诊断队列。',
    ],
    cites: [
      citation(
        'flow-cite-review-1',
        '第六章 · 复盘跟踪',
        '对照预期复盘',
        '持续跟踪动作效果与指标变化，安排复查窗口并记录教训。',
        'review',
      ),
    ],
  },
};

export function getFlowSupportByStage(stageKey: DiagnosisPhaseId): FlowSupportBundle {
  const phase = getPhaseById(stageKey);
  const extras = STAGE_EXTRAS[stageKey];
  if (!phase) {
    return {
      stageKey,
      stageSummary: '阶段定义缺失（演示占位）。',
      deliverableHints: [],
      roleHints: [],
      executionReminders: [],
      riskChecklist: [],
      citations: [],
    };
  }

  const deliverableHints = phase.deliverables.map((k) => ({
    label: DELIVERABLE_LABEL_ZH[k],
    hint: `本阶段需产出「${DELIVERABLE_LABEL_ZH[k]}」，并与下游阶段验收口径对齐。`,
  }));

  const roleHints = phase.roles.map((roleId) => ({
    roleId,
    label: ROLE_LABEL_ZH[roleId],
    hint: ROLE_HINT_ZH[roleId],
  }));

  return {
    stageKey,
    stageSummary: `${phase.name}：${phase.goal} 建议下一步：${phase.nextStepHint}`,
    deliverableHints,
    roleHints,
    executionReminders: extras.reminders,
    riskChecklist: extras.risks,
    citations: extras.cites,
  };
}

/** 按动作 id / 类型补充（mock）；未知动作返回 undefined */
export function getFlowSupportByAction(
  actionKey: string,
): FlowSupportActionOverlay | undefined {
  const map: Record<string, FlowSupportActionOverlay> = {
    A001: {
      stageSummaryAppend: '当前动作偏重主图方案产出：建议同步内容团队排期与素材规范。',
      executionReminders: [
        '主图需保留一版可回滚备份，再提交新方案评审。',
        '卖点图层建议与详情首屏叙事一致，避免口径打架。',
      ],
      riskChecklist: [
        '检查是否侵犯肖像/版权素材；活动角标是否符合平台当期规范。',
      ],
      citations: [
        {
          support_id: 'flow-act-A001',
          support_type: 'flow',
          title: '内容类动作评审',
          source_doc: SOURCE_TAO_LINK_DIAGNOSIS_SOP,
          source_section: '第四章 · 优化动作 · 内容变更',
          snippet: '涉及主图替换的动作，审批需附对比稿与预期 CTR 假设，并写明灰度节奏。',
          relevance_score: 0.82,
          recommended_usage: '附在审批备注或工单链接，便于合规同学二审。',
          linked_stage: 'optimize',
          linked_action: 'A001',
        },
      ],
    },
    A002: {
      executionReminders: [
        'A/B 上线前确认分流比例与最小样本量，避免过早叫停。',
        '日报里同时看 CTR 与后链路转化，防「虚假胜出」。',
      ],
      riskChecklist: [
        '测试周期过短易导致误判；建议不少于产品约定的最小运行天数。',
      ],
      citations: [
        {
          support_id: 'flow-act-A002',
          support_type: 'flow',
          title: '测试类动作',
          source_doc: SOURCE_TAO_LINK_DIAGNOSIS_SOP,
          source_section: '第四章 · 优化动作 · 实验验证',
          snippet: '实验类动作应写明假设、指标、停止规则与rollback，再进入执行队列。',
          relevance_score: 0.85,
          recommended_usage: '审批前核对实验参数是否与诊断结论一致。',
          linked_stage: 'optimize',
          linked_action: 'A002',
        },
      ],
    },
    A003: {
      executionReminders: [
        '标题调整后关注搜索词报告 48–72h，避免频繁抖动。',
      ],
      riskChecklist: [
        '中风险：关键词布局变动可能影响自然搜索排序，需设定观察窗口。',
      ],
      citations: [
        {
          support_id: 'flow-act-A003',
          support_type: 'flow',
          title: '标题变更风险提示',
          source_doc: SOURCE_TAO_LINK_DIAGNOSIS_SOP,
          source_section: '第四章 · 优化动作 · SEO',
          snippet: '标题优化需记录改动前后关键词结构与核心卖点，便于复盘与回滚。',
          relevance_score: 0.8,
          recommended_usage: '用于中高风动作审批说明。',
          linked_stage: 'optimize',
          linked_action: 'A003',
        },
      ],
    },
    A004: {
      executionReminders: [
        '价格带调研需标明数据来源时间与样本范围（店/品类/波次）。',
      ],
      riskChecklist: ['低价锚点若来自非可比样本，禁止直接作为定价结论。'],
    },
    A005: {
      stageSummaryAppend: '详情页优化动作：建议先锁定跳出率高的首屏模块再改稿。',
      executionReminders: [
        '详情前 3 屏需对齐主图与标题承诺，减少跳失。',
      ],
      riskChecklist: ['医疗/材质宣称需合规背书，避免绝对化用语。'],
    },
    A006: {
      executionReminders: ['关键词策略变更后同步付费与免费流量监测口径。'],
    },
  };

  return map[actionKey];
}
