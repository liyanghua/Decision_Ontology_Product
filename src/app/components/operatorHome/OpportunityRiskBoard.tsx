import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sparkles } from 'lucide-react';
import type { OpportunityRiskCardVM } from '../../data/operatorHomeMock';
import { OperatorSupportHint } from './OperatorSupportHint';
import { opportunityRiskVmToDecisionCard } from '../../data/decisionCards/mapFromOperatorHome';
import { DecisionCardFrame } from '../decisionCards/DecisionCardFrame';

type OpportunityRiskBoardProps = {
  cards: OpportunityRiskCardVM[];
  status?: 'loading' | 'empty' | 'normal';
  onSupportClick?: (card: OpportunityRiskCardVM) => void;
};

export function OpportunityRiskBoard({
  cards,
  status = 'normal',
  onSupportClick,
}: OpportunityRiskBoardProps) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          关键机会 / 关键风险
        </CardTitle>
        <CardDescription>
          每张卡对应明确经营对象；点进详情即可看诊断结论与推荐打法，再决定优先处理顺序。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-4 h-36 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : status === 'empty' || cards.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">暂无机会或风险条目，队列更新后将显示此处。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((c) => (
              <div key={c.id} className="relative">
                <DecisionCardFrame
                  card={opportunityRiskVmToDecisionCard(c)}
                  to={c.href}
                >
                  {onSupportClick ? (
                    <OperatorSupportHint
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSupportClick(c);
                      }}
                    />
                  ) : null}
                </DecisionCardFrame>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
