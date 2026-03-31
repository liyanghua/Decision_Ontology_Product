import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { buildReviewPrefillFromTask } from '../data/reviewLedgerData';
import { actions as mockActions } from '../data/mockData';
import { buildJourneyLinks } from '../data/operatorJourney';
import { listOperatorTaskRows, type OperatorTaskRow } from '../data/taskFlow';
import { OperatorJourneyBar } from '../components/operatorJourney/OperatorJourneyBar';
import { useOperatorJourney } from '../contexts/OperatorJourneyContext';
import { useTaskFlowOverrides } from '../contexts/TaskFlowOverrideContext';
import { TaskActionPanel } from '../components/taskFlow/TaskActionPanel';
import { TaskFlowSidePanel } from '../components/taskFlow/TaskFlowSidePanel';
import { TaskStateBadge } from '../components/taskFlow/TaskStateBadge';
import { inferPhaseForContext } from '../data/sop/diagnosisFlowSkeleton';
import { resolveKnowledgeSupport } from '../data/expertKnowledge';
import { SopFlowCompactBar } from '../components/knowledge/SopFlowCompactBar';
import { FlowSupportDrawer } from '../components/knowledge/FlowSupportDrawer';
import { useReviewLedger } from '../contexts/ReviewLedgerContext';
import { Button } from '../components/ui/button';

export function ExecutionOutcome() {
  const { openDeposition, getReviewStatus } = useReviewLedger();
  const { getOverride } = useTaskFlowOverrides();
  const { activeActionId, setActiveAction, visitStep } = useOperatorJourney();
  const [searchParams] = useSearchParams();
  const focusedActionId = searchParams.get('actionId')?.trim() || activeActionId;
  const [flowSupportOpen, setFlowSupportOpen] = useState(false);
  const executionRows = useMemo(
    () =>
      listOperatorTaskRows(getOverride).filter((row) =>
        row.execution != null ||
        row.task.status === 'approved' ||
        row.task.status === 'executing' ||
        row.task.status === 'failed' ||
        row.task.status === 'needs_takeover' ||
        row.task.status === 'blocked' ||
        row.task.status === 'completed',
      ),
    [getOverride],
  );
  const focusedRow = useMemo(
    () => (focusedActionId ? executionRows.find((row) => row.action.id === focusedActionId) ?? null : null),
    [executionRows, focusedActionId],
  );
  const orderRows = (rows: OperatorTaskRow[]) =>
    focusedActionId
      ? [...rows].sort((left, right) => {
          const leftRank = left.action.id === focusedActionId ? 0 : 1;
          const rightRank = right.action.id === focusedActionId ? 0 : 1;
          if (leftRank !== rightRank) return leftRank - rightRank;
          return left.task.updatedAt < right.task.updatedAt ? 1 : left.task.updatedAt > right.task.updatedAt ? -1 : 0;
        })
      : rows;
  const runningExecutions = orderRows(
    executionRows.filter((row) => row.task.status === 'approved' || row.task.status === 'executing'),
  );
  const completedExecutions = executionRows.filter((row) => row.task.status === 'completed');
  const failedExecutions = orderRows(
    executionRows.filter((row) =>
      row.task.status === 'failed' ||
      row.task.status === 'needs_takeover' ||
      row.task.status === 'blocked',
    ),
  );
  const orderedCompletedExecutions = orderRows(completedExecutions);

  const executionSopPhase = useMemo(
    () =>
      inferPhaseForContext({
        route: 'execution',
        hasGoodsId: true,
        hasMetricsRow: true,
        hasStructuredDiagnosis: true,
        pendingActionCount: 0,
      }),
    [],
  );

  const executionResolved = useMemo(
    () =>
      resolveKnowledgeSupport({
        page: 'execution',
        stageKey: executionSopPhase,
      }),
    [executionSopPhase],
  );
  const sections = [
    {
      key: 'running',
      title: '正在推进',
      description: '已经放行并进入落地窗口，优先盯进度和结果回传。',
      items: runningExecutions,
    },
    {
      key: 'recovery',
      title: '需要恢复',
      description: '这几条已经卡住，优先判断是重新执行还是转人工处理。',
      items: failedExecutions,
    },
    {
      key: 'completed',
      title: '已处理完成',
      description: '已经闭环的任务，顺手看结果并把经验留下。',
      items: orderedCompletedExecutions,
    },
  ] as const;

  useEffect(() => {
    if (!focusedRow) return;
    setActiveAction({
      actionId: focusedRow.action.id,
      productId: focusedRow.action.productId || undefined,
    });
    visitStep({
      actionId: focusedRow.action.id,
      productId: focusedRow.action.productId || undefined,
      step: 'execution',
    });
  }, [focusedRow, setActiveAction, visitStep]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">推进结果</h1>
        <p className="text-gray-600">
          把放行后的任务按“正在推进、需要恢复、已处理完成”看清楚，顺着主线继续讲结果、恢复和经验沉淀。
        </p>
      </div>

      <div className="mb-8 space-y-2">
        <SopFlowCompactBar
          stageKey={executionSopPhase}
          onOpenFlow={() => setFlowSupportOpen(true)}
        />
        {focusedRow ? (
          <OperatorJourneyBar
            task={focusedRow.task}
            actionId={focusedRow.action.id}
            productId={focusedRow.action.productId || undefined}
            reviewStatus={getReviewStatus({
              actionId: focusedRow.task.sourceRefs.actionId,
              executionId: focusedRow.task.sourceRefs.executionId,
              productId: focusedRow.task.sourceRefs.productId,
              taskId: focusedRow.task.id,
            })}
          />
        ) : null}
        <p className="text-xs text-gray-600">
          需要提醒时，可打开右侧处理支持看看推进提醒和风险检查。
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">正在推进</div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-blue-600">{runningExecutions.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">需要恢复</div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-red-600">{failedExecutions.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">已处理完成</div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-green-600">{completedExecutions.length}</div>
        </div>
      </div>

      {/* Executions List */}
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.key} className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {section.title} ({section.items.length})
              </h2>
              <p className="text-sm text-slate-600">{section.description}</p>
            </div>
            {section.items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                当前没有“{section.title}”的任务。
              </div>
            ) : null}
            <div className="space-y-4">
              {section.items.map(({ execution, action: actionRow, task }) => {
          const executionView = execution ?? {
            id: `${actionRow.id}-pending-execution`,
            actionId: actionRow.id,
            actionName: actionRow.name,
            productName: actionRow.productName,
            status: task.status === 'approved' ? 'pending' : 'running',
            progress: task.status === 'approved' ? 0 : 45,
            startTime: actionRow.approvedAt || actionRow.createdAt,
            expectedOutcome: actionRow.expectedImpact || '等待进入本轮推进窗口',
            actualOutcome: actionRow.actualImpact,
            endTime: actionRow.completedAt,
            logs: [],
          };
          const journeyLinks = buildJourneyLinks({
            actionId: actionRow.id,
            productId: actionRow.productId || undefined,
          });
          const reviewStatus = getReviewStatus({
            actionId: task.sourceRefs.actionId,
            executionId: task.sourceRefs.executionId,
            productId: task.sourceRefs.productId,
            taskId: task.id,
          });
          return (
          <div
            key={executionView.id}
            className={`bg-white rounded-lg border overflow-hidden ${
              focusedActionId === actionRow.id ? 'border-blue-300 shadow-md shadow-blue-100/60' : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{executionView.actionName}</h3>
                    {task.status === 'executing' ? (
                      <Play className="w-4 h-4 text-blue-600 shrink-0" aria-hidden />
                    ) : null}
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden />
                    ) : null}
                    {task.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden />
                    ) : null}
                    <TaskStateBadge phase={task.status} />
                    {task.status === 'completed' && reviewStatus !== 'none' ? (
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                        {reviewStatus === 'candidate' ? '已进入经验候选区' : '已形成复盘'}
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{executionView.productName}</span>
                    <span>·</span>
                    <span>开始时间: {executionView.startTime}</span>
                    {executionView.endTime && (
                      <>
                        <span>·</span>
                        <span>结束时间: {executionView.endTime}</span>
                      </>
                    )}
                  </div>
                </div>

                {(executionView.status === 'running' || task.status === 'executing') && (
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-blue-600">{executionView.progress}%</div>
                    <div className="text-sm text-gray-600">进度</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {task.status === 'executing' && (
                <div className="mb-4">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${executionView.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Expected vs Actual Outcome */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">预期效果</div>
                  <div className="text-sm text-gray-900">{executionView.expectedOutcome}</div>
                </div>
                
                {executionView.actualOutcome && (
                  <div className={`rounded-lg p-4 ${
                    task.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className={`text-sm mb-2 ${
                      task.status === 'completed' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      实际结果
                    </div>
                    <div className={`text-sm ${
                      task.status === 'completed' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {executionView.actualOutcome}
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Records */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-3">
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  处理记录 ({executionView.logs.length} 条)
                </summary>
                
                <div className="bg-gray-900 rounded-lg p-4 space-y-2 font-mono text-sm">
                  {executionView.logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <span className="text-gray-500">{log.timestamp}</span>
                      <span className={`flex-shrink-0 ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warning' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className={
                        log.level === 'error' ? 'text-red-300' :
                        log.level === 'warning' ? 'text-yellow-300' :
                        'text-gray-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </details>

              <div className="mt-4">
                <TaskFlowSidePanel
                  task={task}
                  actionId={actionRow.id}
                  productId={actionRow.productId || undefined}
                  compact
                  showActions={false}
                />
              </div>

              {task.status === 'failed' || task.status === 'needs_takeover' || task.latestRecoveryStateLabel ? (
                <div className="mt-4">
                  <TaskActionPanel
                    task={task}
                    actionId={actionRow.id}
                    productId={actionRow.productId || undefined}
                    detailHref={buildJourneyLinks({
                      actionId: actionRow.id,
                      productId: actionRow.productId || undefined,
                    }).diagnosis}
                    source="execution"
                    title="恢复与人工处理"
                  />
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                {task.status === 'executing' && (
                  <button type="button" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    暂停执行
                  </button>
                )}
                {task.status === 'failed' && (
                  <>
                    <Link
                      to={journeyLinks.replay}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      查看结果复盘
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </>
                )}
                {task.status === 'completed' && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      {reviewStatus !== 'none' ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800">
                          <Sparkles className="w-4 h-4" />
                          {reviewStatus === 'candidate' ? '已进入经验候选区' : '已形成复盘'}
                        </span>
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-1.5 text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200"
                        onClick={() => openDeposition(buildReviewPrefillFromTask(task))}
                      >
                        <Sparkles className="w-4 h-4" />
                        形成经验
                      </Button>
                    </div>
                    <Link
                      to={journeyLinks.replay}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      查看结果复盘
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </>
                )}
                <button type="button" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  导出处理记录
                </button>
              </div>
            </div>
          </div>
          );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Recent Completed Summary */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">最近完成动作效果摘要</h2>
        
        <div className="space-y-3">
          {mockActions.filter(a => a.status === 'completed').map((action) => {
            const reviewStatus = getReviewStatus({
              actionId: action.id,
              productId: action.productId,
            });
            return (
            <div
              key={action.id}
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 mb-1">{action.name}</div>
                <div className="text-sm text-gray-600">{action.productName}</div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <div className="text-right">
                  <div className="text-sm text-green-600 mb-1">✓ 效果达到预期</div>
                  <div className="text-sm text-gray-600">{action.actualImpact}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {reviewStatus !== 'none' ? (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-800">
                      <Sparkles className="w-3.5 h-3.5" />
                      {reviewStatus === 'candidate' ? '已进入经验候选区' : '已形成复盘'}
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5 border-violet-200 text-violet-900 hover:bg-violet-50"
                    onClick={() =>
                      openDeposition({
                        source: 'execution_complete',
                        objectLabel: `商品 · ${action.productName}`,
                        originalProblem: action.reason,
                        actionSummary: action.name,
                        actualResult:
                          action.actualImpact?.trim() ||
                          action.expectedImpact ||
                          '效果摘要如上，可补充经营侧解读。',
                        defaultSuggest: true,
                        taskRefs: {
                          actionId: action.id,
                          productId: action.productId,
                        },
                      })
                    }
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    形成经验
                  </Button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <FlowSupportDrawer
        open={flowSupportOpen}
        onClose={() => setFlowSupportOpen(false)}
        flowBundle={executionResolved.flowBundle}
      />
    </div>
  );
}
