import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { DecisionCard, DecisionCardType } from '../../data/decisionCards/decisionCardTypes';
import { Badge } from '../ui/badge';

const TYPE_LABEL: Record<DecisionCardType, string> = {
  OpportunityCard: '机会',
  RiskCard: '风险',
  DiagnosisCard: '诊断',
  StrategyCard: '策略',
  ActionCard: '动作',
  ReviewCard: '复盘',
};

const SHELL: Record<DecisionCardType, string> = {
  OpportunityCard: 'border-emerald-200/90 bg-emerald-50/25',
  RiskCard: 'border-red-200/90 bg-red-50/25',
  DiagnosisCard: 'border-slate-200 bg-white',
  StrategyCard: 'border-green-200/80 bg-green-50/20',
  ActionCard: 'border-amber-200/90 bg-amber-50/20',
  ReviewCard: 'border-violet-200/80 bg-violet-50/20',
};

function riskZh(level?: 'high' | 'medium' | 'low'): string | null {
  if (!level) return null;
  if (level === 'high') return '高风险';
  if (level === 'medium') return '中风险';
  return '低风险';
}

type DecisionCardFrameProps = {
  card: DecisionCard;
  to?: string;
  onActivate?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
  /** 右上角：如策略知识入口 */
  children?: ReactNode;
};

export function DecisionCardFrame({
  card,
  to,
  onActivate,
  variant = 'default',
  className = '',
  children,
}: DecisionCardFrameProps) {
  const shell = SHELL[card.card_type];
  const pad = variant === 'compact' ? 'p-3' : 'p-4';
  const rk = riskZh(card.risk_level);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <Badge variant="outline" className="text-[10px] font-medium text-slate-600 border-slate-200 shrink-0">
            {TYPE_LABEL[card.card_type]}
          </Badge>
          {card.priority !== 'unset' ? (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700">
              {card.priority}
            </Badge>
          ) : null}
          {rk ? (
            <span className="text-[10px] text-slate-500">{rk}</span>
          ) : null}
        </div>
        {children ? <div className="shrink-0 -mr-1">{children}</div> : null}
      </div>
      <h3
        className={`font-semibold text-slate-900 leading-snug pr-6 ${variant === 'compact' ? 'text-sm' : 'text-base'}`}
      >
        {card.title}
      </h3>
      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{card.summary}</p>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div>
          <dt className="text-slate-400 font-medium">当前状态</dt>
          <dd className="text-slate-800">{card.current_status}</dd>
        </div>
        <div>
          <dt className="text-slate-400 font-medium">为何值得关注</dt>
          <dd className="text-slate-700 leading-relaxed line-clamp-4">{card.why_now}</dd>
        </div>
        <div>
          <dt className="text-slate-400 font-medium">推荐动作</dt>
          <dd className="text-slate-900 font-medium leading-snug">{card.recommended_action}</dd>
        </div>
      </dl>
      {card.owner || card.linked_asset || (card.linked_memory && card.linked_memory.length > 0) ? (
        <div className="mt-2 pt-2 border-t border-slate-100/90 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
          {card.owner ? <span>负责人 · {card.owner}</span> : null}
          {card.linked_asset ? (
            <span className="font-mono text-slate-600">标的 {card.linked_asset}</span>
          ) : null}
          {card.linked_memory?.slice(0, 2).map((m, i) => (
            <span key={i} className="truncate max-w-[11rem]" title={m}>
              {m}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-end text-xs text-blue-700 font-medium">
        进入详情
        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
      </div>
    </>
  );

  const wrapClass = `rounded-lg border text-left transition-shadow hover:shadow-sm ${shell} ${pad} ${className}`;

  if (onActivate) {
    return (
      <button type="button" onClick={onActivate} className={`w-full block ${wrapClass}`}>
        {inner}
      </button>
    );
  }
  if (to) {
    return (
      <Link to={to} className={`block ${wrapClass}`}>
        {inner}
      </Link>
    );
  }
  return <div className={wrapClass}>{inner}</div>;
}
