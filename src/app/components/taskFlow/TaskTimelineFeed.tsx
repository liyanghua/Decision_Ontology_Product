import type { OperatorTask } from '../../data/taskFlow';
import { cn } from '../ui/utils';

type TaskTimelineFeedProps = {
  task: OperatorTask;
  title?: string;
  className?: string;
  emptyLabel?: string;
};

function toneClass(tone: OperatorTask['timeline'][number]['tone']): string {
  if (tone === 'good') return 'bg-emerald-500';
  if (tone === 'warning') return 'bg-amber-500';
  if (tone === 'danger') return 'bg-rose-500';
  return 'bg-slate-400';
}

export function TaskTimelineFeed({
  task,
  title = '推进时间线',
  className,
  emptyLabel = '这条任务还没有新的处理记录。',
}: TaskTimelineFeedProps) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white', className)}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="px-4 py-4">
        {task.timeline.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        ) : (
          <ol className="space-y-4">
            {task.timeline.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', toneClass(item.tone))} />
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <div className="text-sm font-medium text-slate-900">{item.title}</div>
                    {item.outcomeLabel ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {item.outcomeLabel}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span>{item.at}</span>
                    {item.actorLabel ? <span>{item.actorLabel}</span> : null}
                  </div>
                  {item.detail ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
