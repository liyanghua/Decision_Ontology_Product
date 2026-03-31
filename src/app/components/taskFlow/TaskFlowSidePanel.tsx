import { Link } from 'react-router';
import type { OperatorTask, TaskFlowCta } from '../../data/taskFlow';
import { getTaskActionLabel, OPERATOR_TASK_PRESENTATION } from '../../data/taskFlow';
import { useOperatorJourney } from '../../contexts/OperatorJourneyContext';
import { useTaskFlowOverrides } from '../../contexts/TaskFlowOverrideContext';
import { buildReviewPrefillFromTask } from '../../data/reviewLedgerData';
import { useReviewLedger } from '../../contexts/ReviewLedgerContext';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

type TaskFlowSidePanelProps = {
  task: OperatorTask;
  actionId: string;
  productId?: string;
  compact?: boolean;
  className?: string;
  showActions?: boolean;
  /** 当 presentation 含审批类按钮时，由审批页注入 */
  onApprovalCta?: (cta: TaskFlowCta) => void;
};

export function TaskFlowSidePanel({
  task,
  actionId,
  productId,
  compact = false,
  className = '',
  showActions = true,
  onApprovalCta,
}: TaskFlowSidePanelProps) {
  const { openDeposition, getReviewStatus } = useReviewLedger();
  const { setActiveAction, recordDecision } = useOperatorJourney();
  const {
    fillTaskInputs,
    finishTaskDiagnosis,
    approveTask,
    rejectTask,
    deferTask,
    startExecution,
    retryTask,
    startTakeover,
    resolveTakeoverToExecuting,
    resolveTakeoverToCompleted,
    resolveTakeoverToArchived,
    markTaskCompleted,
    archiveTask,
  } = useTaskFlowOverrides();
  const pres = OPERATOR_TASK_PRESENTATION[task.status];
  const pad = compact ? 'p-3 gap-2' : 'p-4 gap-3';
  const heading = compact ? 'text-xs font-semibold text-slate-700' : 'text-sm font-semibold text-slate-800';
  const body = compact ? 'text-[11px] text-slate-600 leading-relaxed' : 'text-xs text-slate-600 leading-relaxed';
  const taskReviewStatus = getReviewStatus({
    actionId: task.sourceRefs.actionId,
    executionId: task.sourceRefs.executionId,
    productId: task.sourceRefs.productId,
    taskId: task.id,
  });

  const runDemoCta = (cta: TaskFlowCta) => {
    setActiveAction({ actionId, productId });
    if (cta === 'submit_approval' || cta === 'reject' || cta === 'defer') {
      if (onApprovalCta) {
        onApprovalCta(cta);
        return;
      }
    }
    if (cta === 'fill_inputs') fillTaskInputs({ actionId, source: 'task_detail' });
    if (cta === 'finish_diagnosis') finishTaskDiagnosis({ actionId, source: 'task_detail' });
    if (cta === 'submit_approval') {
      approveTask({ actionId, source: 'task_detail' });
      recordDecision({ actionId, productId, outcome: 'approved' });
    }
    if (cta === 'reject') {
      rejectTask({ actionId, source: 'task_detail' });
      recordDecision({ actionId, productId, outcome: 'rejected' });
    }
    if (cta === 'defer') {
      deferTask({ actionId, source: 'task_detail', currentStatus: task.status });
      recordDecision({ actionId, productId, outcome: 'deferred' });
    }
    if (cta === 'go_execute') {
      if (task.status === 'needs_takeover') resolveTakeoverToExecuting({ actionId, source: 'task_detail' });
      else startExecution({ actionId, source: 'task_detail' });
    }
    if (cta === 'retry') retryTask({ actionId, source: 'task_detail' });
    if (cta === 'takeover') startTakeover({ actionId, source: 'task_detail' });
    if (cta === 'mark_completed') {
      if (task.status === 'needs_takeover') resolveTakeoverToCompleted({ actionId, source: 'task_detail' });
      else markTaskCompleted({ actionId, source: 'task_detail' });
    }
    if (cta === 'create_review' && taskReviewStatus === 'none') {
      openDeposition(buildReviewPrefillFromTask(task));
    }
    if (cta === 'archive') {
      if (task.status === 'needs_takeover') resolveTakeoverToArchived({ actionId, source: 'task_detail' });
      else archiveTask({ actionId, source: 'task_detail' });
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm',
        pres.borderClass,
        className,
      )}
    >
      <div className={cn('flex flex-col', pad)}>
        <div>
          <div className={heading}>当前状态</div>
          <p className={cn(body, 'mt-1 font-medium text-slate-800')}>{task.statusLabel}</p>
          {task.retryCount > 0 ? (
            <p className={cn(body, 'mt-0.5 text-slate-500')}>本轮重试次数 · {task.retryCount}</p>
          ) : null}
          {task.latestRecoveryStateLabel ? (
            <p className={cn(body, 'mt-0.5 text-slate-500')}>当前恢复状态 · {task.latestRecoveryStateLabel}</p>
          ) : null}
        </div>

        <div>
          <div className={heading}>为何卡在这里</div>
          <p className={cn(body, 'mt-1')}>{task.blockReason}</p>
        </div>

        <div>
          <div className={heading}>下一步建议</div>
          <p className={cn(body, 'mt-1')}>{task.nextStepHint}</p>
        </div>

        <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-2')}>
          <div>
            <div className={heading}>责任人</div>
            <p className={cn(body, 'mt-1')}>{task.ownerLabel}</p>
          </div>
          <div>
            <div className={heading}>最近更新时间</div>
            <p className={cn(body, 'mt-1')}>{task.updatedAt}</p>
          </div>
        </div>

        {showActions ? (
          <div>
            <div className={heading}>现在可以做什么</div>
            <div className={cn('mt-2 flex flex-wrap gap-2', compact && 'gap-1.5')}>
              {task.primaryAction && task.primaryAction !== 'create_review' ? (
                task.primaryAction === 'view_diagnosis' && productId ? (
                  <Button variant="default" size="sm" className="text-xs h-8" asChild>
                    <Link to={`/products/${productId}?focus=actions`}>
                      {getTaskActionLabel(task.primaryAction, task.status)}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs h-8"
                    type="button"
                    onClick={() => runDemoCta(task.primaryAction!)}
                  >
                    {getTaskActionLabel(task.primaryAction, task.status)}
                  </Button>
                )
              ) : null}
              {task.secondaryActions.map((cta) => {
                if (cta === 'view_diagnosis' && productId) {
                  return (
                    <Button key={cta} variant="outline" size="sm" className="text-xs h-8" asChild>
                      <Link to={`/products/${productId}?focus=actions`}>
                        {getTaskActionLabel(cta, task.status)}
                      </Link>
                    </Button>
                  );
                }
                return (
                  <Button
                    key={cta}
                    variant={cta === 'reject' ? 'destructive' : 'outline'}
                    size="sm"
                    className="text-xs h-8"
                    type="button"
                    onClick={() => runDemoCta(cta)}
                  >
                    {getTaskActionLabel(cta, task.status)}
                  </Button>
                );
              })}
              {task.primaryAction === 'create_review' && taskReviewStatus === 'none' ? (
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs h-8"
                  type="button"
                  onClick={() => runDemoCta(task.primaryAction)}
                >
                  {getTaskActionLabel(task.primaryAction, task.status)}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {task.nextRouteHint ? (
          <div className={cn('border-t border-slate-100 pt-2 mt-1', body)}>
            <p className="mb-2">做完这一步后，建议顺着主线继续往下走。</p>
            <Button variant="outline" size="sm" className="text-xs h-8" asChild>
              <Link to={task.nextRouteHint.href}>{task.nextRouteHint.label}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
