import type { TaskStatusPresentation } from './taskStatusConfig';
import { TASK_STATUS_CONFIG, formatNextHint } from './taskStatusConfig';
import type { TaskAction, TaskBadgeTone } from './taskTypes';

export type TaskFlowCta = TaskAction;
export type PresentationTone = TaskBadgeTone;
export type PhasePresentation = TaskStatusPresentation;

export const OPERATOR_TASK_PRESENTATION = TASK_STATUS_CONFIG;

export { formatNextHint };
