import { ListTodo, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import type { InProgressTaskVM } from '../../data/operatorHomeMock';
import { actions } from '../../data/liveCatalog';
import { executions } from '../../data/mockData';
import { mapLegacyActionToPhase, OPERATOR_TASK_PRESENTATION } from '../../data/taskFlow';
import { useTaskFlowOverrides } from '../../contexts/TaskFlowOverrideContext';
import { OperatorSupportHint } from './OperatorSupportHint';
import { inProgressVmToDecisionCard } from '../../data/decisionCards/mapFromOperatorHome';
import { DecisionCardFrame } from '../decisionCards/DecisionCardFrame';
import { TaskStateBadge } from '../taskFlow/TaskStateBadge';
import { useReviewLedger } from '../../contexts/ReviewLedgerContext';

function objectTypeLabelZh(t: InProgressTaskVM['primaryObject']['object_type']): string {
  if (t === 'product') return '商品';
  if (t === 'shop') return '店铺';
  if (t === 'category') return '类目';
  if (t === 'campaign') return '活动';
  if (t === 'channel') return '渠道';
  return '经营对象';
}

type InProgressTaskListProps = {
  items: InProgressTaskVM[];
  status?: 'loading' | 'empty' | 'normal';
  onSupportClick?: (item: InProgressTaskVM) => void;
};

export function InProgressTaskList({
  items,
  status = 'normal',
  onSupportClick,
}: InProgressTaskListProps) {
  const { getOverride } = useTaskFlowOverrides();
  const { openDeposition } = useReviewLedger();

  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-blue-600" />
          最近推进任务
        </CardTitle>
        <CardDescription>进行中的动作与状态；点卡片去审批、回诊断或看落地进度。</CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <ul className="space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="rounded-lg border border-slate-100 p-3 h-28 animate-pulse bg-slate-50" />
            ))}
          </ul>
        ) : status === 'empty' || items.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">暂无进行中任务，请到商品诊断生成动作。</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => {
              const action = it.actionId ? actions.find((a) => a.id === it.actionId) : undefined;
              const exec = it.actionId
                ? executions.find((e) => e.actionId === it.actionId) ?? null
                : null;
              const demo = it.actionId ? getOverride(it.actionId) : undefined;
              const phase = action
                ? mapLegacyActionToPhase(action, exec, demo).phase
                : null;
              const baseCard = inProgressVmToDecisionCard(it);
              const card =
                action && phase
                  ? {
                      ...baseCard,
                      current_status: OPERATOR_TASK_PRESENTATION[phase].labelZh,
                    }
                  : baseCard;
              return (
              <li key={it.id} className="relative space-y-2">
                <div className="flex items-center gap-2 px-0.5 min-h-[1.25rem]">
                  {phase ? <TaskStateBadge phase={phase} /> : null}
                </div>
                <DecisionCardFrame card={card} to={it.hrefPrimary}>
                  {onSupportClick ? (
                    <OperatorSupportHint
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSupportClick(it);
                      }}
                    />
                  ) : null}
                </DecisionCardFrame>
                {it.status === 'completed' ? (
                  <div className="flex justify-end px-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1.5 text-violet-800 border-violet-200 hover:bg-violet-50"
                      onClick={() => {
                        const outcome =
                          action?.actualImpact?.trim() ||
                          action?.expectedImpact?.trim() ||
                          '本任务已闭环，可在执行与结果页核对指标与日志。';
                        openDeposition({
                          source: 'home_task_complete',
                          objectLabel: `${objectTypeLabelZh(it.primaryObject.object_type)} · ${it.primaryObject.object_name}`,
                          actionSummary: it.title,
                          outcomeSummary: outcome,
                          defaultLesson: action?.reason?.slice(0, 280),
                          defaultSuggest: true,
                        });
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      沉淀复盘
                    </Button>
                  </div>
                ) : null}
              </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
