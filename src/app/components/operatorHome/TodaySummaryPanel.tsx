import { Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { TodaySummaryVM } from '../../data/operatorHomeMock';
import { spotlightToDecisionCard } from '../../data/decisionCards/mapFromOperatorHome';
import { DecisionCardFrame } from '../decisionCards/DecisionCardFrame';

type TodaySummaryPanelProps = {
  data: TodaySummaryVM;
  status?: 'loading' | 'empty' | 'normal';
};

export function TodaySummaryPanel({ data, status = 'normal' }: TodaySummaryPanelProps) {
  if (status === 'loading') {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="py-10">
          <div className="h-8 w-48 bg-slate-100 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-lg animate-pulse border border-slate-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  if (status === 'empty') {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="py-10 text-center text-sm text-slate-600">
          暂无今日重点数据。加载商品队列后可查看摘要与进度。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              今日重点
            </CardTitle>
            <CardDescription className="mt-1">{data.period}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-100">
              {data.opportunityCount} 条关键机会
            </Badge>
            <Badge variant="secondary" className="bg-red-50 text-red-800 border-red-100">
              {data.riskCount} 条关键风险
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link to="/today">查看更多盘面</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50/90 px-4 py-3">
            <div className="text-xs text-slate-500 mb-1">目标 GMV</div>
            <div className="text-lg font-semibold text-slate-900">{data.targetGmvLabel}</div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/90 px-4 py-3">
            <div className="text-xs text-slate-500 mb-1">当前完成</div>
            <div className="text-lg font-semibold text-slate-900">{data.currentGmvLabel}</div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/90 px-4 py-3">
            <div className="text-xs text-slate-500 mb-1">完成率</div>
            <div className="text-lg font-semibold text-slate-900">{data.progressPct}%</div>
          </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-4 py-3">
            <div className="text-xs text-slate-600 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              今日结论
            </div>
            <div className="text-sm font-medium text-slate-900 leading-snug">{data.headline}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>目标完成进度</span>
            <span>{data.progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${Math.min(100, data.progressPct)}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-blue-200 pl-3">
          {data.subline}
        </p>
        {data.spotlights && data.spotlights.length > 0 ? (
          <div className="rounded-lg border border-slate-100 bg-white/80 p-3 space-y-2">
            <div className="text-xs font-medium text-slate-500 tracking-wide">今日优先跟进（点卡片进诊断）</div>
            <ul className="space-y-2 list-none p-0 m-0">
              {data.spotlights.map((s, i) => {
                const dc = spotlightToDecisionCard(s);
                return (
                  <li key={`${s.object.object_id}-${i}`}>
                    <DecisionCardFrame card={dc} to={s.href} variant="compact" />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
