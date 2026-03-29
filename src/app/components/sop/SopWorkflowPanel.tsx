import { CheckCircle2, ClipboardList, Users } from 'lucide-react';
import type {
  DiagnosisPhaseId,
  DeliverableStatusRow,
  SopRoleId,
} from '../../data/sop/diagnosisFlowTypes';
import {
  PHASE_ORDER,
  ROLE_HINT_ZH,
  ROLE_LABEL_ZH,
  getPhaseById,
} from '../../data/sop/diagnosisFlowSkeleton';

function statusBadgeClass(s: DeliverableStatusRow['status']): string {
  if (s === 'done') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s === 'partial') return 'bg-amber-100 text-amber-900 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function statusLabel(s: DeliverableStatusRow['status']): string {
  if (s === 'done') return '已具备';
  if (s === 'partial') return '部分';
  return '待补充';
}

export function SopPhaseStepper({ currentId }: { currentId: DiagnosisPhaseId }) {
  const currentIdx = PHASE_ORDER.indexOf(currentId);

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-start gap-1 min-w-[640px]">
        {PHASE_ORDER.map((id, i) => {
          const def = getPhaseById(id);
          const active = i === currentIdx;
          const done = i < currentIdx;
          return (
            <div key={id} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${done || active ? 'bg-blue-400' : 'bg-gray-200'}`}
                  />
                )}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : done
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : active ? (
                    <span className="text-xs font-bold">{i + 1}</span>
                  ) : (
                    <span className="text-xs font-medium">{i + 1}</span>
                  )}
                </div>
                {i < PHASE_ORDER.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${done ? 'bg-blue-400' : 'bg-gray-200'}`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs text-center leading-tight px-0.5 ${
                  active ? 'font-semibold text-blue-800' : 'text-gray-600'
                }`}
              >
                {def?.name ?? id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SopPhaseContextCard({
  currentId,
  footnote,
}: {
  currentId: DiagnosisPhaseId;
  footnote?: string;
}) {
  const phase = getPhaseById(currentId);
  if (!phase) return null;

  return (
    <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-4 space-y-3">
      <div>
        <div className="text-xs font-medium text-blue-700 mb-1">当前 SOP 阶段</div>
        <div className="text-base font-semibold text-gray-900">{phase.name}</div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{phase.goal}</p>
      <div className="rounded-md bg-white/80 border border-gray-100 px-3 py-2 text-xs text-gray-700">
        <span className="font-medium text-gray-900">下一步建议：</span>
        {phase.nextStepHint}
      </div>
      {footnote && (
        <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-2">{footnote}</div>
      )}
    </div>
  );
}

export function SopDeliverableList({ rows }: { rows: DeliverableStatusRow[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-gray-600" />
        <h4 className="text-sm font-semibold text-gray-900">输出物（结构化）</h4>
      </div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.kind}
            className="flex flex-wrap items-start justify-between gap-2 text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-gray-800">{r.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusBadgeClass(r.status)}`}
            >
              {statusLabel(r.status)}
            </span>
            {r.hint && <p className="w-full text-[11px] text-gray-500">{r.hint}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SopRoleChips({ roleIds }: { roleIds: SopRoleId[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-gray-600" />
        <h4 className="text-sm font-semibold text-gray-900">责任角色</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {roleIds.map((rid) => (
          <div
            key={rid}
            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left max-w-[200px]"
            title={ROLE_HINT_ZH[rid]}
          >
            <div className="text-xs font-medium text-gray-900">{ROLE_LABEL_ZH[rid]}</div>
            <div className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">{ROLE_HINT_ZH[rid]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SopWorkflowPanel({
  currentId,
  deliverableRows,
  narrative,
  footnote,
  showDeliverables = true,
  showRoles = true,
}: {
  currentId: DiagnosisPhaseId;
  deliverableRows: DeliverableStatusRow[];
  narrative?: string;
  footnote?: string;
  showDeliverables?: boolean;
  showRoles?: boolean;
}) {
  const phase = getPhaseById(currentId);

  return (
    <div className="space-y-4">
      {narrative && (
        <p className="text-xs text-gray-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-relaxed">
          {narrative}
        </p>
      )}
      <SopPhaseStepper currentId={currentId} />
      <SopPhaseContextCard currentId={currentId} footnote={footnote} />
      {showDeliverables && (
        <SopDeliverableList rows={deliverableRows} />
      )}
      {showRoles && phase && (
        <SopRoleChips roleIds={phase.roles} />
      )}
    </div>
  );
}
