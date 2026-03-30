import { TaskStateBadge } from './TaskStateBadge';
import type { OperatorTask, TaskActionSource } from '../../data/taskFlow';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { TaskFlowSidePanel } from './TaskFlowSidePanel';
import { TaskActionPanel } from './TaskActionPanel';

type TaskActionDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: OperatorTask | null;
  actionId?: string;
  productId?: string;
  detailHref?: string;
  source?: TaskActionSource;
};

export function TaskActionDrawer({
  open,
  onOpenChange,
  task,
  actionId,
  productId,
  detailHref,
  source = 'task_detail',
}: TaskActionDrawerProps) {
  const resolvedActionId = actionId || task?.sourceRefs.actionId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-hidden border-l border-slate-200 bg-slate-50 sm:max-w-2xl">
        {task ? (
          <>
            <SheetHeader className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <TaskStateBadge phase={task.status} />
                <span className="text-xs text-slate-500">{task.productName}</span>
              </div>
              <SheetTitle className="mt-2 text-left text-xl text-slate-900">{task.title}</SheetTitle>
              <SheetDescription className="text-left leading-6">
                在这里直接拍板、继续推进，或把失败任务转成人工处理，不需要切到传统审批流。
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {resolvedActionId ? (
                  <TaskFlowSidePanel
                    task={task}
                    actionId={resolvedActionId}
                    productId={productId || task.productId}
                    showActions={false}
                  />
                ) : null}

                {resolvedActionId ? (
                  <TaskActionPanel
                    task={task}
                    actionId={resolvedActionId}
                    productId={productId || task.productId}
                    detailHref={detailHref}
                    source={source}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
