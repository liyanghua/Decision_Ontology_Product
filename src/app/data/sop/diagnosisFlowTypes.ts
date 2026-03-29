/**
 * 流程支撑层：映射《淘天店铺链接诊断全流程》为前台可理解的阶段骨架。
 * 不生成诊断结论；结论仍来自数据侧与解析逻辑。
 *
 * 溯源：爆款营销SOP/淘天店铺链接诊断全流程.docx
 */

export type DiagnosisPhaseId =
  | 'prepare'
  | 'collect'
  | 'diagnose'
  | 'optimize'
  | 'deliver'
  | 'review';

export type SopRoute = 'detail' | 'approvals' | 'execution' | 'replay';

/** 前台结构化输出物（与 SOP 中报表/清单对应，不含内部工具路径）。 */
export type DeliverableKind =
  | 'data_summary'
  | 'issue_list'
  | 'diagnosis_conclusion'
  | 'action_list'
  | 'risk_followup_plan'
  | 'prd_archive';

export type DeliverableUiStatus = 'done' | 'partial' | 'pending';

export type SopRoleId =
  | 'ops_owner'
  | 'link_ops'
  | 'data_specialist'
  | 'compliance'
  | 'agent';

export interface PhaseDefinition {
  id: DiagnosisPhaseId;
  /** 与 SOP 阶段名称对齐（前台短名） */
  name: string;
  /** 操盘者可见目标，不含操作手册细节 */
  goal: string;
  deliverables: DeliverableKind[];
  roles: SopRoleId[];
  /** 本阶段结束后建议的下一步（短句） */
  nextStepHint: string;
}

/** 用于推断「当前建议阶段」；后续可替换为服务端 workflowState */
export interface FlowContextInput {
  route: SopRoute;
  hasGoodsId: boolean;
  /** 是否已具备可审计的指标行 / 汇总 */
  hasMetricsRow: boolean;
  /** 是否已具备结构化诊断正文（JSON 或 markdown 解析） */
  hasStructuredDiagnosis: boolean;
  pendingActionCount: number;
}

export interface DeliverableStatusRow {
  kind: DeliverableKind;
  label: string;
  status: DeliverableUiStatus;
  hint?: string;
}
