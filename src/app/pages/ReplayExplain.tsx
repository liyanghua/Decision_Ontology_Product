import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
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
  const products = useMemo(() => listProducts(), []);

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
    (g: string, d: string, c: string) => {
      const p = new URLSearchParams();
      if (g) p.set('goodsId', g);
      if (d) p.set('date', d);
      if (c) p.set('compare', c);
      setSearchParams(p, { replace: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    syncUrl(goodsId, statistDate, compareDate);
  }, [goodsId, statistDate, compareDate, syncUrl]);

  const run = baseObject?.run;
  const structured = run?.structured;

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

  if (!products.length) {
    return (
      <div className="p-8 text-gray-600">暂无商品数据，请检查 CSV 是否加载成功。</div>
    );
  }

  return (
    <div className="p-6 max-w-[1920px] mx-auto min-h-[calc(100vh-4rem)]">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-950">历史诊断回放（Replay）</p>
          <p className="text-sm text-amber-900/90 mt-1">
            本页展示来自离线表快照的模型输出与解析结果，仅供审计与解释；并非人工编辑页，也不代表实时线上结论。
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">回放与解释</h1>
          <p className="text-sm text-gray-600 mt-1">
            按 goods_id + 统计日查看一次决策运行的输入与输出（DecisionRequest / DecisionRun）
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">goods_id</span>
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
                  {p.id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">统计日（基准）</span>
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
              <option value="">不对比</option>
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

      {!run && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          当前组合无诊断记录，请更换 goods_id 或统计日。
        </div>
      )}

      {run && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          {/* Left — Request Snapshot */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
                <h2 className="text-sm font-semibold text-gray-900">Request Snapshot</h2>
                <p className="text-xs text-gray-600 mt-0.5">输入快照 · 取值来自 CSV 原始字段</p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">goods_id</div>
                  <div className="font-mono text-gray-900">{run.request.goodsId}</div>
                  <div className="text-gray-500">statist_date</div>
                  <div className="font-mono text-gray-900">{run.request.statistDate}</div>
                  <div className="text-gray-500">data_load_time</div>
                  <div className="font-mono text-gray-900">
                    {run.request.dataLoadTime ?? '—'}
                  </div>
                  <div className="text-gray-500">{DIAG_GRADE_LABEL}</div>
                  <div className="font-mono text-gray-900">
                    {run.request.keyMetrics.diagnosis_grade?.trim()
                      ? run.request.keyMetrics.diagnosis_grade
                      : '—'}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Key metrics</p>
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
                结构化渲染
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
                原始 diagnosis_content_json
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
                  <p className="px-4 pb-4 text-xs text-gray-500">该单元格为空，结构化内容可能来自 diagnosis_content 兜底解析。</p>
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
                <h2 className="text-sm font-semibold text-gray-900">Run 元数据</h2>
              </div>
              <dl className="p-4 text-xs space-y-2 font-mono">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">DecisionObject.schemaVersion</dt>
                  <dd>{baseObject?.schemaVersion}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">run.id</dt>
                  <dd className="text-right break-all">{run.id}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">source</dt>
                  <dd>{run.source}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 shrink-0">recordedAt</dt>
                  <dd className="text-right">{run.recordedAt}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
                <h2 className="text-sm font-semibold text-gray-900">数据缺失与影响</h2>
                <p className="text-xs text-gray-600 mt-0.5">structured.missing_data_impact</p>
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
                基于当前回放 goods_id 与问题摘录匹配的短片段；非诊断真源。
              </p>
              <StrategySupportTrigger
                compact
                onClick={() => setStrategySupportOpen(true)}
                className="w-full justify-center"
              />
            </div>
          </aside>
        </div>
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
        contextHint={`回放 goods_id ${goodsId}${compareDate ? ' · 已开对比日' : ''}`}
      />
    </div>
  );
}
