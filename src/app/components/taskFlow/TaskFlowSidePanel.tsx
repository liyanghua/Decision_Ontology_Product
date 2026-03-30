import { Link } from 'react-router';
import type { TaskFlowCta } from '../../data/taskFlow';
import { OPERATOR_TASK_PRESENTATION } from '../../data/taskFlow';
import type { OperatorTaskFlowView } from '../../data/taskFlow/mapLegacyActionToPhase';
import {
  createClearTakeoverPatch,
  createRetryPatch,
  createTakeoverPatch,
  useTaskFlowOverrides,
} from '../../contexts/TaskFlowOverrideContext';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

const CTA_LABEL: Record<TaskFlowCta, string> = {
  submit_approval: '通过审批',
  reject: '驳回',
  defer: '延后处理',
  go_execute: '去执行侧',
  retry: '重试执行',
  takeover: '人工接管',
  view_diagnosis: '查看诊断',
  archive: '归档',
};

type TaskFlowSidePanelProps = {
  view: OperatorTaskFlowView;
  actionId: string;
  productId?: string;
  compact?: boolean;
  className?: string;
  /** 当 presentation 含审批类按钮时，由审批页注入 */
  onApprovalCta?: (cta: TaskFlowCta) => void;
};

export function TaskFlowSidePanel({
  view,
  actionId,
  productId,
  compact = false,
  className = '',
  onApprovalCta,
}: TaskFlowSidePanelProps) {
  const { getOverride, setOverride } = useTaskFlowOverrides();
  const pres = OPERATOR_TASK_PRESENTATION[view.phase];
  const pad = compact ? 'p-3 gap-2' : 'p-4 gap-3';
  const heading = compact ? 'text-xs font-semibold text-slate-700' : 'text-sm font-semibold text-slate-800';
  const body = compact ? 'text-[11px] text-slate-600 leading-relaxed' : 'text-xs text-slate-600 leading-relaxed';

  const runDemoCta = (cta: TaskFlowCta) => {
    if (cta === 'retry') {
      setOverride(actionId, createRetryPatch(getOverride(actionId)));
      window.alert('已在演示层将任务置为「执行中」并重试计数 +1（未写回数据文件）');
      return;
    }
    if (cta === 'takeover') {
      setOverride(actionId, createTakeoverPatch());
      window.alert('已在演示层标记人工接管，状态将切换为「需人工接管」');
      return;
    }
    if (cta === 'go_execute' && view.phase === 'needs_takeover') {
      setOverride(actionId, createClearTakeoverPatch());
      window.alert('演示：已接单继续推进，状态回到「执行中」覆盖层');
      return;
    }
    if (cta === 'submit_approval' || cta === 'reject' || cta === 'defer') {
      onApprovalCta?.(cta);
      return;
    }
    if (cta === 'view_diagnosis' && productId) {
      return;
    }
    window.alert(`演示动作：${CTA_LABEL[cta]}`);
  };

  const visibleCtas = pres.ctas.filter((cta) => {
    if (cta === 'retry' && !view.flags.canRetry) return false;
    if (cta === 'takeover' && !view.flags.canTakeover && view.phase !== 'needs_takeover') return false;
    return true;
  });

  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm',
        pres.borderClass,
        className,
      )}
    >
      <div className={cn('flex flex-col', pad)}>
        <div>
          <div className={heading}>当前状态</div>
          <p className={cn(body, 'mt-1 font-medium text-slate-800')}>{pres.labelZh}</p>
          {view.retryCount > 0 ? (
            <p className={cn(body, 'mt-0.5 text-slate-500')}>演示重试次数 · {view.retryCount}</p>
          ) : null}
        </div>

        <div>
          <div className={heading}>为何卡在这里</div>
          <p className={cn(body, 'mt-1')}>{view.whyStuck ?? pres.sublineZh}</p>
        </div>

        <div>
          <div className={heading}>下一步建议</div>
          <p className={cn(body, 'mt-1')}>{view.nextHint}</p>
        </div>

        <div>
          <div className={heading}>操作区</div>
          <div className={cn('mt-2 flex flex-wrap gap-2', compact && 'gap-1.5')}>
            {visibleCtas.map((cta) => {
              if (cta === 'view_diagnosis' && productId) {
                return (
                  <Button key={cta} variant="outline" size="sm" className="text-xs h-8" asChild>
                    <Link to={`/products/${productId}?focus=actions`}>{CTA_LABEL[cta]}</Link>
                  </Button>
                );
              }
              const primary = cta === 'submit_approval' || cta === 'retry' || cta === 'go_execute';
              return (
                <Button
                  key={cta}
                  variant={primary ? 'default' : 'outline'}
                  size="sm"
                  className={cn('text-xs h-8', cta === 'reject' && 'text-red-700 border-red-200')}
                  type="button"
                  onClick={() => runDemoCta(cta)}
                >
                  {CTA_LABEL[cta]}
                </Button>
              );
            })}
          </div>
        </div>

        <div className={cn('border-t border-slate-100 pt-2 mt-1', body)}>
          <p>
            可重试（演示）：{view.flags.canRetry ? '是' : '否'} · 可人工接管（演示）：{' '}
            {view.flags.canTakeover || view.phase === 'needs_takeover' ? '是' : '否'}
          </p>
        </div>
      </div>
    </div>
  );
}
