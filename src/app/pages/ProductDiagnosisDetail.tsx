import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router';
import { 
  ArrowLeft, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  History,
  X,
  Info,
  Target,
  FileText,
  ShieldAlert,
  Calendar,
  ChevronRight,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { products, adsFactCatalog, availableStatDatesByProductId, listProducts } from '../data/liveCatalog';
import {
  getDetailMetricCells,
  listMissingDetailKeys,
  missingDetailLabels,
  diagnosisGradeToLevel,
  riskLevelLabelZh,
} from '../data/adapters/detailViewMetrics';
import { parseImprovementActionCards } from '../data/adapters/improvementActionParse';
import { splitInsightBullets, splitHighlightCards } from '../data/adapters/diagnosisContentParse';
import { buildReviewPrefillFromTask } from '../data/reviewLedgerData';
import { inferPhaseForContext } from '../data/sop/diagnosisFlowSkeleton';
import { inferProblemKeyFromText, resolveKnowledgeSupport } from '../data/expertKnowledge';
import { SopFlowCompactBar } from '../components/knowledge/SopFlowCompactBar';
import { FlowSupportDrawer } from '../components/knowledge/FlowSupportDrawer';
import { StrategySupportDrawer } from '../components/knowledge/StrategySupportDrawer';
import { StrategySupportTrigger } from '../components/knowledge/StrategySupportTrigger';
import {
  linesToDiagnosisCards,
  linesToOpportunityCards,
  improvementVmToActionCards,
  strategyToDecisionCards,
  causeToDiagnosisCards,
  displayIssueToDiagnosisCards,
  missingDataToRiskCards,
} from '../data/decisionCards';
import { DecisionCardFrame } from '../components/decisionCards/DecisionCardFrame';
import { executions } from '../data/mockData';
import { listOperatorTaskRows, mapLegacyActionToPhase } from '../data/taskFlow';
import { useTaskFlowOverrides } from '../contexts/TaskFlowOverrideContext';
import { TaskActionDrawer } from '../components/taskFlow/TaskActionDrawer';
import { TaskFlowSidePanel } from '../components/taskFlow/TaskFlowSidePanel';
import { TaskStateBadge } from '../components/taskFlow/TaskStateBadge';
import { useReviewLedger } from '../contexts/ReviewLedgerContext';
import { Button } from '../components/ui/button';
import { appendFromHome } from '../data/operatorHome/operatorObjectSummary';

export function ProductDiagnosisDetail() {
  const { getOverride } = useTaskFlowOverrides();
  const { openDeposition, getLatestReview, getReviewStatus } = useReviewLedger();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { productId } = useParams();
  const statDates = productId ? (availableStatDatesByProductId[productId] ?? []) : [];
  const [selectedStatistDate, setSelectedStatistDate] = useState('');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setSelectedStatistDate('');
      return;
    }
    const next = availableStatDatesByProductId[productId]?.[0] ?? '';
    setSelectedStatistDate(next);
  }, [productId]);

  useEffect(() => {
    if (searchParams.get('focus') !== 'actions') return;
    const t = window.setTimeout(() => {
      document.getElementById('operator-home-actions')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 200);
    return () => window.clearTimeout(t);
  }, [searchParams, productId]);

  const diagnosisVm = useMemo(
    () =>
      productId
        ? adsFactCatalog.getProductDiagnosis(productId, selectedStatistDate || undefined)
        : undefined,
    [productId, selectedStatistDate],
  );

  const product = diagnosisVm?.legacyProduct ?? products.find((p) => p.id === productId);
  const evidence = diagnosisVm?.evidencePack.evidences ?? [];
  const causes = diagnosisVm?.rootCauses ?? [];
  const strategyList = diagnosisVm?.strategies ?? [];
  const productActions = diagnosisVm?.actions ?? [];
  const productActionRows = useMemo(
    () => {
      const baseRows = productActions.map((action) => {
        const execution = executions.find((item) => item.actionId === action.id) ?? null;
        const task = mapLegacyActionToPhase(action, execution, getOverride(action.id)).task;
        return { action, execution, task };
      });
      const prestageRows = listOperatorTaskRows(getOverride)
        .filter(
          (row) => row.sourceKind === 'prestage_seed' && row.action.productId === productId,
        )
        .map((row) => ({
          action: row.action,
          execution: row.execution,
          task: row.task,
        }));

      return [...prestageRows, ...baseRows].sort((a, b) =>
        a.task.updatedAt < b.task.updatedAt ? 1 : a.task.updatedAt > b.task.updatedAt ? -1 : 0,
      );
    },
    [getOverride, productActions, productId],
  );
  const completedProductActionRows = useMemo(
    () => productActionRows.filter((row) => row.task.status === 'completed'),
    [productActionRows],
  );
  const selectedTask = useMemo(() => {
    if (!selectedActionId) return null;
    const row = productActionRows.find((item) => item.action.id === selectedActionId);
    if (!row) return null;
    return {
      task: row.task,
      actionId: row.action.id,
      productId,
    };
  }, [productActionRows, productId, selectedActionId]);
  const structured = diagnosisVm?.structured;

  const productOptions = useMemo(() => listProducts(), []);
  const metricCells = useMemo(
    () => getDetailMetricCells(diagnosisVm?.rawRow ?? {}),
    [diagnosisVm],
  );
  const missingMetricKeys = useMemo(
    () => listMissingDetailKeys(diagnosisVm?.rawRow),
    [diagnosisVm],
  );
  const missingFieldLabels = useMemo(
    () => missingDetailLabels(missingMetricKeys),
    [missingMetricKeys],
  );
  const riskLevel = useMemo(
    () => diagnosisGradeToLevel(diagnosisVm?.diagnosis_grade),
    [diagnosisVm],
  );
  const improvementCards = useMemo(
    () => parseImprovementActionCards(structured?.improvement_suggestions),
    [structured?.improvement_suggestions],
  );
  const conclusionCards = useMemo(
    () => splitHighlightCards(structured?.core_conclusion),
    [structured?.core_conclusion],
  );
  const problemBullets = useMemo(
    () => splitInsightBullets(structured?.problem_analysis),
    [structured?.problem_analysis],
  );
  const growthBullets = useMemo(
    () => splitInsightBullets(structured?.growth_analysis),
    [structured?.growth_analysis],
  );
  const missingDataCards = useMemo(
    () => splitHighlightCards(structured?.missing_data_impact),
    [structured?.missing_data_impact],
  );
  const thoughtBullets = useMemo(
    () => splitInsightBullets(structured?.analysis_thought, 4),
    [structured?.analysis_thought],
  );

  const thoughtDecisionCards = useMemo(() => {
    if (!productId || !product || thoughtBullets.length === 0) return [];
    return linesToDiagnosisCards(productId, product.name, thoughtBullets, '分析思路', riskLevel);
  }, [productId, product, thoughtBullets, riskLevel]);

  const conclusionDecisionCards = useMemo(() => {
    if (!productId || !product || conclusionCards.length === 0) return [];
    return linesToDiagnosisCards(productId, product.name, conclusionCards, '核心结论', riskLevel);
  }, [productId, product, conclusionCards, riskLevel]);

  const problemDecisionCards = useMemo(() => {
    if (!productId || !product || problemBullets.length === 0) return [];
    return linesToDiagnosisCards(productId, product.name, problemBullets, '问题剖析', riskLevel);
  }, [productId, product, problemBullets, riskLevel]);

  const growthDecisionCards = useMemo(() => {
    if (!productId || !product || growthBullets.length === 0) return [];
    return linesToOpportunityCards(productId, product.name, growthBullets);
  }, [productId, product, growthBullets]);

  const improvementDecisionCards = useMemo(() => {
    if (!productId || !product || improvementCards.length === 0) return [];
    return improvementVmToActionCards(productId, product.name, improvementCards);
  }, [productId, product, improvementCards]);

  const missingDecisionCards = useMemo(() => {
    if (!productId || !product || missingDataCards.length === 0) return [];
    return missingDataToRiskCards(productId, product.name, missingDataCards);
  }, [productId, product, missingDataCards]);

  const issueStepCards = useMemo(() => {
    if (!productId || !product) return [];
    const items = problemBullets.length > 0 ? problemBullets : product.issues;
    if (items.length === 0) return [];
    return displayIssueToDiagnosisCards(productId, product.name, items);
  }, [productId, product, problemBullets]);

  const diagnosisReviewPrefill = useMemo(() => {
    if (!product) return null;
    const latestCompletedTask = completedProductActionRows[0]?.task;
    const done = completedProductActionRows.map((row) => row.action);
    const actionSummary =
      done.length > 0
        ? done.map((a) => a.name).join('、')
        : productActions.length > 0
          ? '动作与策略见上文步骤'
          : '本轮以诊断结论为主';
    const actualResult =
      improvementCards[0]?.expectedMetric?.trim() ||
      improvementCards[0]?.validationNote?.trim() ||
      improvementCards[0]?.title?.trim() ||
      (product.diagnosisBrief?.trim() ? product.diagnosisBrief.slice(0, 200) : '') ||
      '请结合上文「预期效果」与指标，填写实际结果与体会。';
    if (latestCompletedTask) {
      return buildReviewPrefillFromTask(latestCompletedTask, {
        source: 'diagnosis_complete',
        objectLabel: `商品 · ${product.name}`,
        originalProblem: problemBullets[0] ?? product.issues?.[0] ?? product.diagnosisBrief,
        actionSummary,
        actualResult,
        defaultLesson: problemBullets[0] ?? growthBullets[0],
      });
    }
    return {
      source: 'diagnosis_complete' as const,
      objectLabel: `商品 · ${product.name}`,
      originalProblem: problemBullets[0] ?? product.issues?.[0] ?? product.diagnosisBrief,
      actionSummary,
      actualResult,
      defaultLesson: problemBullets[0] ?? growthBullets[0],
      taskRefs: { productId: product.id },
    };
  }, [completedProductActionRows, growthBullets, improvementCards, problemBullets, product, productActions]);
  const diagnosisReviewStatus = useMemo(
    () =>
      product
        ? getReviewStatus(
            completedProductActionRows[0]
              ? {
                  actionId: completedProductActionRows[0].action.id,
                  executionId: completedProductActionRows[0].task.sourceRefs.executionId,
                  productId: product.id,
                  taskId: completedProductActionRows[0].task.id,
                }
              : { productId: product.id },
          )
        : 'none',
    [completedProductActionRows, getReviewStatus, product],
  );
  const latestDiagnosisReview = useMemo(
    () =>
      product
        ? getLatestReview(
            completedProductActionRows[0]
              ? {
                  actionId: completedProductActionRows[0].action.id,
                  executionId: completedProductActionRows[0].task.sourceRefs.executionId,
                  productId: product.id,
                  taskId: completedProductActionRows[0].task.id,
                }
              : { productId: product.id },
          )
        : undefined,
    [completedProductActionRows, getLatestReview, product],
  );

  const causeDecisionCards = useMemo(() => {
    if (!productId || !product || causes.length === 0) return [];
    return causeToDiagnosisCards(productId, product.name, causes);
  }, [productId, product, causes]);

  const strategyDecisionCards = useMemo(() => {
    if (!productId || !product || strategyList.length === 0) return [];
    return strategyToDecisionCards(productId, product.name, strategyList, causes);
  }, [productId, product, strategyList, causes]);

  const pendingActionCount = useMemo(
    () => productActionRows.filter((row) => row.task.status === 'pending_decision').length,
    [productActionRows],
  );

  const sopFlowCtx = useMemo(
    () => ({
      route: 'detail' as const,
      hasGoodsId: Boolean(productId),
      hasMetricsRow: Boolean(
        diagnosisVm?.rawRow &&
          String(diagnosisVm.statistDate ?? '').trim() !== '',
      ),
      hasStructuredDiagnosis: Boolean(
        structured &&
          ((structured.core_conclusion?.trim() ?? '') !== '' ||
            (structured.problem_analysis?.trim() ?? '') !== ''),
      ),
      pendingActionCount,
    }),
    [productId, diagnosisVm, structured, pendingActionCount],
  );

  const currentSopPhase = useMemo(
    () => inferPhaseForContext(sopFlowCtx),
    [sopFlowCtx],
  );

  const flowActionKey = useMemo(
    () => productActionRows.find((row) => row.task.status === 'pending_decision')?.action.id ?? null,
    [productActionRows],
  );

  const resolvedKnowledge = useMemo(() => {
    if (!productId) {
      return resolveKnowledgeSupport({
        page: 'product_detail',
        stageKey: 'prepare',
      });
    }
    const prod = products.find((p) => p.id === productId);
    const line =
      problemBullets[0] ?? prod?.issues?.[0] ?? '';
    const pk = inferProblemKeyFromText(line);
    return resolveKnowledgeSupport({
      page: 'product_detail',
      goodsId: productId,
      category: prod?.category,
      problemKey: pk,
      rootCauseKey: causes[0]?.id,
      strategyKey: strategyList[0]?.id,
      actionKey: flowActionKey ?? undefined,
      stageKey: currentSopPhase,
    });
  }, [
    productId,
    problemBullets,
    causes,
    strategyList,
    flowActionKey,
    currentSopPhase,
  ]);

  const [flowSupportOpen, setFlowSupportOpen] = useState(false);
  const [strategySupportOpen, setStrategySupportOpen] = useState(false);
  const [selectedRootCause, setSelectedRootCause] = useState<string | null>(null);
  const [explainDrawerOpen, setExplainDrawerOpen] = useState(false);

  if (!product) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">商品未找到</h2>
          <p className="text-gray-600 mb-6">无法找到商品 {productId}</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4" />
            返回商品操盘台
          </Link>
        </div>
      </div>
    );
  }

  const openRootCauseExplain = (rootCauseId: string) => {
    setSelectedRootCause(rootCauseId);
    setExplainDrawerOpen(true);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar: Product Info & History */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            返回操盘台
          </Link>

          {searchParams.get('from') === 'home' ? (
            <p className="text-xs text-blue-800 bg-blue-50/90 border border-blue-100 rounded-md px-2.5 py-2 mb-3 leading-relaxed">
              从经营搭档进入 · 当前商品的诊断与动作均与操盘队列一致
            </p>
          ) : null}

          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">切换商品 goods_id</label>
            <select
              value={productId ?? ''}
              onChange={(e) => navigate(`/products/${e.target.value}`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mb-3 space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">goods_id</span>
              <span className="font-mono text-gray-900">{diagnosisVm?.goodsId ?? product.id}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">statist_date</span>
              <span className="font-mono text-gray-900">{diagnosisVm?.statistDate ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">diagnosis_grade</span>
              <span className="font-mono text-gray-900">{diagnosisVm?.diagnosis_grade || '—'}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2">风险等级（可视化）</div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                  riskLevel === 'high'
                    ? 'bg-red-100 text-red-800'
                    : riskLevel === 'medium'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                {riskLevelLabelZh(riskLevel)}风险
              </span>
              <span className="text-xs text-gray-500">原始 grade: {diagnosisVm?.diagnosis_grade || '—'}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  riskLevel === 'high'
                    ? 'w-full bg-red-500'
                    : riskLevel === 'medium'
                      ? 'w-2/3 bg-orange-400'
                      : 'w-1/3 bg-emerald-500'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>低</span>
              <span>中</span>
              <span>高</span>
            </div>
          </div>
          
          <h2 className="font-semibold text-gray-900 mb-1">{product.name}</h2>
          <div className="text-sm text-gray-600">{product.brand} · {product.category}</div>
        </div>

        {/* Statist date selector (replaces static version tags) */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">统计日</h3>
          </div>
          <select 
            value={selectedStatistDate}
            onChange={(e) => setSelectedStatistDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statDates.length === 0 ? (
              <option value="">暂无可用日期</option>
            ) : (
              statDates.map((d) => (
                <option key={d} value={d}>统计日 {d}</option>
              ))
            )}
          </select>
        </div>

        {/* Time Window */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">时间窗口</h3>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">统计日期</div>
              <div className="text-sm font-medium text-gray-900">{diagnosisVm?.statistDate ?? '—'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">数据入库</div>
              <div className="text-sm font-medium text-gray-900">{diagnosisVm?.dataLoadTime || '—'}</div>
            </div>
          </div>
        </div>

        {/* Historical Versions */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">按统计日切换</h3>
            </div>
            
            <div className="space-y-2">
              {statDates.map((d) => {
                const vmDay = productId ? adsFactCatalog.getProductDiagnosis(productId, d) : undefined;
                const active = d === selectedStatistDate;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedStatistDate(d)}
                    className={`w-full rounded-lg p-3 text-left border transition-colors ${
                      active
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-sm font-medium ${active ? 'text-blue-900' : 'text-gray-900'}`}>{d}</div>
                      {active && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">当前</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 text-xs ${active ? 'text-blue-600' : 'text-gray-600'}`}>
                      <span>{vmDay?.legacyProduct.problemCount ?? '—'} 问题</span>
                      <span>·</span>
                      <span>{vmDay?.rootCauses.length ?? '—'} 根因</span>
                      <span>·</span>
                      <span>{vmDay?.strategies.length ?? '—'} 策略</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">优先级</div>
              <div className="text-xl font-semibold text-gray-900">{product.priority}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">待审批动作</div>
              <div className="text-xl font-semibold text-orange-600">
                {productActions.filter(a => a.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Main Diagnosis Flow */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[900px] mx-auto space-y-6">
          {missingFieldLabels.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 text-sm text-amber-950">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <div>
                <div className="font-medium mb-1">部分指标未返回</div>
                <p className="text-amber-900/90 text-xs leading-relaxed">
                  当前演示数据快照里下列字段为空，详情区已用「—」占位，不影响演示主线：
                  {missingFieldLabels.join('、')}
                </p>
              </div>
            </div>
          )}

          <SopFlowCompactBar
            stageKey={currentSopPhase}
            onOpenFlow={() => setFlowSupportOpen(true)}
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">演示主线 · 下一步</span>
              <span className="hidden sm:inline"> — </span>
              <span className="block sm:inline mt-1 sm:mt-0">去审批放行 → 看执行进度 → 对照指标看结果。</span>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                asChild
                size="sm"
                variant={pendingActionCount > 0 ? 'default' : 'outline'}
                className={pendingActionCount > 0 ? '' : 'text-slate-700'}
              >
                <Link to={appendFromHome('/approvals')}>去审批</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/execution">看执行</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/replay?goodsId=${encodeURIComponent(product.id)}`}>看结果</Link>
              </Button>
            </div>
          </div>

          {pendingActionCount > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              有待经营决策的动作，建议先在「动作审批」放行或调整，再到执行页看落地。
            </p>
          )}

          {/* Core Metrics — 来自 rawRow（10 项） */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">核心经营指标（当前快照）</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {metricCells.map((cell) => (
                <div
                  key={cell.key}
                  className={`rounded-lg border p-3 ${
                    cell.rawMissing ? 'border-amber-100 bg-amber-50/40' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="text-xs text-gray-600 mb-1">{cell.label}</div>
                  <div className={`text-lg font-semibold ${cell.rawMissing ? 'text-amber-800' : 'text-gray-900'}`}>
                    {cell.displayValue}
                  </div>
                  {cell.rawMissing && (
                    <div className="text-[10px] text-amber-700 mt-1">未返回</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {structured && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900">结构化诊断 · 决策卡</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                  统一为可经营决策对象：状态、动因与推荐动作；弱化长段原文罗列。
                </p>
              </div>
              {thoughtDecisionCards.length === 0 &&
              conclusionDecisionCards.length === 0 &&
              problemDecisionCards.length === 0 &&
              growthDecisionCards.length === 0 &&
              improvementDecisionCards.length === 0 &&
              missingDecisionCards.length === 0 ? (
                <p className="text-sm text-gray-500">
                  暂无结构化决策卡（等待诊断文本或切换统计日）。
                </p>
              ) : (
                <div className="space-y-6">
                  {thoughtDecisionCards.length > 0 ? (
                    <section>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">分析思路</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {thoughtDecisionCards.map((c) => (
                          <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {conclusionDecisionCards.length > 0 ? (
                    <section>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">核心结论</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {conclusionDecisionCards.map((c) => (
                          <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {problemDecisionCards.length > 0 ? (
                    <section>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">问题剖析</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {problemDecisionCards.map((c) => (
                          <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {growthDecisionCards.length > 0 ? (
                    <section>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">增长机会</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {growthDecisionCards.map((c) => (
                          <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {improvementDecisionCards.length > 0 ? (
                    <section>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">改进动作</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {improvementDecisionCards.map((c) => (
                          <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {missingDecisionCards.length > 0 ? (
                    <section>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">数据完整性风险</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {missingDecisionCards.map((c) => (
                          <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Evidence Pack */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Evidence - 证据包</h3>
                  <p className="text-sm text-gray-600">系统采集的异常数据证据</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              {evidence.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-4 rounded-lg border ${
                    ev.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    ev.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-medium text-gray-900">{ev.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ev.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          ev.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ev.severity === 'critical' ? '严重' : ev.severity === 'warning' ? '警告' : '信息'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">指标</div>
                          <div className="text-sm font-medium text-gray-900">{ev.metric}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">实际值</div>
                          <div className="text-sm font-semibold text-red-600">{ev.actual}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">期望值</div>
                          <div className="text-sm font-medium text-gray-900">{ev.expected}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-600 mb-1">偏差</div>
                      <div className={`text-xl font-semibold ${
                        ev.deviation < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {ev.deviation > 0 ? '+' : ''}{ev.deviation.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Problem / State */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-700">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Problem - 当前问题</h3>
                  <p className="text-sm text-red-700">基于证据包识别的商品问题</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-3">以下为与证据包对齐的「当前问题」决策卡。</p>
              {issueStepCards.length === 0 ? (
                <p className="text-sm text-gray-500">暂无问题项。</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {issueStepCards.map((c) => (
                    <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: RootCause */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-700">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">RootCause - 根因诊断</h3>
                  <p className="text-sm text-orange-700">按置信度和影响度排序</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              <p className="text-xs text-gray-500 mb-1">根因以决策卡呈现；点击卡片打开解释侧栏。</p>
              {causeDecisionCards.length === 0 ? (
                <p className="text-sm text-gray-500">暂无根因。</p>
              ) : (
                causeDecisionCards.map((c, i) => (
                  <DecisionCardFrame
                    key={c.card_id}
                    card={c}
                    onActivate={() => openRootCauseExplain(causes[i].id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Step 4: Strategy */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-700">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Strategy - 推荐策略</h3>
                  <p className="text-sm text-green-700">针对根因的优化策略建议</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-500">
                  策略决策卡归纳预期影响与动作抓手，可跳转动作区拆解审批。
                </p>
                <button
                  type="button"
                  onClick={() => setStrategySupportOpen(true)}
                  className="px-3 py-2 border border-purple-300 text-purple-700 text-sm rounded-lg hover:bg-purple-50 flex items-center gap-2 shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  策略知识
                </button>
              </div>
              {strategyDecisionCards.length === 0 ? (
                <p className="text-sm text-gray-500">暂无策略。</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {strategyDecisionCards.map((c) => (
                    <DecisionCardFrame key={c.card_id} card={c} to={c.href} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 5: Action Plan */}
          <div
            id="operator-home-actions"
            className="bg-white rounded-lg border border-gray-200 overflow-hidden scroll-mt-4"
          >
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Action Plan - 可执行动作</h3>
                  <p className="text-sm text-blue-700">基于策略生成的具体动作计划</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {productActionRows.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-sm text-gray-500">暂无可执行动作</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {productActionRows.map(({ action, task }) => {
                    return (
                    <div key={action.id} className={`rounded-lg p-4 border ${
                      task.status === 'waiting_input' ? 'bg-amber-50 border-amber-200' :
                      task.status === 'diagnosing' ? 'bg-violet-50 border-violet-200' :
                      task.status === 'pending_decision' ? 'bg-orange-50 border-orange-200' :
                      task.status === 'approved' ? 'bg-green-50 border-green-200' :
                      task.status === 'executing' ? 'bg-blue-50 border-blue-200' :
                      task.status === 'failed' || task.status === 'needs_takeover' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="font-medium text-gray-900">{action.name}</div>
                            <TaskStateBadge phase={task.status} />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{action.type} · {action.reason}</div>
                          <div className="text-sm text-green-600 bg-white rounded px-3 py-2">
                            {action.expectedImpact}
                          </div>
                        </div>
                      </div>
                      <TaskFlowSidePanel
                        task={task}
                        actionId={action.id}
                        productId={productId}
                        compact
                        showActions={false}
                        className="mt-3 !shadow-none"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() =>
                            setSelectedActionId(action.id)
                          }
                        >
                          打开推进中心
                        </Button>
                        {task.status === 'pending_decision' ? (
                          <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                            <Link to={`/approvals?actionId=${encodeURIComponent(action.id)}`}>
                              去拍板中心
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 6: Expected Impact */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-purple-700">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Expected Impact - 预期效果</h3>
                  <p className="text-sm text-purple-700">策略执行后的预期影响</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {improvementCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {improvementCards.map((card, i) => (
                    <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-green-800 font-medium mb-1">{card.title}</div>
                      <div className="text-xl font-semibold text-green-900 mb-1">
                        {card.targetLift || '待量化'}
                      </div>
                      <div className="text-xs text-green-700 line-clamp-3">{card.expectedMetric || card.validationNote}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无由建议解析的预期效果摘要</p>
              )}
            </div>
          </div>

          {diagnosisReviewPrefill &&
          (completedProductActionRows.length > 0 || diagnosisReviewStatus !== 'none') ? (
            <div className="bg-white rounded-lg border border-violet-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-violet-50/90 border-b border-violet-200">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-violet-700" />
                  <div>
                    <h3 className="font-semibold text-violet-950">复盘沉淀</h3>
                    <p className="text-sm text-violet-900/90 mt-0.5">
                      诊断与动作告一段落后，把结论留给下一次决策参考
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    无需编辑资产明细。只要记下这轮处理结论，系统就会把它留在结果跟踪里，并在同类问题出现时优先参考。
                  </p>
                  {latestDiagnosisReview ? (
                    <p className="text-sm text-violet-900/90 leading-relaxed">
                      最近经验：{latestDiagnosisReview.lesson}
                    </p>
                  ) : null}
                </div>
                {diagnosisReviewStatus === 'none' ? (
                  <Button
                    type="button"
                    className="shrink-0 gap-2 bg-violet-700 hover:bg-violet-800"
                    onClick={() =>
                      openDeposition({
                        ...diagnosisReviewPrefill,
                        source: 'diagnosis_complete',
                        defaultSuggest: true,
                      })
                    }
                  >
                    <Sparkles className="w-4 h-4" />
                    形成复盘
                  </Button>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800">
                    <Sparkles className="w-4 h-4" />
                    {diagnosisReviewStatus === 'candidate' ? '已进入经验候选区' : '已形成复盘'}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Sidebar: Knowledge & Actions */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
        {/* Strategy Support（爆款营销方案 SOP · 片段） */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-violet-50 border-b border-violet-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              <h3 className="font-semibold text-violet-900">策略与机会支持</h3>
            </div>
            <p className="text-xs text-violet-800/90 mt-1">
              基于当前商品与问题语境的短片段，非诊断真源。
            </p>
          </div>

          <div className="p-6 space-y-3">
            <StrategySupportTrigger
              onClick={() => setStrategySupportOpen(true)}
              className="w-full justify-center"
            />
            <p className="text-xs text-gray-600">
              打开侧栏可浏览：爆款路径、词路与市场、视觉定位、主图/详情/SKU
              等分组建议；内容来自《爆款营销方案 SOP》演示片段。
            </p>
          </div>
        </div>

        {/* Approval Entry */}
        {pendingActionCount > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">待审批动作</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-orange-900 mb-1">
                  {pendingActionCount} 个动作等待拍板
                </div>
                <div className="text-xs text-orange-700 mb-3">
                  先确认是否放行，再决定是否立即去推进
                </div>
                <div className="flex flex-col gap-2">
                  {productActionRows.find((row) => row.task.status === 'pending_decision') ? (
                    <Button
                      type="button"
                      className="w-full justify-center text-sm"
                      onClick={() => {
                        const firstPending = productActionRows.find(
                          (row) => row.task.status === 'pending_decision',
                        );
                        if (!firstPending) return;
                        setSelectedActionId(firstPending.action.id);
                      }}
                    >
                      <PlayCircle className="w-4 h-4" />
                      打开推进中心
                    </Button>
                  ) : null}
                  <Button variant="outline" className="w-full justify-center text-sm" asChild>
                    <Link to="/approvals">去拍板中心</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk & Constraints */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">风险与约束</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm font-medium text-green-900 mb-1">低风险</div>
              <div className="text-xs text-green-700">
                主图优化和 A/B 测试为低风险操作
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-900 mb-1">中风险</div>
              <div className="text-xs text-orange-700">
                标题调整可能影响搜索排名，建议谨慎
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">约束条件</div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• A/B 测试需至少运行 3-5 天</li>
                <li>• 主图更新需内容团队审核</li>
                <li>• 标题修改每月限 2 次</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Cases */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">相关案例</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">案例 #1247</div>
              <div className="text-xs text-gray-600 mb-2">
                床上用品品类主图优化
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600">CTR +52%</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">2026-02</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">案例 #1189</div>
              <div className="text-xs text-gray-600 mb-2">
                四件套标题关键词优化
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600">流量 +38%</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">2026-01</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
          <Link
            to="/approvals"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            发起执行审批
          </Link>

          <button
            onClick={() => setExplainDrawerOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Info className="w-5 h-5" />
            查看完整解释
          </button>
        </div>
      </div>

      <FlowSupportDrawer
        open={flowSupportOpen}
        onClose={() => setFlowSupportOpen(false)}
        flowBundle={resolvedKnowledge.flowBundle}
      />

      <TaskActionDrawer
        open={selectedTask != null}
        onOpenChange={(open) => {
          if (!open) setSelectedActionId(null);
        }}
        task={selectedTask?.task ?? null}
        actionId={selectedTask?.actionId}
        productId={selectedTask?.productId}
        detailHref={productId ? `/products/${productId}?focus=actions` : undefined}
        source="diagnosis"
      />

      <StrategySupportDrawer
        open={strategySupportOpen}
        onClose={() => setStrategySupportOpen(false)}
        snippets={resolvedKnowledge.strategySnippets}
        contextHint={`goods_id ${product.id} · 根因/策略/问题语境已参与匹配`}
      />

      {/* Explain Drawer */}
      {explainDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setExplainDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[600px] bg-white shadow-xl flex flex-col">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">决策解释</h2>
              </div>
              <button
                onClick={() => setExplainDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">诊断逻辑</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                    <p>1. 系统监测到商品 CTR 7日为 1.2%，显著低于品类基准 2.1%</p>
                    <p>2. 进一步分析发现主图质量评分 0.42，低于基准 0.75</p>
                    <p>3. 标题相关性评分 0.87，略低于目标 0.92</p>
                    <p>4. 综合判断：主图吸引力弱是主要根因（置信度 89%）</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">策略选择依据</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                    <p>• 主图优化策略：针对最高置信度根因，预期 CTR 提升 40-60%</p>
                    <p>• 标题优化策略：补充优化措施，预期流量提升 25-35%</p>
                    <p>• 建议优先执行主图优化，通过 A/B 测试验证效果</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">风险评估</h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-900 mb-1">低风险动作</div>
                      <div className="text-sm text-green-700">
                        主图优化和 A/B 测试为低风险操作，不会影响现有流量
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-orange-900 mb-1">中风险动作</div>
                      <div className="text-sm text-orange-700">
                        标题关键词调整可能影响搜索排名，建议谨慎执行
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">参考数据</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">品类样本量</div>
                        <div className="font-medium text-gray-900">1,247 个商品</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">时间窗口</div>
                        <div className="font-medium text-gray-900">最近 30 天</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">置信区间</div>
                        <div className="font-medium text-gray-900">95%</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">模型版本</div>
                        <div className="font-medium text-gray-900">v2.3.1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
