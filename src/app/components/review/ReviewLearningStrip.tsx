import { Link } from 'react-router';
import { X, BookMarked } from 'lucide-react';
import { useReviewLedger } from '../../contexts/ReviewLedgerContext';
import { Button } from '../ui/button';

export function ReviewLearningStrip() {
  const { lastDigest, dismissLastDigest, entries } = useReviewLedger();

  if (!lastDigest) return null;

  return (
    <div className="shrink-0 border-b border-violet-200/80 bg-gradient-to-r from-violet-50/95 to-white px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-start gap-3 min-w-0">
          <BookMarked className="w-5 h-5 text-violet-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">
              系统已记下你的处理结论
              {entries.length > 1 ? `（累计 ${entries.length} 条复盘）` : ''}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              这次经验可能在后续同类决策中被参考
              {lastDigest.suggestForExperience ? '；已进入候选经验池，并排队做轻量核对。' : '。'}
              <Link to="/replay#review-learning-path" className="text-violet-700 hover:underline ml-1">
                查看沉淀路径
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
