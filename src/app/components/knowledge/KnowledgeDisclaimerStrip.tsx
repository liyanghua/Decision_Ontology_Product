import { AlertTriangle } from 'lucide-react';
import { KNOWLEDGE_SUPPORT_DISCLAIMER_LINES } from '../../data/expertKnowledge';

export function KnowledgeDisclaimerStrip({
  variant = 'amber',
}: {
  variant?: 'amber' | 'slate';
}) {
  const box =
    variant === 'amber'
      ? 'border-amber-200 bg-amber-50/90 text-amber-950'
      : 'border-slate-200 bg-slate-50 text-slate-800';

  return (
    <details className={`rounded-lg border ${box} px-3 py-2 text-xs leading-relaxed`}>
      <summary className="cursor-pointer list-none flex items-center gap-2 font-medium select-none">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 opacity-80" />
        <span>知识支持说明（必读）</span>
      </summary>
      <ul className="mt-2 space-y-1 pl-5 list-disc text-[11px] opacity-95">
        {KNOWLEDGE_SUPPORT_DISCLAIMER_LINES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </details>
  );
}
