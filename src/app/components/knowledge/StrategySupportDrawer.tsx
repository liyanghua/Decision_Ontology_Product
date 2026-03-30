import { X } from 'lucide-react';
import { useMemo } from 'react';
import type {
  StrategySnippetBucket,
  SupportSnippet,
} from '../../data/expertKnowledge';
import { KnowledgeDisclaimerStrip } from './KnowledgeDisclaimerStrip';
import { ExpandableSnippet } from './ExpandableSnippet';

const BUCKET_ORDER: StrategySnippetBucket[] = [
  'hit_build',
  'market_keywords',
  'visual_positioning',
  'listing_creative',
  'reading',
];

const BUCKET_LABEL: Record<StrategySnippetBucket, string> = {
  hit_build: '相关爆款打造建议',
  market_keywords: '关键词 / 市场 / 竞品 / 价格带',
  visual_positioning: '视觉与定位打法',
  listing_creative: '主图 · 详情 · SKU · 卖点策划',
  reading: '推荐阅读片段',
};

export function StrategySupportDrawer({
  open,
  onClose,
  snippets,
  contextHint,
}: {
  open: boolean;
  onClose: () => void;
  snippets: SupportSnippet[];
  /** 例如当前 goods_id / 问题摘要 */
  contextHint?: string;
}) {
  const grouped = useMemo(() => {
    const m = new Map<StrategySnippetBucket, SupportSnippet[]>();
    for (const b of BUCKET_ORDER) m.set(b, []);
    for (const s of snippets) {
      const bucket = s.strategy_bucket ?? 'reading';
      const arr = m.get(bucket) ?? m.get('reading')!;
      arr.push(s);
    }
    return m;
  }, [snippets]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[520px] bg-white shadow-xl flex flex-col border-l border-gray-200">
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div>
            <div className="text-xs text-gray-500">策略支持</div>
            <div className="text-sm font-semibold text-gray-900">策略与机会支持</div>
            {contextHint && (
              <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[340px]">
                {contextHint}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <KnowledgeDisclaimerStrip variant="slate" />

          {snippets.length === 0 && (
            <p className="text-sm text-gray-500">当前还没有可展示的支持片段。</p>
          )}

          {BUCKET_ORDER.map((bucket) => {
            const items = grouped.get(bucket) ?? [];
            if (items.length === 0) return null;
            return (
              <section
                key={bucket}
                id={`strategy-bucket-${bucket}`}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                <div className="px-3 py-2 bg-violet-50 border-b border-violet-100">
                  <h3 className="text-sm font-semibold text-violet-950">
                    {BUCKET_LABEL[bucket]}
                  </h3>
                </div>
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={item.support_id} className="p-3 space-y-1">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-[11px] text-gray-500">
                        来源：{item.source_doc} · {item.source_section}
                      </div>
                      <ExpandableSnippet text={item.snippet} />
                      <div className="text-[11px] text-gray-500">
                        建议用法：{item.recommended_usage}
                        {item.relevance_score > 0 && (
                          <span className="ml-2 text-violet-700">
                            相关度 {(item.relevance_score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
