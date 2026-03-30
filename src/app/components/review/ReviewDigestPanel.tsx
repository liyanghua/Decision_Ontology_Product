import { Link } from 'react-router';
import { BookMarked, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import { buildReviewPrefillFromTask, buildReviewSummary } from '../../data/reviewLedgerData';
import type { RecentCompletedTaskVM } from '../../data/operatorHome/operatorHomeData';
import type { ReviewStatus } from '../../data/reviewLedgerTypes';
import { useReviewLedger } from '../../contexts/ReviewLedgerContext';
import { Button } from '../ui/button';
import { ReviewCardCard } from './ReviewCardCard';

type ReviewDigestPanelProps = {
  recentCompletedTasks: RecentCompletedTaskVM[];
};

function reviewStatusLabel(status: ReviewStatus) {
  if (status === 'candidate') return '已进入经验候选区';
  if (status === 'reviewed') return '已形成复盘';
  return '待形成复盘';
}

export function ReviewDigestPanel({ recentCompletedTasks }: ReviewDigestPanelProps) {
  const { reviewCards, learningCandidates, openDeposition, getReviewStatus, getLatestReview } =
    useReviewLedger();
  const summary = buildReviewSummary({
    reviewCards,
    learningCandidates,
    recentCompletedTasks,
  });

  return (
    <section className="space-y-4" aria-label="结果与沉淀">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-700">
            <BookMarked className="h-4 w-4" />
            <span className="text-sm font-medium">结果与沉淀</span>
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">系统正在记住这次处理</h2>
          <p className="mt-1 text-sm text-slate-600">
            最近新增复盘、刚完成的任务，以及进入经验候选区的经验都会在这里汇总。
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/replay#review-learning-path">查看沉淀路径</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BookMarked className="h-4 w-4 text-violet-700" />
            最近新增复盘卡
          </div>
          {summary.recentReviews.length > 0 ? (
            summary.recentReviews.map((reviewCard) => (
              <ReviewCardCard key={reviewCard.id} reviewCard={reviewCard} compact />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              最近还没有新的复盘记录。
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock3 className="h-4 w-4 text-emerald-700" />
            最近完成任务
          </div>
          {recentCompletedTasks.length > 0 ? (
            recentCompletedTasks.map((task) => {
              const status = getReviewStatus(task.taskRefs);
              const latestReview = getLatestReview(task.taskRefs);
              return (
                <article
                  key={task.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.productName} · {task.completedAt}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {reviewStatusLabel(status)}
                    </span>
                  </div>
                  {latestReview ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">{latestReview.lesson}</p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      这轮已经处理完成，可以顺手形成复盘，让系统记住这次做法。
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {status === 'none' ? (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => openDeposition(buildReviewPrefillFromTask(task.task))}
                      >
                        形成复盘
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                          <Link to="/replay#review-learning-path">
                          {status === 'candidate' ? '查看候选经验' : '查看复盘路径'}
                          </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                      <Link to={task.href}>回到任务</Link>
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              最近还没有完成任务进入沉淀区。
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-amber-600" />
            最近沉淀经验
          </div>
          {summary.recentLearningCandidates.length > 0 ? (
            summary.recentLearningCandidates.map((candidate) => (
              <article
                key={candidate.id}
                className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">{candidate.objectLabel}</h3>
                  <span className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    经验候选
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{candidate.lesson}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {candidate.enteredAtIso.replace('T', ' ').slice(0, 16)} · 可供后续类似问题参考
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              最近还没有新进入经验候选区的经验。
            </div>
          )}

          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-950">
              <CheckCircle2 className="h-4 w-4" />
              轻量反馈
            </div>
            <ul className="mt-3 space-y-2 text-sm text-violet-900">
              <li>已形成 {summary.totalReviews} 条复盘记录</li>
              <li>已进入经验候选区 {summary.candidateCount} 条</li>
              <li>这些经验会帮助后续建议更贴近真实处理方式</li>
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}
