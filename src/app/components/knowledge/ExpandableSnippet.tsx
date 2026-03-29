import { useState } from 'react';

const MAX = 220;

export function ExpandableSnippet({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const needClamp = text.length > MAX;
  const shown = !needClamp || open ? text : `${text.slice(0, MAX)}…`;

  return (
    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
      {shown}
      {needClamp && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="ml-2 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {open ? '收起' : '展开'}
        </button>
      )}
    </div>
  );
}
