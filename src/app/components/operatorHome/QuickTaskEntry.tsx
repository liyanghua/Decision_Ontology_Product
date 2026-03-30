import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { routeOperatorHomeTaskQuery } from '../../data/operatorHomeTaskRouter';

type QuickTaskEntryProps = {
  examples: string[];
  /** 若提供则由父级处理；否则回车跳转到商品操盘台并带 q */
  onSubmitQuery?: (query: string) => void;
};

export function QuickTaskEntry({ examples, onSubmitQuery }: QuickTaskEntryProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (onSubmitQuery) {
      onSubmitQuery(q);
      return;
    }
    if (!q) {
      navigate('/products');
      return;
    }
    navigate(routeOperatorHomeTaskQuery(q));
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="py-3 px-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            一句话发起任务
          </div>
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2 min-w-0">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={examples[0] ?? '输入经营意图，回车进入操盘台（非聊天）'}
              className="flex-1 min-w-0 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button type="submit" size="sm" className="shrink-0">
              前往
            </Button>
          </form>
        </div>
        {examples.length > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            示例：{examples.slice(0, 3).join(' · ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
