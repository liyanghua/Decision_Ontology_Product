import type { Action } from '../mockData';
import type { TaskFlowDemoOverride } from './taskTypes';

export type TaskPrestageSeed = {
  action: Action;
  demo: TaskFlowDemoOverride;
};

export const TASK_PRESTAGE_SEEDS: TaskPrestageSeed[] = [
  {
    action: {
      id: 'PRE001',
      name: '补齐大促库存与活动口径',
      type: '前置准备',
      productId: 'P100892',
      productName: '冰丝夏季薄款被子',
      strategyId: 'PREP-STOCK',
      status: 'pending',
      riskLevel: 'medium',
      reason: '库存口径、活动排期和可用资源还没对齐，现在放行容易把执行卡死。',
      expectedImpact: '补齐关键信息后，再决定是否放行本轮动作。',
      createdAt: '2026-03-30 09:10:00',
    },
    demo: {
      phaseOverride: 'waiting_input',
    },
  },
  {
    action: {
      id: 'PRE002',
      name: '收口主图点击下滑诊断',
      type: '诊断收口',
      productId: 'P100891',
      productName: '春夏凉感四件套',
      strategyId: 'PREP-DIAG',
      status: 'pending',
      riskLevel: 'medium',
      reason: '问题方向已初步明确，但优先打法、验证口径和影响范围还没收成一张清单。',
      expectedImpact: '诊断收口后，可直接进入经营拍板。',
      createdAt: '2026-03-30 09:25:00',
    },
    demo: {
      phaseOverride: 'diagnosing',
    },
  },
];
