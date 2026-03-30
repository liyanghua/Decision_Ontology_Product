import { Badge } from '../ui/badge';
import type { OperatorObjectSummary } from '../../data/operatorHomeMock';

const TYPE_LABEL: Record<OperatorObjectSummary['object_type'], string> = {
  product: '商品',
  category: '类目',
  shop: '店铺',
  campaign: '活动',
  channel: '渠道',
};

function riskZh(level?: OperatorObjectSummary['risk_level']): string | null {
  if (!level) return null;
  if (level === 'high') return '高风险';
  if (level === 'medium') return '中风险';
  return '低风险';
}

type ObjectContextLineProps = {
  object: OperatorObjectSummary;
  /** 是否展示风险徽标（与卡片内其它 Badge 并存时可关） */
  showRisk?: boolean;
  className?: string;
};

/** 首页经营对象一行：类型 + 名称 + 可选风险，偏操盘语境而非「对象管理」 */
export function ObjectContextLine({ object, showRisk = true, className = '' }: ObjectContextLineProps) {
  const risk = showRisk ? riskZh(object.risk_level) : null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 text-slate-600 border-slate-200">
        {TYPE_LABEL[object.object_type]}
      </Badge>
      <span className="text-sm font-medium text-slate-900 truncate max-w-[min(100%,14rem)] sm:max-w-[18rem]">
        {object.object_name}
      </span>
      {risk ? (
        <Badge
          variant="secondary"
          className={
            object.risk_level === 'high'
              ? 'text-[10px] bg-red-50 text-red-800 border-red-100'
              : object.risk_level === 'medium'
                ? 'text-[10px] bg-amber-50 text-amber-900 border-amber-100'
                : 'text-[10px] bg-slate-50 text-slate-700 border-slate-100'
          }
        >
          {risk}
        </Badge>
      ) : null}
    </div>
  );
}
