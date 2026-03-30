import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import type { WorkspacePrefs } from '../../data/operatorWorkspacePrefs';
import { saveWorkspacePrefs } from '../../data/operatorWorkspacePrefs';

const DEFAULT_SHOP = '梓晨家居旗舰店';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryOptions: string[];
  /** 已有偏好时预填（含编辑） */
  seed: WorkspacePrefs | null;
  onComplete: (prefs: WorkspacePrefs) => void;
};

export function OperatorWorkspaceOnboarding({
  open,
  onOpenChange,
  categoryOptions,
  seed,
  onComplete,
}: Props) {
  const [step, setStep] = useState(0);
  const [shopName, setShopName] = useState(DEFAULT_SHOP);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(() => new Set());
  const [monthlyGoal, setMonthlyGoal] = useState(
    '本月目标：提升 CTR 与转化率，稳住核心链接 GMV 占比',
  );

  useEffect(() => {
    if (!open) return;
    setStep(0);
    if (seed?.onboardingCompleted || (seed && seed.shopName)) {
      setShopName(seed.shopName.trim() || DEFAULT_SHOP);
      setSelectedCats(new Set(seed.categories ?? []));
      setMonthlyGoal(
        seed.monthlyGoal.trim() || '本月目标：提升 CTR 与转化率，稳住核心链接 GMV 占比',
      );
    } else {
      setShopName(DEFAULT_SHOP);
      setSelectedCats(new Set());
      setMonthlyGoal('本月目标：提升 CTR 与转化率，稳住核心链接 GMV 占比');
    }
  }, [open, seed]);

  const toggleCategory = (c: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const handleFinish = () => {
    const prefs: WorkspacePrefs = {
      onboardingCompleted: true,
      shopName: shopName.trim() || DEFAULT_SHOP,
      categories: [...selectedCats],
      monthlyGoal: monthlyGoal.trim() || '本月聚焦核心链接的经营结果',
      completedAtIso: new Date().toISOString(),
    };
    saveWorkspacePrefs(prefs);
    onComplete(prefs);
    onOpenChange(false);
  };

  const canNextFromShop = shopName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 0 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">欢迎使用经营搭档</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                这里汇总今日重点、机会与风险、待推进动作。先确认你负责的店铺名称，后续记忆区会展示给团队与系统引用（本地保存，演示环境不上传服务器）。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-1">
              <Label htmlFor="onb-shop">我负责的店铺</Label>
              <Input
                id="onb-shop"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="例：梓晨家居旗舰店"
                autoComplete="organization"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                稍后再说
              </Button>
              <Button type="button" disabled={!canNextFromShop} onClick={() => setStep(1)}>
                下一步
              </Button>
            </DialogFooter>
          </>
        ) : step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">我关注的类目</DialogTitle>
              <DialogDescription className="text-sm">
                可多选，便于与队列、机会卡对照；不选则沿用数据里的默认类目归纳。
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-md p-3 bg-slate-50/50">
              {categoryOptions.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${c}`}
                    checked={selectedCats.has(c)}
                    onCheckedChange={() => toggleCategory(c)}
                  />
                  <Label htmlFor={`cat-${c}`} className="text-sm font-normal cursor-pointer">
                    {c}
                  </Label>
                </div>
              ))}
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                上一步
              </Button>
              <Button type="button" onClick={() => setStep(2)}>
                下一步
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">本月经营目标</DialogTitle>
              <DialogDescription className="text-sm">
                用一句话写清本月要拿到的经营结果，会显示在「经营记忆」卡片中。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-1">
              <Label htmlFor="onb-goal">本月目标</Label>
              <Textarea
                id="onb-goal"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
                placeholder="例：稳住核心链接 GMV 占比，提升 CTR 与转化"
                className="min-h-20"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                上一步
              </Button>
              <Button type="button" onClick={handleFinish}>
                完成
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
