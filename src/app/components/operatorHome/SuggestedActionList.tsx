import { Link } from 'react-router';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import type { SuggestedActionVM } from '../../data/operatorHomeMock';
import { OperatorSupportHint } from './OperatorSupportHint';
import { suggestedVmToDecisionCard } from '../../data/decisionCards/mapFromOperatorHome';
import { DecisionCardFrame } from '../decisionCards/DecisionCardFrame';
import { TaskStateBadge } from '../taskFlow/TaskStateBadge';

type SuggestedActionListProps = {
  suggestions: SuggestedActionVM[];
  status?: 'loading' | 'empty' | 'normal';
  onSupportClick?: (s: SuggestedActionVM) => void;
  onOpenTask?: (s: SuggestedActionVM) => void;
};

export function SuggestedActionList({
  suggestions,
  status = 'normal',
  onSupportClick,
  onOpenTask,
}: SuggestedActionListProps) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-slate-700" />
          今日建议动作
        </CardTitle>
        <CardDescription>已经形成打法、等待拍板的动作。先看一眼诊断，再把最重要的一条推进下去。</CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <ul className="space-y-2">
            {[1, 2, 3].map((i) => (
              <li key={i} className="rounded-lg border border-slate-100 p-3 h-28 animate-pulse bg-slate-50" />
            ))}
          </ul>
        ) : status === 'empty' || suggestions.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">暂无待审批建议动作。</p>
        ) : (
          <ul className="space-y-4">
            {suggestions.map((a) => {
              const card = suggestedVmToDecisionCard(a);
              return (
                <li key={a.id} className="space-y-2">
                  <div className="flex items-center gap-2 px-0.5">
                    <TaskStateBadge phase={a.task.status} />
                  </div>
                  <div className="relative">
                    <DecisionCardFrame card={card} to={a.detailHref}>
                      {onSupportClick ? (
                        <OperatorSupportHint
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSupportClick(a);
                          }}
                        />
                      ) : null}
                    </DecisionCardFrame>
                  </div>
                  <div className="flex flex-wrap gap-2 px-0.5">
                    <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                      <Link to={a.detailHref}>看诊断里的打法</Link>
                    </Button>
                    {onOpenTask ? (
                      <Button
                        size="sm"
                        className="text-xs h-8"
                        type="button"
                        onClick={() => onOpenTask(a)}
                      >
                        去拍板
                      </Button>
                    ) : (
                      <Button size="sm" className="text-xs h-8" asChild>
                        <Link to={a.processHref}>去拍板</Link>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
