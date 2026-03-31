import { Link } from 'react-router';
import type { ReviewStatus } from '../../data/reviewLedgerTypes';
import { buildOperatorJourney } from '../../data/operatorJourney';
import type { OperatorTask } from '../../data/taskFlow';
import { useOperatorJourney } from '../../contexts/OperatorJourneyContext';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

type OperatorJourneyBarProps = {
  task: OperatorTask;
  actionId: string;
  productId?: string;
  reviewStatus?: ReviewStatus;
  className?: string;
};

function stepClasses(state: 'completed' | 'current' | 'upcoming') {
  if (state === 'completed') {
    return {
      wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      badge: 'bg-emerald-600 text-white',
      hint: '已完成',
    };
  }
  if (state === 'current') {
    return {
      wrapper: 'border-blue-200 bg-blue-50 text-blue-950',
      badge: 'bg-blue-600 text-white',
      hint: '当前所在',
    };
  }
  return {
    wrapper: 'border-slate-200 bg-white text-slate-700',
    badge: 'bg-slate-100 text-slate-500',
    hint: '下一步',
  };
}

export function OperatorJourneyBar({
  task,
  actionId,
  productId,
  reviewStatus,
  className,
}: OperatorJourneyBarProps) {
  const { getSession } = useOperatorJourney();
  const journey = buildOperatorJourney({
    actionId,
    productId: productId ?? task.productId,
    task,
    reviewStatus,
    session: getSession(actionId),
  });

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm',
        className,
      )}
      aria-label="操盘主线进度"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            操盘主线
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{journey.statusLabel}</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{journey.statusDetail}</p>
        </div>

        {journey.nextHref && journey.nextLabel ? (
          journey.nextHref.startsWith('#') ? (
            <Button asChild className="shrink-0">
              <a href={journey.nextHref}>{journey.nextLabel}</a>
            </Button>
          ) : (
            <Button asChild className="shrink-0">
              <Link to={journey.nextHref}>{journey.nextLabel}</Link>
            </Button>
          )
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {journey.steps.map((step, index) => {
          const tone = stepClasses(step.state);
          return (
            <div
              key={step.key}
              className={cn(
                'rounded-xl border px-3 py-3 transition-colors',
                tone.wrapper,
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                    tone.badge,
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">{tone.hint}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
