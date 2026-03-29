import type { DiagnosisPhaseId } from '../sop/diagnosisFlowTypes';
import { getFlowSupportByAction, getFlowSupportByStage } from './flowSupportMock';
import { mergeFlowSupport } from './mergeFlowSupport';
import type { KnowledgeContextInput, ResolvedKnowledgeSupport } from './knowledgeContextTypes';
import type { SupportSnippet } from './types';
import {
  getStrategySupportByCategory,
  getStrategySupportByGoodsId,
  getStrategySupportByProblem,
  getStrategySupportByExecutionContext,
  getStrategySupportByReplayContext,
  getStrategySupportByRiskKey,
  getStrategySupportByRootCauseKey,
  getStrategySupportByStrategyKey,
  getStrategySupportByTodayContext,
  mergeStrategySnippets,
} from './strategySupportMock';

function effectiveStage(input: KnowledgeContextInput): DiagnosisPhaseId {
  if (input.stageKey) return input.stageKey;
  switch (input.page) {
    case 'action_approval':
      return 'optimize';
    case 'execution':
      return 'review';
    case 'today_command':
    case 'product_action_board':
      return 'prepare';
    case 'replay_explain':
    case 'product_detail':
    default:
      return 'prepare';
  }
}

/**
 * 前端知识上下文解析器（mock）。后续可在此函数内接 RAG / HTTP，保持签名不变。
 */
export function resolveKnowledgeSupport(
  input: KnowledgeContextInput,
): ResolvedKnowledgeSupport {
  const stage = effectiveStage(input);
  const flowBundle = mergeFlowSupport(
    getFlowSupportByStage(stage),
    input.actionKey ? getFlowSupportByAction(input.actionKey) : null,
  );

  const groups: SupportSnippet[][] = [];

  switch (input.page) {
    case 'product_detail': {
      if (input.goodsId) groups.push(getStrategySupportByGoodsId(input.goodsId));
      if (input.problemKey)
        groups.push(getStrategySupportByProblem(input.problemKey));
      if (input.rootCauseKey)
        groups.push(getStrategySupportByRootCauseKey(input.rootCauseKey));
      if (input.strategyKey)
        groups.push(getStrategySupportByStrategyKey(input.strategyKey));
      break;
    }
    case 'product_action_board': {
      if (input.goodsId) groups.push(getStrategySupportByGoodsId(input.goodsId));
      if (input.problemKey)
        groups.push(getStrategySupportByProblem(input.problemKey));
      if (input.rootCauseKey)
        groups.push(getStrategySupportByRootCauseKey(input.rootCauseKey));
      break;
    }
    case 'action_approval': {
      if (input.goodsId) groups.push(getStrategySupportByGoodsId(input.goodsId));
      const cat = input.category?.trim();
      if (cat) groups.push(getStrategySupportByCategory(cat));
      if (input.problemKey)
        groups.push(getStrategySupportByProblem(input.problemKey));
      if (input.riskKey) groups.push(getStrategySupportByRiskKey(input.riskKey));
      break;
    }
    case 'replay_explain': {
      if (input.goodsId) groups.push(getStrategySupportByGoodsId(input.goodsId));
      if (input.problemKey)
        groups.push(getStrategySupportByProblem(input.problemKey));
      if (input.strategyKey)
        groups.push(getStrategySupportByStrategyKey(input.strategyKey));
      groups.push(getStrategySupportByReplayContext(!!input.versionDiff));
      break;
    }
    case 'today_command': {
      const cat = input.category?.trim() || 'default';
      groups.push(getStrategySupportByCategory(cat));
      if (input.goodsId) groups.push(getStrategySupportByGoodsId(input.goodsId));
      groups.push(
        getStrategySupportByTodayContext({
          signalType: input.signalType ?? 'neutral',
          themeKey: input.themeKey,
        }),
      );
      break;
    }
    case 'execution': {
      groups.push(getStrategySupportByExecutionContext());
      break;
    }
    default:
      break;
  }

  return {
    flowBundle,
    strategySnippets: mergeStrategySnippets(...groups),
  };
}
