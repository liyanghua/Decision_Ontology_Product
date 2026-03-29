import { GitBranch } from 'lucide-react';

export function FlowSupportTrigger({
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
      className={`inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 text-sm font-medium px-3 py-2 hover:bg-blue-100 transition-colors ${className}`}
    >
      <GitBranch className="w-4 h-4 shrink-0" />
      {compact ? '流程支持' : '流程与执行支持'}
    </button>
  );
}
