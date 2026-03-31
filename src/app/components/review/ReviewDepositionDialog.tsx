import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { ReviewDepositionPrefill } from '../../data/reviewLedgerTypes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';

type Props = {
  open: boolean;
  prefill: ReviewDepositionPrefill | null;
  onClose: () => void;
  onCommit: (payload: { lesson: string; suggestForExperience: boolean }) => void;
};

export function ReviewDepositionDialog({ open, prefill, onClose, onCommit }: Props) {
  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [lesson, setLesson] = useState('');
  const [suggest, setSuggest] = useState(true);
  const [lastSuggest, setLastSuggest] = useState(true);

  useEffect(() => {
    if (!open) {
      setPhase('form');
      setLesson('');
      setSuggest(true);
      return;
    }
    if (prefill) {
      setLesson(prefill.defaultLesson ?? '');
      setSuggest(prefill.defaultSuggest !== false);
    }
  }, [open, prefill]);

  const handleSubmit = () => {
    if (!prefill) return;
    onCommit({ lesson, suggestForExperience: suggest });
    setLastSuggest(suggest);
    setPhase('success');
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {phase === 'form' && prefill ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-violet-900">
                <Sparkles className="w-5 h-5 shrink-0" />
                <DialogTitle>沉淀本次复盘</DialogTitle>
              </div>
              <DialogDescription>
                用一两句话记下「做了什么、结果如何、下次怎么用」。系统会把这次处理留档；若勾选参考经验，会先进入经验候选区，供后续类似问题参考。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2">
                <div className="text-xs font-medium text-slate-500 mb-0.5">本次处理对象</div>
                <div className="text-slate-900 font-medium leading-snug">{prefill.objectLabel}</div>
              </div>
              {prefill.originalProblem ? (
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <div className="text-xs font-medium text-slate-500 mb-0.5">原始问题</div>
                  <div className="text-slate-800 leading-relaxed">{prefill.originalProblem}</div>
                </div>
              ) : null}
              <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2">
                <div className="text-xs font-medium text-slate-500 mb-0.5">采取的动作</div>
                <div className="text-slate-800 leading-relaxed">{prefill.actionSummary}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2">
                <div className="text-xs font-medium text-slate-500 mb-0.5">实际结果</div>
                <div className="text-slate-800 leading-relaxed">
                  {prefill.actualResult || prefill.outcomeSummary}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-lesson" className="text-slate-700">
                  经验总结
                </Label>
                <Textarea
                  id="review-lesson"
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="例如：主图改版后 CTR 明显提升，注意保留卖点与人群一致性。"
                  className="min-h-24"
                />
              </div>

              <div className="flex items-start gap-3 rounded-md border border-violet-100 bg-violet-50/50 px-3 py-3">
                <Checkbox
                  id="review-suggest"
                  checked={suggest}
                  onCheckedChange={(v) => setSuggest(v === true)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label htmlFor="review-suggest" className="text-slate-800 font-medium cursor-pointer">
                    建议作为后续决策的参考经验
                  </Label>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    勾选后，将进入经验候选区并由系统先做一轮轻量核对；不勾选则仅保留这条复盘记录，仍可在结果复盘里随时回看。
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="button" onClick={handleSubmit}>
                确认沉淀
              </Button>
            </DialogFooter>
          </>
        ) : phase === 'success' ? (
          <>
            <DialogHeader>
              <DialogTitle>已收到你的复盘</DialogTitle>
              <DialogDescription>以下为本次提交后的进度反馈。</DialogDescription>
            </DialogHeader>

            <ul className="space-y-3 text-sm">
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-900">已形成 1 条复盘记录</div>
                  <p className="text-slate-600 text-xs mt-0.5">系统已记住这次处理，后续可继续对照参考。</p>
                </div>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2
                  className={cn(
                    'w-5 h-5 shrink-0 mt-0.5',
                    lastSuggest ? 'text-emerald-600' : 'text-slate-300',
                  )}
                />
                <div>
                  <div className={cn('font-medium', lastSuggest ? 'text-slate-900' : 'text-slate-500')}>
                    已进入经验候选区
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {lastSuggest
                      ? '同类问题再出现时，系统可能优先参考这次处理。'
                      : '本次未勾选参考经验，已跳过经验候选区；可随时补记。'}
                  </p>
                </div>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2
                  className={cn(
                    'w-5 h-5 shrink-0 mt-0.5',
                    lastSuggest ? 'text-emerald-600' : 'text-slate-300',
                  )}
                />
                <div>
                  <div className={cn('font-medium', lastSuggest ? 'text-slate-900' : 'text-slate-500')}>
                    可供后续类似问题参考
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {lastSuggest
                      ? '系统会带着这次经验，帮助后续建议更贴近真实处理方式。'
                      : '这条记录会保留在复盘里，便于你下次快速回看。'}
                  </p>
                </div>
              </li>
            </ul>

            <DialogFooter>
              <Button type="button" onClick={handleDone}>
                完成
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
