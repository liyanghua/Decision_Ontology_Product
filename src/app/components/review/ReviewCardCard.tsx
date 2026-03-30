import { BookMarked, CheckCircle2, Sparkles } from 'lucide-react';
import type { ReviewCard } from '../../data/reviewLedgerTypes';
import { cn } from '../ui/utils';

type ReviewCardCardProps = {
  reviewCard: ReviewCard;
  compact?: boolean;
  className?: string;
};

export function ReviewCardCard({
  reviewCard,
  compact = false,
  className,
}: ReviewCardCardProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-violet-200 bg-white shadow-sm',
        compact ? 'p-4' : 'p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-violet-700">
            <BookMarked className="h-3.5 w-3.5" />
            复盘卡
          </div>
          <h3 className="mt-1 text-sm font-semibold leading-6 text-slate-900">
            {reviewCard.objectLabel}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{reviewCard.createdAtIso.replace('T', ' ').slice(0, 16)}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {reviewCard.inCandidatePool ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <Sparkles className="h-3 w-3" />
              已进入经验候选区
            </span>
          ) : null}
          {reviewCard.suggestForExperience && !reviewCard.inCandidatePool ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
              <CheckCircle2 className="h-3 w-3" />
              建议沉淀为经验
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn('grid gap-3', compact ? 'mt-3' : 'mt-4')}>
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-medium text-slate-500">原始问题</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{reviewCard.originalProblem}</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-medium text-slate-500">采取的动作</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{reviewCard.actionSummary}</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-medium text-slate-500">实际结果</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{reviewCard.actualResult}</p>
        </section>
        <section className="rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-3">
          <div className="text-[11px] font-medium text-violet-700">经验总结</div>
          <p className="mt-1 text-sm leading-6 text-violet-950">{reviewCard.lesson}</p>
        </section>
      </div>
    </article>
  );
}
