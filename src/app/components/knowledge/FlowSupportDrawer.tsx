import { X } from 'lucide-react';
import { useMemo } from 'react';
import type { DiagnosisPhaseId } from '../../data/sop/diagnosisFlowTypes';
import { getPhaseById } from '../../data/sop/diagnosisFlowSkeleton';
import type { FlowSupportBundle } from '../../data/expertKnowledge/types';
import {
  getFlowSupportByAction,
  getFlowSupportByStage,
  mergeFlowSupport,
} from '../../data/expertKnowledge';
import { KnowledgeDisclaimerStrip } from './KnowledgeDisclaimerStrip';
import { ExpandableSnippet } from './ExpandableSnippet';

export function FlowSupportDrawer({
  open,
  onClose,
  stageKey,
  actionKey,
  flowBundle: flowBundleProp,
}: {
  open: boolean;
  onClose: () => void;
  /** 若由 `resolveKnowledgeSupport` 预解析，传此即可，忽略 stageKey/actionKey */
  flowBundle?: FlowSupportBundle | null;
  stageKey?: DiagnosisPhaseId;
  actionKey?: string | null;
}) {
  const model = useMemo(() => {
    if (flowBundleProp) return flowBundleProp;
    const sk = stageKey ?? 'prepare';
    const base = getFlowSupportByStage(sk);
    const overlay = actionKey ? getFlowSupportByAction(actionKey) : undefined;
    return mergeFlowSupport(base, overlay ?? null);
  }, [flowBundleProp, stageKey, actionKey]);

  const phaseName =
    getPhaseById(model.stageKey)?.name ?? model.stageKey;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[520px] bg-white shadow-xl flex flex-col border-l border-gray-200">
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div>
            <div className="text-xs text-gray-500">处理支持</div>
            <div className="text-sm font-semibold text-gray-900">
              处理提醒与推进支持 · {phaseName}
            </div>
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
          <KnowledgeDisclaimerStrip />

          <section className="rounded-lg border border-gray-200 bg-white p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              当前关注点
            </h3>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {model.stageSummary}
            </p>
          </section>

          {model.deliverableHints.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-3">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">
                这一步先备好什么
              </h3>
              <ul className="space-y-2">
                {model.deliverableHints.map((d) => (
                  <li key={d.label} className="text-sm">
                    <span className="font-medium text-gray-900">{d.label}</span>
                    <span className="text-gray-600"> — {d.hint}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {model.roleHints.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-3">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">
                这一步谁来跟
              </h3>
              <ul className="space-y-2">
                {model.roleHints.map((r) => (
                  <li key={r.roleId} className="text-sm text-gray-800">
                    <span className="font-medium">{r.label}</span>
                    <span className="text-gray-600">：{r.hint}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {model.executionReminders.length > 0 && (
            <section className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <h3 className="text-xs font-semibold text-blue-800 mb-2">
                执行提醒
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-gray-800">
                {model.executionReminders.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {model.riskChecklist.length > 0 && (
            <section className="rounded-lg border border-orange-200 bg-orange-50/50 p-3">
              <h3 className="text-xs font-semibold text-orange-900 mb-2">
                风险检查项
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-orange-950/90">
                {model.riskChecklist.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {model.citations.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-slate-50 p-3">
              <h3 className="text-xs font-semibold text-gray-600 mb-2">
                参考片段
              </h3>
              <ul className="space-y-3">
                {model.citations.map((c) => (
                  <li
                    key={c.support_id}
                    id={`citation-${c.support_id}`}
                    className="rounded-md border border-gray-100 bg-white p-2"
                  >
                    <div className="text-sm font-medium text-gray-900">{c.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {c.source_doc} · {c.source_section}
                    </div>
                    <div className="mt-1">
                      <ExpandableSnippet text={c.snippet} />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">{c.recommended_usage}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
