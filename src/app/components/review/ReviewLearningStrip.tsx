import { Link } from 'react-router';
import { X, BookMarked } from 'lucide-react';
import { useReviewLedger } from '../../contexts/ReviewLedgerContext';
import { Button } from '../ui/button';

export function ReviewLearningStrip() {
  const { lastDigest, dismissLastDigest, entries, summary } = useReviewLedger();

  if (!lastDigest) return null;

  return (
    <div className="shrink-0 border-b border-violet-200/80 bg-gradient-to-r from-violet-50/95 to-white px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-start gap-3 min-w-0">
          <BookMarked className="w-5 h-5 text-violet-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">
              已形成 1 条复盘记录
              {entries.length > 1 ? `（累计 ${entries.length} 条）` : ''}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              系统已记住这次处理
              {lastDigest.inCandidatePool
                ? `；已进入经验候选区，当前累计 ${summary.candidateCount} 条可供后续类似问题参考。`
                : '；这条复盘会保留在结果跟踪里，便于后续快速回看。'}
              <Link to="/replay#review-learning-path" className="text-violet-700 hover:underline ml-1">
                去看结果复盘
              </Link>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-500"
          onClick={dismissLastDigest}
          aria-label="关闭提示"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
