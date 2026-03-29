import { Lightbulb } from 'lucide-react';

export function StrategySupportTrigger({
  onClick,
  compact = false,
  className = '',
}: {
  onClick: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 text-violet-900 text-sm font-medium px-3 py-2 hover:bg-violet-100 transition-colors ${className}`}
    >
      <Lightbulb className="w-4 h-4 shrink-0" />
      {compact ? '策略支持' : '策略与机会支持'}
    </button>
  );
}
