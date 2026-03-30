import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, CheckCircle2, Clock3, RefreshCw, UserCog } from 'lucide-react';
import { buildReviewPrefillFromTask } from '../../data/reviewLedgerData';
import {
  getTaskActionLabel,
  type OperatorTask,
  type TaskAction,
  type TaskActionSource,
} from '../../data/taskFlow';
import { useTaskFlowOverrides } from '../../contexts/TaskFlowOverrideContext';
import { useReviewLedger } from '../../contexts/ReviewLedgerContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';
import { TaskTimelineFeed } from './TaskTimelineFeed';

type TaskActionPanelProps = {
  task: OperatorTask;
  actionId: string;
  productId?: string;
  detailHref?: string;
  source?: TaskActionSource;
  className?: string;
  showTimeline?: boolean;
  title?: string;
};

function summaryCards(task: OperatorTask) {
  return [
    task.latestApprovalDecision
      ? {
          id: 'approval',
          icon: Clock3,
          label:
            task.latestApprovalDecision.decision === 'approved'
              ? '最新拍板'
              : task.latestApprovalDecision.decision === 'rejected'
                ? '最新驳回'
                : '最新暂缓',
          value: `${task.latestApprovalDecision.actorLabel} · ${task.latestApprovalDecision.at}`,
        }
      : null,
    task.latestRecoveryStateLabel
      ? {
          id: 'recovery',
          icon: RefreshCw,
          label: '恢复状态',
          value: task.latestRecoveryStateLabel,
        }
      : null,
    task.activeTakeover
      ? {
          id: 'takeover',
          icon: UserCog,
          label: '人工处理',
          value: `${task.activeTakeover.actorLabel} 已接手`,
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    icon: typeof Clock3;
    label: string;
    value: string;
  }>;
}

export function TaskActionPanel({
  task,
  actionId,
  productId,
  detailHref,
  source = 'task_detail',
  className,
  showTimeline = true,
  title = '处理动作',
}: TaskActionPanelProps) {
  const [note, setNote] = useState('');
  const { openDeposition, getReviewStatus, getLatestReview } = useReviewLedger();
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

  const cards = useMemo(() => summaryCards(task), [task]);
  const resolvedDetailHref =
    detailHref || (productId ? `/products/${productId}?focus=actions` : undefined);
  const taskReviewStatus = getReviewStatus({
    actionId: task.sourceRefs.actionId,
    executionId: task.sourceRefs.executionId,
    productId: task.sourceRefs.productId,
    taskId: task.id,
  });
  const latestReview = getLatestReview({
    actionId: task.sourceRefs.actionId,
    executionId: task.sourceRefs.executionId,
    productId: task.sourceRefs.productId,
    taskId: task.id,
  });

  const runAction = (action: TaskAction) => {
    const payload = {
      actionId,
      note,
      source,
      currentStatus: task.status,
    } as const;

    if (action === 'fill_inputs') fillTaskInputs(payload);
    if (action === 'finish_diagnosis') finishTaskDiagnosis(payload);
    if (action === 'submit_approval') approveTask(payload);
    if (action === 'reject') rejectTask(payload);
    if (action === 'defer') deferTask(payload);
    if (action === 'go_execute') {
      if (task.status === 'needs_takeover') resolveTakeoverToExecuting(payload);
      else startExecution(payload);
    }
    if (action === 'retry') retryTask(payload);
    if (action === 'takeover') startTakeover(payload);
    if (action === 'mark_completed') {
      if (task.status === 'needs_takeover') resolveTakeoverToCompleted(payload);
      else markTaskCompleted(payload);
    }
    if (action === 'archive') {
      if (task.status === 'needs_takeover') resolveTakeoverToArchived(payload);
      else archiveTask(payload);
    }
    setNote('');
  };

  return (
    <section className={cn('space-y-4', className)}>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            不用填复杂流程单，直接在这里拍板、继续推进，或者转人工处理。
          </p>
        </div>

        <div className="space-y-4 px-4 py-4">
          {cards.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Icon className="h-3.5 w-3.5" />
                      {card.label}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900">{card.value}</div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <AlertCircle className="h-3.5 w-3.5" />
              当前建议
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{task.nextStepHint}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600" htmlFor={`task-note-${actionId}`}>
              处理备注
            </label>
            <Textarea
              id={`task-note-${actionId}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="可选：补一句为什么批准、为什么暂缓，或记录人工处理判断。"
              className="min-h-24 bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {task.availableActions.map((action) => {
              if (action === 'view_diagnosis' && resolvedDetailHref) {
                return (
                  <Button key={action} variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <Link to={resolvedDetailHref}>{getTaskActionLabel(action, task.status)}</Link>
                  </Button>
                );
              }

              const variant =
                action === 'reject'
                  ? 'destructive'
                  : action === 'defer' || action === 'takeover' || action === 'archive'
                    ? 'outline'
                    : 'default';

              return (
                <Button
                  key={action}
                  type="button"
                  variant={variant}
                  size="sm"
                  className={cn(
                    'h-8 text-xs',
                    action === 'mark_completed' && 'bg-emerald-600 hover:bg-emerald-700',
                  )}
                  onClick={() => runAction(action)}
                >
                  {action === 'mark_completed' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : null}
                  {getTaskActionLabel(action, task.status)}
                </Button>
              );
            })}
          </div>

          {task.status === 'completed' ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-violet-700">复盘沉淀</div>
                  <p className="mt-1 text-sm leading-6 text-violet-950">
                    {latestReview
                      ? latestReview.lesson
                      : '这轮已经处理完成，顺手形成复盘，后续类似问题就能更快参考这次做法。'}
                  </p>
                </div>
                <div className="shrink-0">
                  {taskReviewStatus === 'none' ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs bg-violet-700 hover:bg-violet-800"
                      onClick={() => openDeposition(buildReviewPrefillFromTask(task))}
                    >
                      形成复盘
                    </Button>
                  ) : (
                    <span className="rounded-full border border-violet-200 bg-white px-2 py-1 text-[11px] font-medium text-violet-700">
                      {taskReviewStatus === 'candidate' ? '已进入经验候选区' : '已形成复盘'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showTimeline ? <TaskTimelineFeed task={task} /> : null}
    </section>
  );
}
