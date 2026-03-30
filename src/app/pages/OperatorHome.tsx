import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
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
import { TaskActionDrawer } from '../components/taskFlow/TaskActionDrawer';
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
  const { getOverride } = useTaskFlowOverrides();
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
          (fromInProgress.productId ? `/products/${fromInProgress.productId}?focus=actions` : undefined),
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
        <QuickTaskEntry examples={model.taskPromptExamples} />
      </header>

      <section aria-label="我在管什么">
        <MemoryProfilePanel
          profile={displayMemory}
          status={shellStatus === 'loading' ? 'loading' : 'normal'}
          onEditPreferences={
            workspacePrefs?.onboardingCompleted ? () => setOnboardingOpen(true) : undefined
          }
        />
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

      <section className="space-y-6" aria-label="今日盘面">
        <TodaySummaryPanel
          data={model.summary}
          status={shellStatus === 'loading' ? 'loading' : shellStatus === 'empty' ? 'empty' : 'normal'}
        />
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">
          <div className="xl:col-span-3 min-w-0">
            <OpportunityRiskBoard
              cards={model.opportunityRiskCards}
              status={blockStatus === 'loading' ? 'loading' : blockStatus === 'empty' ? 'empty' : 'normal'}
              onSupportClick={onCardSupport}
            />
          </div>
          <div className="xl:col-span-2 min-w-0">
            <QuickTaskGrid
              tasks={model.quickTasks}
              status={shellStatus === 'loading' ? 'loading' : 'normal'}
            />
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
        aria-label="推进与建议"
      >
        <InProgressTaskList
          items={model.inProgressTasks}
          status={
            shellStatus === 'loading' ? 'loading' : shellStatus === 'empty' ? 'empty' : 'normal'
          }
          onSupportClick={onTaskSupport}
          onOpenTask={(item) =>
            setSelectedTask({
              actionId: item.actionId,
              productId: item.productId,
              detailHref: item.productId ? `/products/${item.productId}?focus=actions` : undefined,
            })
          }
        />
        <SuggestedActionList
          suggestions={model.suggestedActions}
          status={
            shellStatus === 'loading' ? 'loading' : shellStatus === 'empty' ? 'empty' : 'normal'
          }
          onSupportClick={onSuggestedSupport}
          onOpenTask={(item) =>
            setSelectedTask({
              actionId: item.actionId,
              productId: item.productId,
              detailHref: item.detailHref,
            })
          }
        />
      </section>

      <ReviewDigestPanel recentCompletedTasks={model.recentCompletedTasks} />

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
