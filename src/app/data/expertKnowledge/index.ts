export type {
  FlowSupportActionOverlay,
  FlowSupportBundle,
  FlowSupportDeliverableHint,
  FlowSupportRoleHint,
  StrategySnippetBucket,
  SupportSnippet,
  SupportType,
} from './types';
export {
  KNOWLEDGE_SUPPORT_DISCLAIMER_LINES,
  SOURCE_BAO_KUAN_MARKETING_SOP,
  SOURCE_TAO_LINK_DIAGNOSIS_SOP,
} from './types';
export { getFlowSupportByAction, getFlowSupportByStage } from './flowSupportMock';
export { mergeFlowSupport } from './mergeFlowSupport';
export {
  getStrategySupportByCategory,
  getStrategySupportByExecutionContext,
  getStrategySupportByGoodsId,
  getStrategySupportByProblem,
  getStrategySupportByReplayContext,
  getStrategySupportByRiskKey,
  getStrategySupportByRootCauseKey,
  getStrategySupportByStrategyKey,
  getStrategySupportByTodayContext,
  inferProblemKeyFromText,
  inferStrategyKeyFromText,
  mergeStrategySnippets,
} from './strategySupportMock';
export type {
  KnowledgeContextInput,
  KnowledgePageId,
  ResolvedKnowledgeSupport,
  TodaySignalType,
} from './knowledgeContextTypes';
export { resolveKnowledgeSupport } from './knowledgeContextResolver';
