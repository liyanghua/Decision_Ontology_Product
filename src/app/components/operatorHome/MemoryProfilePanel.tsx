import { Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { MemoryProfileVM } from '../../data/operatorHomeMock';

type MemoryProfilePanelProps = {
  profile: MemoryProfileVM;
  status?: 'loading' | 'normal';
  /** 已完成首次引导后展示，打开经营偏好编辑 */
  onEditPreferences?: () => void;
};

export function MemoryProfilePanel({
  profile,
  status = 'normal',
  onEditPreferences,
}: MemoryProfilePanelProps) {
  if (status === 'loading') {
    return (
      <Card className="border-slate-200 shadow-sm h-full bg-slate-50/40">
        <CardContent className="py-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse border border-slate-100" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm h-full bg-slate-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-600" />
          经营记忆
        </CardTitle>
        <CardDescription>由你维护的负责范围与本月目标（与诊断结论区分）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
          <div className="text-xs font-medium text-slate-500">店铺</div>
          <div className="text-slate-900 mt-0.5">{profile.shopName}</div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
          <div className="text-xs font-medium text-slate-500">类目重点</div>
          <div className="text-slate-900 mt-0.5 leading-snug">{profile.categoryFocus}</div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
          <div className="text-xs font-medium text-slate-500">本月目标</div>
          <div className="text-slate-900 mt-0.5 leading-snug">{profile.monthlyGoal}</div>
        </div>
        {profile.queueNote ? (
          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
            {profile.queueNote}
          </p>
        ) : null}
        {onEditPreferences ? (
          <button
            type="button"
            onClick={onEditPreferences}
            className="text-xs text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline w-fit pt-1"
          >
            更新经营偏好
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}
