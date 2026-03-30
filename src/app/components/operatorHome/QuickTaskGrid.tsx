import { Link } from 'react-router';
import {
  Package,
  CalendarRange,
  CheckCircle,
  Activity,
  PlayCircle,
  LayoutGrid,
  ScanSearch,
  TrendingUp,
  GitBranch,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { QuickTaskVM } from '../../data/operatorHomeMock';

const ICONS: Record<NonNullable<QuickTaskVM['iconKey']>, LucideIcon> = {
  products: Package,
  today: CalendarRange,
  approvals: CheckCircle,
  execution: Activity,
  replay: PlayCircle,
  diagnosis: ScanSearch,
  opportunity: TrendingUp,
  replayActivity: GitBranch,
  contentTraffic: Megaphone,
};

type QuickTaskGridProps = {
  tasks: QuickTaskVM[];
  /** loading：展示占位条 */
  status?: 'loading' | 'normal';
};

export function QuickTaskGrid({ tasks, status = 'normal' }: QuickTaskGridProps) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-slate-600" />
          立即行动
        </CardTitle>
        <CardDescription>与演示主线一致：先进诊断，再跟机会，落地后看结果对比。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {status === 'loading'
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-slate-100 p-3 animate-pulse bg-slate-50 h-14" />
            ))
          : tasks.map((t) => {
              const Icon = (t.iconKey && ICONS[t.iconKey]) || LayoutGrid;
              const inner = (
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{t.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">{t.description}</div>
                  </div>
                </div>
              );
              return (
                <Link
                  key={t.id}
                  to={t.href}
                  className="block rounded-lg border border-slate-100 p-3 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                >
                  {inner}
                </Link>
              );
            })}
      </CardContent>
    </Card>
  );
}
