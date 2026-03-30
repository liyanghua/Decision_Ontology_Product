import type { OperatorTaskPhase } from '../../data/taskFlow/operatorTaskPhase';
import { OPERATOR_TASK_PRESENTATION } from '../../data/taskFlow/operatorTaskStatePresentation';
import { cn } from '../ui/utils';

type TaskStateBadgeProps = {
  phase: OperatorTaskPhase;
  className?: string;
};

export function TaskStateBadge({ phase, className }: TaskStateBadgeProps) {
  const pres = OPERATOR_TASK_PRESENTATION[phase];
  return (
    <span
      className={cn(
        'inline-flex items-center max-w-full truncate px-2 py-0.5 text-xs font-medium rounded-full border',
        pres.badgeClass,
        className,
      )}
      title={pres.sublineZh}
    >
      {pres.labelZh}
    </span>
  );
}
