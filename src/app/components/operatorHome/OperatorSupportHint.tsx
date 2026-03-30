import type { MouseEvent } from 'react';
import { BookOpen } from 'lucide-react';

type OperatorSupportHintProps = {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

/** 首页轻量策略知识入口：仅打开抽屉，非诊断结论。 */
export function OperatorSupportHint({ onClick, className = '' }: OperatorSupportHintProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="辅助知识 · 非诊断结论"
      aria-label="策略参考"
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
    >
      <BookOpen className="w-4 h-4" />
    </button>
  );
}
