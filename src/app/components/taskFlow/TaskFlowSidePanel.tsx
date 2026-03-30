import { Link } from 'react-router';
import type { OperatorTask, TaskFlowCta } from '../../data/taskFlow';
import { getTaskActionLabel, OPERATOR_TASK_PRESENTATION } from '../../data/taskFlow';
import { useTaskFlowOverrides } from '../../contexts/TaskFlowOverrideContext';
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

  const runDemoCta = (cta: TaskFlowCta) => {
    if (cta === 'submit_approval' || cta === 'reject' || cta === 'defer') {
      if (onApprovalCta) {
        onApprovalCta(cta);
        return;
      }
    }
    if (cta === 'fill_inputs') fillTaskInputs({ actionId, source: 'task_detail' });
    if (cta === 'finish_diagnosis') finishTaskDiagnosis({ actionId, source: 'task_detail' });
    if (cta === 'submit_approval') approveTask({ actionId, source: 'task_detail' });
    if (cta === 'reject') rejectTask({ actionId, source: 'task_detail' });
    if (cta === 'defer') deferTask({ actionId, source: 'task_detail', currentStatus: task.status });
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
    if (cta === 'archive') {
      if (task.status === 'needs_takeover') resolveTakeoverToArchived({ actionId, source: 'task_detail' });
      else archiveTask({ actionId, source: 'task_detail' });
    }
  };

  const visibleCtas = task.availableActions;

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
            <div className={heading}>操作区</div>
            <div className={cn('mt-2 flex flex-wrap gap-2', compact && 'gap-1.5')}>
              {visibleCtas.map((cta) => {
                if (cta === 'view_diagnosis' && productId) {
                  return (
                    <Button key={cta} variant="outline" size="sm" className="text-xs h-8" asChild>
                      <Link to={`/products/${productId}?focus=actions`}>
                        {getTaskActionLabel(cta, task.status)}
                      </Link>
                    </Button>
                  );
                }
                const primary =
                  cta === 'fill_inputs' ||
                  cta === 'finish_diagnosis' ||
                  cta === 'submit_approval' ||
                  cta === 'retry' ||
                  cta === 'go_execute' ||
                  cta === 'mark_completed';
                return (
                  <Button
                    key={cta}
                    variant={primary ? 'default' : cta === 'reject' ? 'destructive' : 'outline'}
                    size="sm"
                    className="text-xs h-8"
                    type="button"
                    onClick={() => runDemoCta(cta)}
                  >
                    {getTaskActionLabel(cta, task.status)}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className={cn('border-t border-slate-100 pt-2 mt-1', body)}>
          <p>当前可重新执行：{task.canRetry ? '是' : '否'} · 当前可人工处理：{task.canTakeover ? '是' : '否'}</p>
        </div>
      </div>
    </div>
  );
}
