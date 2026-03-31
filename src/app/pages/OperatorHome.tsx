import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { buildJourneyLinks } from '../data/operatorJourney';
import { loadOperatorHomePageModel } from '../data/operatorHomeMock';
import { listProducts } from '../data/liveCatalog';
import { resolveKnowledgeSupport } from '../data/expertKnowledge/knowledgeContextResolver';
import type { KnowledgeContextInput } from '../data/expertKnowledge/knowledgeContextTypes';
import type { SupportSnippet } from '../data/expertKnowledge';
import { HomeHero } from '../components/operatorHome/HomeHero';
import { QuickTaskEntry } from '../components/operatorHome/QuickTaskEntry';
import { TodaySummaryPanel } from '../components/operatorHome/TodaySummaryPanel';
import { OpportunityRiskBoard } from '../components/operatorHome/OpportunityRiskBoard';
import { QuickTaskGrid } from '../components/operatorHome/QuickTaskGrid';
import { InProgressTaskList } from '../components/operatorHome/InProgressTaskList';
import { MemoryProfilePanel } from '../components/operatorHome/MemoryProfilePanel';
import { OperatorWorkspaceOnboarding } from '../components/operatorHome/OperatorWorkspaceOnboarding';
import {
  getCategoryOptionsFromCatalog,
  loadWorkspacePrefs,
  mergeMemoryWithWorkspace,
  type WorkspacePrefs,
} from '../data/operatorWorkspacePrefs';
import { SuggestedActionList } from '../components/operatorHome/SuggestedActionList';
import { StrategySupportDrawer } from '../components/knowledge/StrategySupportDrawer';
import { ReviewDigestPanel } from '../components/review/ReviewDigestPanel';
import { OperatorJourneyBar } from '../components/operatorJourney/OperatorJourneyBar';
import { TaskActionDrawer } from '../components/taskFlow/TaskActionDrawer';
import { TaskStateBadge } from '../components/taskFlow/TaskStateBadge';
import { useOperatorJourney } from '../contexts/OperatorJourneyContext';
import { useTaskFlowOverrides } from '../contexts/TaskFlowOverrideContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import type {
  InProgressTaskVM,
  OpportunityRiskCardVM,
  SuggestedActionVM,
} from '../data/operatorHomeMock';

function categoryForProduct(productId?: string): string | undefined {
  if (!productId) return undefined;
  return listProducts().find((p) => p.id === productId)?.category;
}

/** 经营搭档首页（英文：OperatorHome / OperatorWorkbenchHome） */
export function OperatorHome() {
  const navigate = useNavigate();
  const { getOverride } = useTaskFlowOverrides();
  const { activeActionId, startJourney, setActiveAction } = useOperatorJourney();
  const [shellStatus, setShellStatus] = useState<'loading' | 'empty' | 'normal'>('loading');
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [strategySnippets, setStrategySnippets] = useState<SupportSnippet[]>([]);
  const [strategyContextHint, setStrategyContextHint] = useState<string | undefined>();
  /** `undefined`：尚未从 localStorage 读取；`null` 或无完成标记：可视为未完成引导 */
  const [workspacePrefs, setWorkspacePrefs] = useState<WorkspacePrefs | null | undefined>(
    undefined,
  );
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    actionId?: string;
    productId?: string;
    detailHref?: string;
  } | null>(null);
  const onboardingAutoOpenedRef = useRef(false);

  const { model, isEmpty } = useMemo(() => loadOperatorHomePageModel(getOverride), [getOverride]);
  const categoryOptions = useMemo(() => getCategoryOptionsFromCatalog(), []);
  const displayMemory = useMemo(
    () => mergeMemoryWithWorkspace(model.memory, workspacePrefs ?? null),
    [model.memory, workspacePrefs],
  );
  const selectedTaskPayload = useMemo(() => {
    if (!selectedTask?.actionId) return null;
    const fromInProgress = model.inProgressTasks.find((item) => item.actionId === selectedTask.actionId);
    if (fromInProgress) {
      return {
        task: fromInProgress.task,
        actionId: fromInProgress.actionId,
        productId: selectedTask.productId ?? fromInProgress.productId,
        detailHref:
          selectedTask.detailHref ??
          buildJourneyLinks({
            actionId: fromInProgress.actionId,
            productId: fromInProgress.productId,
          }).diagnosis,
      };
    }
    const fromSuggested = model.suggestedActions.find((item) => item.actionId === selectedTask.actionId);
    if (fromSuggested) {
      return {
        task: fromSuggested.task,
        actionId: fromSuggested.actionId,
        productId: selectedTask.productId ?? fromSuggested.productId,
        detailHref: selectedTask.detailHref ?? fromSuggested.detailHref,
      };
    }
    return null;
  }, [model.inProgressTasks, model.suggestedActions, selectedTask]);
  const focusTaskPayload = useMemo(() => {
    const activeTask =
      model.inProgressTasks.find((item) => item.actionId === activeActionId) ??
      model.suggestedActions.find((item) => item.actionId === activeActionId);
    const firstTask =
      activeTask ??
      model.inProgressTasks.find((item) => item.task.status !== 'completed') ??
      model.suggestedActions[0];
    if (!firstTask) return null;
    const detailHref = buildJourneyLinks({
      actionId: firstTask.actionId,
      productId: firstTask.productId,
    }).diagnosis;
    return {
      title: firstTask.title,
      context:
        'context' in firstTask
          ? firstTask.context
          : `${firstTask.primaryObject.object_name} · ${firstTask.priorityHint ?? '优先处理'}`,
      task: firstTask.task,
      actionId: firstTask.actionId,
      productId: firstTask.productId,
      detailHref,
    };
  }, [activeActionId, model.inProgressTasks, model.suggestedActions]);

  const openFocusJourney = () => {
    if (!focusTaskPayload?.actionId || !focusTaskPayload.detailHref) return;
    startJourney({
      actionId: focusTaskPayload.actionId,
      productId: focusTaskPayload.productId,
    });
    navigate(focusTaskPayload.detailHref);
  };

  const openHomeStrategy = (contextHint: string, patch: Partial<KnowledgeContextInput>) => {
    const r = resolveKnowledgeSupport({
      page: 'operator_home',
      ...patch,
    });
    setStrategySnippets(r.strategySnippets);
    setStrategyContextHint(contextHint);
    setStrategyOpen(true);
  };

  const onCardSupport = (c: OpportunityRiskCardVM) => {
    openHomeStrategy(c.title, {
      goodsId: c.productId,
      category: categoryForProduct(c.productId),
      signalType: c.kind === 'opportunity' ? 'opportunity' : 'risk',
      themeKey: c.id,
    });
  };

  const onTaskSupport = (it: InProgressTaskVM) => {
    openHomeStrategy(it.title, {
      goodsId: it.productId,
      category: categoryForProduct(it.productId),
      themeKey: it.actionId ?? it.id,
      signalType: 'neutral',
    });
  };

  const onSuggestedSupport = (a: SuggestedActionVM) => {
    openHomeStrategy(a.title, {
      goodsId: a.productId,
      category: categoryForProduct(a.productId),
      themeKey: a.actionId ?? a.id,
      signalType: a.priorityHint === '高' ? 'risk' : 'opportunity',
    });
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setShellStatus(isEmpty ? 'empty' : 'normal');
    });
    return () => cancelAnimationFrame(id);
  }, [isEmpty]);

  useEffect(() => {
    setWorkspacePrefs(loadWorkspacePrefs());
  }, []);

  useEffect(() => {
    if (workspacePrefs === undefined) return;
    if (shellStatus === 'loading') return;
    if (workspacePrefs?.onboardingCompleted) return;
    if (onboardingAutoOpenedRef.current) return;
    onboardingAutoOpenedRef.current = true;
    setOnboardingOpen(true);
  }, [workspacePrefs, shellStatus]);

  const blockStatus =
    shellStatus === 'loading' ? 'loading' : shellStatus === 'empty' ? 'empty' : 'normal';

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 pb-12 bg-gray-50/50 min-h-full">
      <header className="space-y-3 border-b border-slate-200/80 pb-6">
        <HomeHero userName={model.userName} tagline={model.heroTagline} />
      </header>

      <section aria-label="会前检查">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">会前检查</div>
                <p className="mt-1 text-sm text-slate-600">
                  只确认两件事，故事线就能顺着讲下去。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-500">商品队列</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {shellStatus === 'empty' ? '还没加载' : '已加载，可直接演示'}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {shellStatus === 'empty'
                      ? '先去商品诊断加载队列，首页主线才会完整。'
                      : '今日重点、动作拍板和结果复盘都能顺着这批商品继续往下讲。'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-500">经营记忆</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">仅保存在本机</div>
                  <p className="mt-1 text-xs text-slate-500">
                    这部分是演示用偏好，不是公司的主数据，也不会上传服务器。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {shellStatus === 'empty' ? (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-slate-800 font-medium">暂无商品队列数据</p>
            <p className="text-sm text-slate-600">
              请先到商品操盘台加载队列，首页「今日重点」与机会/风险卡才会满血展示演示主线。
            </p>
            <p className="text-xs text-slate-500">下方快捷入口仍可在无队列时浏览各处理台。</p>
            <Button asChild>
              <Link to="/products">前往商品操盘台</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-6" aria-label="今天先看什么">
        <TodaySummaryPanel
          data={model.summary}
          status={shellStatus === 'loading' ? 'loading' : shellStatus === 'empty' ? 'empty' : 'normal'}
        />
      </section>

      {focusTaskPayload ? (
        <section aria-label="现在先做什么">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="px-6 py-6 bg-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">现在先做什么</span>
                    <TaskStateBadge phase={focusTaskPayload.task.status} />
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    {focusTaskPayload.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{focusTaskPayload.context}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {focusTaskPayload.task.nextStepHint}
                  </p>
                  <OperatorJourneyBar
                    className="mt-5"
                    task={focusTaskPayload.task}
                    actionId={focusTaskPayload.actionId}
                    productId={focusTaskPayload.productId}
                  />
                  <div className="mt-5 flex flex-wrap gap-2">
                    {focusTaskPayload.detailHref ? (
                      <Button type="button" onClick={openFocusJourney}>
                        进入商品诊断
                      </Button>
                    ) : null}
                    {focusTaskPayload.task.nextRouteHint &&
                    focusTaskPayload.task.nextRouteHint.href !== focusTaskPayload.detailHref ? (
                      <Button variant="outline" asChild>
                        <Link to={focusTaskPayload.task.nextRouteHint.href}>
                          {focusTaskPayload.task.nextRouteHint.label}
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant={focusTaskPayload.detailHref ? 'outline' : 'default'}
                      onClick={() =>
                        setSelectedTask({
                          actionId: focusTaskPayload.actionId,
                          productId: focusTaskPayload.productId,
                          detailHref: focusTaskPayload.detailHref,
                        })
                      }
                    >
                      打开处理面板
                    </Button>
                  </div>
                </div>
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 lg:border-l lg:border-t-0">
                  <div className="text-sm font-medium text-slate-500">为什么先处理这条</div>
                  <dl className="mt-4 space-y-4 text-sm">
                    <div>
                      <dt className="text-slate-500">当前状态</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {focusTaskPayload.task.statusLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">当前卡点</dt>
                      <dd className="mt-1 text-slate-700">{focusTaskPayload.task.blockReason}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">最近更新时间</dt>
                      <dd className="mt-1 text-slate-700">{focusTaskPayload.task.updatedAt}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">当前责任人</dt>
                      <dd className="mt-1 text-slate-700">{focusTaskPayload.task.ownerLabel}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
        aria-label="推进与拍板"
      >
        <InProgressTaskList
          items={model.inProgressTasks}
          status={
            shellStatus === 'loading' ? 'loading' : shellStatus === 'empty' ? 'empty' : 'normal'
          }
          onSupportClick={onTaskSupport}
          onOpenTask={(item) =>
            {
              if (item.actionId) {
                setActiveAction({ actionId: item.actionId, productId: item.productId });
              }
              setSelectedTask({
                actionId: item.actionId,
                productId: item.productId,
                detailHref: buildJourneyLinks({
                  actionId: item.actionId,
                  productId: item.productId,
                }).diagnosis,
              });
            }
          }
        />
        <SuggestedActionList
          suggestions={model.suggestedActions}
          status={
            shellStatus === 'loading' ? 'loading' : shellStatus === 'empty' ? 'empty' : 'normal'
          }
          onSupportClick={onSuggestedSupport}
          onOpenTask={(item) =>
            {
              if (item.actionId) {
                setActiveAction({ actionId: item.actionId, productId: item.productId });
              }
              setSelectedTask({
                actionId: item.actionId,
                productId: item.productId,
                detailHref: buildJourneyLinks({
                  actionId: item.actionId,
                  productId: item.productId,
                }).diagnosis,
              });
            }
          }
        />
      </section>

      <ReviewDigestPanel recentCompletedTasks={model.recentCompletedTasks} />

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start" aria-label="更多盘面">
        <div className="xl:col-span-3 min-w-0">
          <OpportunityRiskBoard
            cards={model.opportunityRiskCards}
            status={blockStatus === 'loading' ? 'loading' : blockStatus === 'empty' ? 'empty' : 'normal'}
            onSupportClick={onCardSupport}
          />
        </div>
        <div className="xl:col-span-2 min-w-0 space-y-6">
          <QuickTaskEntry examples={model.taskPromptExamples} />
          <section aria-label="我在管什么">
            <MemoryProfilePanel
              profile={displayMemory}
              status={shellStatus === 'loading' ? 'loading' : 'normal'}
              onEditPreferences={
                workspacePrefs?.onboardingCompleted ? () => setOnboardingOpen(true) : undefined
              }
            />
          </section>
          <QuickTaskGrid
            tasks={model.quickTasks}
            status={shellStatus === 'loading' ? 'loading' : 'normal'}
          />
        </div>
      </section>

      <StrategySupportDrawer
        open={strategyOpen}
        onClose={() => setStrategyOpen(false)}
        snippets={strategySnippets}
        contextHint={strategyContextHint}
      />

      <OperatorWorkspaceOnboarding
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        categoryOptions={categoryOptions}
        seed={workspacePrefs ?? null}
        onComplete={setWorkspacePrefs}
      />

      <TaskActionDrawer
        open={selectedTaskPayload != null}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
        task={selectedTaskPayload?.task ?? null}
        actionId={selectedTaskPayload?.actionId}
        productId={selectedTaskPayload?.productId}
        detailHref={selectedTaskPayload?.detailHref}
        source="home"
      />
    </div>
  );
}
