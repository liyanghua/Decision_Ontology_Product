import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  BookOpen,
  FileJson,
  LayoutList,
  GitCompare,
  Info,
  AlertTriangle,
} from 'lucide-react';
import {
  listProducts,
  getDecisionObject,
  getAvailableStatDates,
} from '../data/liveCatalog';
import { buildJourneyLinks } from '../data/operatorJourney';
import {
  DETAIL_METRIC_KEYS,
  DETAIL_METRIC_LABEL_ZH,
} from '../data/adapters/detailViewMetrics';
import { splitInsightBullets, splitHighlightCards } from '../data/adapters/diagnosisContentParse';
import { inferPhaseForContext } from '../data/sop/diagnosisFlowSkeleton';
import {
  inferProblemKeyFromText,
  inferStrategyKeyFromText,
  resolveKnowledgeSupport,
} from '../data/expertKnowledge';
import { SopFlowCompactBar } from '../components/knowledge/SopFlowCompactBar';
import { FlowSupportDrawer } from '../components/knowledge/FlowSupportDrawer';
import { StrategySupportDrawer } from '../components/knowledge/StrategySupportDrawer';
import { StrategySupportTrigger } from '../components/knowledge/StrategySupportTrigger';
import { OperatorJourneyBar } from '../components/operatorJourney/OperatorJourneyBar';
import { TaskActionPanel } from '../components/taskFlow/TaskActionPanel';
import { useOperatorJourney } from '../contexts/OperatorJourneyContext';
import { useReviewLedger } from '../contexts/ReviewLedgerContext';
import { useTaskFlowOverrides } from '../contexts/TaskFlowOverrideContext';
import { listOperatorTaskRows } from '../data/taskFlow';
import { Button } from '../components/ui/button';

const DIAG_GRADE_LABEL = '诊断等级（原始）';

type MiddleTab = 'structured' | 'rawJson';

function formatJsonPretty(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  try {
    return JSON.stringify(JSON.parse(t), null, 2);
  } catch {
    return raw;
  }
}

function sourceLabel(source?: string): string {
  if (!source?.trim()) return '本地留档快照';
  if (source === 'ads_fact_csv_replay') return '本地留档快照';
  return source;
}

function DiagnosisBlockCards({
  title,
  items,
  emptyHint,
  highlightDiff,
}: {
  title: string;
  items: string[];
  emptyHint: string;
  highlightDiff?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlightDiff ? 'border-amber-400 bg-amber-50/50' : 'border-gray-200 bg-white'
      }`}
    >
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyHint}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((line, i) => (
            <li
              key={i}
              className="text-sm text-gray-800 rounded-md bg-gray-50 border border-gray-100 px-3 py-2"
            >
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function blockItemsStructured(field: string | undefined, mode: 'bullets' | 'highlights') {
  const t = field ?? '';
  if (mode === 'highlights') return splitHighlightCards(t);
  return splitInsightBullets(t);
}

export function ReplayExplain() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeActionId, setActiveAction, visitStep } = useOperatorJourney();
  const { getOverride } = useTaskFlowOverrides();
  const { getReviewStatus } = useReviewLedger();
  const products = useMemo(() => listProducts(), []);
  const actionIdFromQuery = searchParams.get('actionId')?.trim() || activeActionId || '';
  const taskRows = useMemo(() => listOperatorTaskRows(getOverride), [getOverride]);
  const focusedRow = useMemo(
    () =>
      actionIdFromQuery
        ? taskRows.find((row) => row.action.id === actionIdFromQuery) ?? null
        : null,
    [actionIdFromQuery, taskRows],
  );

  const [goodsId, setGoodsId] = useState(() => {
    const fromUrl = searchParams.get('goodsId');
    const prods = listProducts();
    if (fromUrl && prods.some((p) => p.id === fromUrl)) return fromUrl;
    return prods[0]?.id ?? '';
  });
  const statDates = useMemo(() => getAvailableStatDates(goodsId), [goodsId]);
  const [statistDate, setStatistDate] = useState(() => {
    const fromUrl = searchParams.get('date');
    const fromGoods = searchParams.get('goodsId');
    const prods = listProducts();
    const gid =
      fromGoods && prods.some((p) => p.id === fromGoods) ? fromGoods : prods[0]?.id ?? '';
    const dates = getAvailableStatDates(gid);
    if (fromUrl && dates.includes(fromUrl)) return fromUrl;
    return dates[0] ?? '';
  });
  const [compareDate, setCompareDate] = useState(() => searchParams.get('compare') ?? '');
  const [middleTab, setMiddleTab] = useState<MiddleTab>('structured');
  const [flowSupportOpen, setFlowSupportOpen] = useState(false);
  const [strategySupportOpen, setStrategySupportOpen] = useState(false);

  useEffect(() => {
    if (!statistDate && statDates[0]) setStatistDate(statDates[0]);
    else if (statistDate && statDates.length && !statDates.includes(statistDate)) {
      setStatistDate(statDates[0]);
    }
  }, [goodsId, statDates, statistDate]);

  useEffect(() => {
    if (compareDate && (!statDates.includes(compareDate) || compareDate === statistDate)) {
      setCompareDate('');
    }
  }, [compareDate, statDates, statistDate]);

  const baseObject = useMemo(
    () => (goodsId ? getDecisionObject(goodsId, statistDate) : undefined),
    [goodsId, statistDate],
  );
  const compareObject = useMemo(
    () =>
      goodsId && compareDate ? getDecisionObject(goodsId, compareDate) : undefined,
    [goodsId, compareDate],
  );

  const syncUrl = useCallback(
    (g: string, d: string, c: string, actionId: string) => {
      const p = new URLSearchParams();
      if (actionId) p.set('actionId', actionId);
      if (g) p.set('goodsId', g);
      if (d) p.set('date', d);
      if (c) p.set('compare', c);
      setSearchParams(p, { replace: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    syncUrl(goodsId, statistDate, compareDate, focusedRow?.action.id || actionIdFromQuery);
  }, [actionIdFromQuery, compareDate, focusedRow?.action.id, goodsId, statistDate, syncUrl]);

  useEffect(() => {
    if (!focusedRow?.action.productId) return;
    if (focusedRow.action.productId === goodsId) return;
    setGoodsId(focusedRow.action.productId);
    setCompareDate('');
  }, [focusedRow?.action.productId, goodsId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#review-learning-path') return;
    const t = window.setTimeout(() => {
      document.getElementById('review-learning-path')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => window.clearTimeout(t);
  }, [goodsId, statistDate]);

  const run = baseObject?.run;
  const structured = run?.structured;
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === goodsId) ?? null,
    [goodsId, products],
  );
  const focusedReviewStatus = useMemo(
    () =>
      focusedRow
        ? getReviewStatus({
            actionId: focusedRow.task.sourceRefs.actionId,
            executionId: focusedRow.task.sourceRefs.executionId,
            productId: focusedRow.task.sourceRefs.productId,
            taskId: focusedRow.task.id,
          })
        : 'none',
    [focusedRow, getReviewStatus],
  );
  const journeyLinks = useMemo(
    () =>
      buildJourneyLinks({
        actionId: focusedRow?.action.id || actionIdFromQuery || undefined,
        productId: focusedRow?.action.productId || goodsId || undefined,
      }),
    [actionIdFromQuery, focusedRow?.action.id, focusedRow?.action.productId, goodsId],
  );

  const coreItems = useMemo(
    () => blockItemsStructured(structured?.core_conclusion, 'highlights'),
    [structured?.core_conclusion],
  );
  const problemItems = useMemo(
    () => blockItemsStructured(structured?.problem_analysis, 'bullets'),
    [structured?.problem_analysis],
  );
  const growthItems = useMemo(
    () => blockItemsStructured(structured?.growth_analysis, 'bullets'),
    [structured?.growth_analysis],
  );
  const improveItems = useMemo(
    () => blockItemsStructured(structured?.improvement_suggestions, 'bullets'),
    [structured?.improvement_suggestions],
  );
  const missingItems = useMemo(
    () => blockItemsStructured(structured?.missing_data_impact, 'bullets'),
    [structured?.missing_data_impact],
  );

  const compareStructured = compareObject?.run.structured;
  const diffCore =
    compareStructured &&
    (structured?.core_conclusion ?? '') !== (compareStructured.core_conclusion ?? '');
  const diffProblem =
    compareStructured &&
    (structured?.problem_analysis ?? '') !== (compareStructured.problem_analysis ?? '');
  const diffGrowth =
    compareStructured &&
    (structured?.growth_analysis ?? '') !== (compareStructured.growth_analysis ?? '');
  const diffImprove =
    compareStructured &&
    (structured?.improvement_suggestions ?? '') !== (compareStructured.improvement_suggestions ?? '');

  const replaySopPhase = useMemo(
    () =>
      inferPhaseForContext({
        route: 'replay',
        hasGoodsId: Boolean(goodsId),
        hasMetricsRow: Boolean(run?.request.statistDate?.trim()),
        hasStructuredDiagnosis: Boolean(
          structured &&
            ((structured.core_conclusion?.trim() ?? '') !== '' ||
              (structured.problem_analysis?.trim() ?? '') !== ''),
        ),
        pendingActionCount: 0,
      }),
    [goodsId, run, structured],
  );

  const replayResolved = useMemo(
    () =>
      resolveKnowledgeSupport({
        page: 'replay_explain',
        goodsId: goodsId || undefined,
        problemKey: inferProblemKeyFromText(problemItems[0] ?? ''),
        strategyKey: inferStrategyKeyFromText(improveItems[0] ?? ''),
        stageKey: replaySopPhase,
        versionDiff: Boolean(compareDate),
      }),
    [goodsId, problemItems, improveItems, replaySopPhase, compareDate],
  );

  useEffect(() => {
    if (!focusedRow) return;
    setActiveAction({
      actionId: focusedRow.action.id,
      productId: focusedRow.action.productId || undefined,
    });
    visitStep({
      actionId: focusedRow.action.id,
      productId: focusedRow.action.productId || undefined,
      step: 'replay',
    });
  }, [focusedRow, setActiveAction, visitStep]);

  if (!products.length) {
    return (
      <div className="p-8 text-gray-600">暂无商品数据，请先加载演示队列（商品操盘台）。</div>
    );
  }

  return (
    <div className="p-6 max-w-[1920px] mx-auto min-h-[calc(100vh-4rem)]">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-950">结果复盘与前后对照</p>
          <p className="text-sm text-amber-900/90 mt-1">
            这页用来回看一轮处理前后的盘面变化，方便汇报、复盘和下轮判断；展示的是当时留档的判断快照，不等同于实时线上盘面。
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-700 mb-4 leading-relaxed">
        适合在处理完成后回看：同一商品切换基准日和对比日，就能讲清这轮动作前后盘面怎么变、为什么这么判断、哪些经验值得留下。
      </p>

      <div
        id="review-learning-path"
        className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4 mb-6"
      >
        <p className="text-sm font-semibold text-slate-900 mb-3">从操盘动作到复盘沉淀（示意）</p>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          这里用前台能理解的方式把闭环串起来，重点不是系统怎么跑，而是这次处理怎样被记住、怎样帮助下次判断更快更准。
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium">前台处理</span>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium">任务完成</span>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium">复盘沉淀</span>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <span className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 font-medium text-violet-900">
            经验候选区
          </span>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium">轻量核对</span>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-medium text-emerald-900">
            后续建议参考
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">结果复盘</h1>
          <p className="text-sm text-gray-600 mt-1">
            对照这轮处理前后的盘面变化，方便汇报、复盘和下轮判断。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">处理对象</span>
            <select
              value={goodsId}
              onChange={(e) => {
                setGoodsId(e.target.value);
                setCompareDate('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[140px]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">基准日</span>
            <select
              value={statistDate}
              onChange={(e) => setStatistDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[120px]"
            >
              {statDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <GitCompare className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">对比日</span>
            <select
              value={compareDate}
              onChange={(e) => setCompareDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[120px]"
            >
              <option value="">只看本轮</option>
              {statDates
                .filter((d) => d !== statistDate)
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>

      {focusedRow ? (
        <div className="mb-4 space-y-4">
          <OperatorJourneyBar
            task={focusedRow.task}
            actionId={focusedRow.action.id}
            productId={focusedRow.action.productId || undefined}
            reviewStatus={focusedReviewStatus}
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">这页回看的就是刚才那条任务</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {focusedRow.action.name} · {focusedRow.task.statusLabel}。先对照这轮处理前后怎么变，再把值得留下的经验顺手沉淀下来。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={journeyLinks.execution}>回推进结果</Link>
                </Button>
                <Button asChild size="sm">
                  <a href="#journey-review-cta">形成经验</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!run && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          当前组合无诊断记录，请更换处理对象或基准日。
        </div>
      )}

      {run && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium text-slate-500">这轮处理前后怎么变了</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {coreItems[0] ?? '先看这轮盘面快照，再决定结论是否站得住。'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium text-slate-500">为什么当时这么判断</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {problemItems[0] ?? '把问题剖析、增长判断和关键证据放在一处回看。'}
              </p>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-4">
              <div className="text-xs font-medium text-violet-700">哪条经验值得留下</div>
              <p className="mt-2 text-sm leading-6 text-violet-900">
                {improveItems[0] ?? '处理完成后，把这轮有效做法沉淀下来，方便下次更快判断。'}
              </p>
            </div>
          </div>

          {focusedRow ? (
            <div
              id="journey-review-cta"
              className="mt-4 rounded-lg border border-violet-200 bg-white p-4"
            >
              {focusedRow.task.status === 'completed' ? (
                <TaskActionPanel
                  task={focusedRow.task}
                  actionId={focusedRow.action.id}
                  productId={focusedRow.action.productId || undefined}
                  detailHref={journeyLinks.diagnosis}
                  source="task_detail"
                  showTimeline={false}
                  title="形成经验"
                />
              ) : (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">这条任务还没真正闭环</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      先回推进结果把这条任务跑到“已处理完成”，再在这里形成经验，闭环才算走完整。
                    </p>
                  </div>
                  <Button asChild>
                    <Link to={journeyLinks.execution}>回推进结果</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          {/* Left — Snapshot */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
                <h2 className="text-sm font-semibold text-gray-900">本轮盘面快照</h2>
                <p className="text-xs text-gray-600 mt-0.5">先看这轮判断基于哪些盘面事实，再决定结论是否站得住。</p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">处理对象</div>
                  <div className="text-gray-900">{selectedProduct?.name ?? run.request.goodsId}</div>
                  <div className="text-gray-500">基准日</div>
                  <div className="text-gray-900">{run.request.statistDate}</div>
                  <div className="text-gray-500">数据更新时间</div>
                  <div className="text-gray-900">
                    {run.request.dataLoadTime ?? '—'}
                  </div>
                  <div className="text-gray-500">当前诊断等级</div>
                  <div className="text-gray-900">
                    {run.request.keyMetrics.diagnosis_grade?.trim()
                      ? run.request.keyMetrics.diagnosis_grade
                      : '—'}
                  </div>
                </div>
                <details className="rounded-lg border border-slate-200 bg-slate-50/70">
                  <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-slate-700">
                    查看原始取值明细
                  </summary>
                  <div className="border-t border-slate-200 px-3 py-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-500">goods_id</div>
                      <div className="font-mono text-gray-900">{run.request.goodsId}</div>
                      <div className="text-gray-500">statist_date</div>
                      <div className="font-mono text-gray-900">{run.request.statistDate}</div>
                      <div className="text-gray-500">data_load_time</div>
                      <div className="font-mono text-gray-900">{run.request.dataLoadTime ?? '—'}</div>
                      <div className="text-gray-500">{DIAG_GRADE_LABEL}</div>
                      <div className="font-mono text-gray-900">
                        {run.request.keyMetrics.diagnosis_grade?.trim()
                          ? run.request.keyMetrics.diagnosis_grade
                          : '—'}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">关键指标原始取值</p>
                      <div className="max-h-[420px] overflow-y-auto space-y-1">
                        {DETAIL_METRIC_KEYS.map((key) => {
                          const v = run.request.keyMetrics[key] ?? '';
                          const label = DETAIL_METRIC_LABEL_ZH[key];
                          return (
                            <div
                              key={key}
                              className="flex justify-between gap-2 text-xs border-b border-gray-50 pb-1"
                            >
                              <span className="text-gray-600 shrink-0">{label}</span>
                              <span
                                className={`font-mono text-right break-all ${
                                  v.trim() === '' ? 'text-gray-400' : 'text-gray-900'
                                }`}
                              >
                                {v.trim() === '' ? '—' : v}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </aside>

          {/* Middle — Diagnosis */}
          <main className="lg:col-span-5 space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
              <button
                type="button"
                onClick={() => setMiddleTab('structured')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  middleTab === 'structured'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                复盘摘要
              </button>
                <button
                  type="button"
                  onClick={() => setMiddleTab('rawJson')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  middleTab === 'rawJson'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                >
                  <FileJson className="w-4 h-4" />
                  原始留档明细
                </button>
              </div>

            {middleTab === 'rawJson' && (
              <div className="rounded-lg border border-gray-200 bg-gray-950 overflow-hidden">
                <textarea
                  readOnly
                  value={formatJsonPretty(run.diagnosisContentRawJson)}
                  className="w-full min-h-[360px] p-4 font-mono text-xs text-green-100 bg-transparent resize-y focus:outline-none"
                  spellCheck={false}
                />
                {!run.diagnosisContentRawJson.trim() && (
                  <p className="px-4 pb-4 text-xs text-gray-500">当前没有保留原始诊断内容，页面已用结构化结果补齐展示。</p>
                )}
              </div>
            )}

            {middleTab === 'structured' && structured && (
              <div className="space-y-4">
                <DiagnosisBlockCards
                  title="核心结论"
                  items={coreItems}
                  emptyHint="暂无"
                  highlightDiff={!!diffCore}
                />
                <DiagnosisBlockCards
                  title="问题剖析"
                  items={problemItems}
                  emptyHint="暂无"
                  highlightDiff={!!diffProblem}
                />
                <DiagnosisBlockCards
                  title="增长分析"
                  items={growthItems}
                  emptyHint="暂无"
                  highlightDiff={!!diffGrowth}
                />
                <DiagnosisBlockCards
                  title="改进建议"
                  items={improveItems}
                  emptyHint="暂无"
                  highlightDiff={!!diffImprove}
                />
              </div>
            )}

            {compareDate && compareObject && middleTab === 'structured' && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                  <GitCompare className="w-4 h-4" />
                  对比：{statistDate} vs {compareDate}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {(
                    [
                      ['核心结论', 'core_conclusion'],
                      ['问题剖析', 'problem_analysis'],
                      ['增长分析', 'growth_analysis'],
                      ['改进建议', 'improvement_suggestions'],
                    ] as const
                  ).map(([label, key]) => {
                    const a = String(structured?.[key] ?? '');
                    const b = String(compareStructured?.[key] ?? '');
                    const same = a === b;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="font-medium text-gray-800">{label}</div>
                        <div
                          className={`rounded border p-2 max-h-32 overflow-y-auto whitespace-pre-wrap ${
                            same ? 'border-gray-200 bg-white' : 'border-amber-300 bg-amber-50'
                          }`}
                        >
                          <div className="text-gray-500 mb-1">基准</div>
                          {a || '—'}
                        </div>
                        <div
                          className={`rounded border p-2 max-h-32 overflow-y-auto whitespace-pre-wrap ${
                            same ? 'border-gray-200 bg-white' : 'border-amber-300 bg-amber-50'
                          }`}
                        >
                          <div className="text-gray-500 mb-1">对比</div>
                          {b || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>

          {/* Right — Knowledge + version + missing */}
          <aside className="lg:col-span-3 space-y-4">
            {run && (
              <SopFlowCompactBar
                stageKey={replaySopPhase}
                onOpenFlow={() => setFlowSupportOpen(true)}
              />
            )}

            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-violet-50 flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-700" />
                <h2 className="text-sm font-semibold text-gray-900">这条记录来自哪里</h2>
              </div>
              <dl className="p-4 text-xs space-y-2 font-mono">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">留档版本</dt>
                  <dd>{baseObject?.schemaVersion}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">留档编号</dt>
                  <dd className="text-right break-all">{run.id}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">留档来源</dt>
                  <dd>{sourceLabel(run.source)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">留档时间</dt>
                  <dd className="text-right">{run.recordedAt}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
                <h2 className="text-sm font-semibold text-gray-900">数据缺失与影响</h2>
                <p className="text-xs text-gray-600 mt-0.5">这轮判断里仍然缺哪些信息，以及它会影响什么。</p>
              </div>
              <div className="p-4">
                {missingItems.length === 0 ? (
                  <p className="text-sm text-gray-500">暂无</p>
                ) : (
                  <ul className="space-y-2">
                    {missingItems.map((line, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-3 py-2"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-violet-200 bg-violet-50/40 overflow-hidden p-4 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-700" />
                <h2 className="text-sm font-semibold text-gray-900">策略与机会支持</h2>
              </div>
              <p className="text-xs text-gray-600">
                基于当前商品与问题摘录匹配的短片段，用来补充判断，不替代诊断结论。
              </p>
              <StrategySupportTrigger
                compact
                onClick={() => setStrategySupportOpen(true)}
                className="w-full justify-center"
              />
            </div>
          </aside>
        </div>
        </>
      )}

      <FlowSupportDrawer
        open={flowSupportOpen}
        onClose={() => setFlowSupportOpen(false)}
        flowBundle={replayResolved.flowBundle}
      />

      <StrategySupportDrawer
        open={strategySupportOpen}
        onClose={() => setStrategySupportOpen(false)}
        snippets={replayResolved.strategySnippets}
        contextHint={`结果复盘 · 商品 ${selectedProduct?.name ?? goodsId}${compareDate ? ' · 已打开前后对照' : ''}`}
      />
    </div>
  );
}
