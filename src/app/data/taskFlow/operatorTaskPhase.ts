/** 前台统一任务相位（与 legacy Action/Execution 映射后的最小闭集） */
export type OperatorTaskPhase =
  | 'draft'
  | 'waiting_input'
  | 'diagnosing'
  | 'pending_decision'
  | 'approved'
  | 'executing'
  | 'blocked'
  | 'failed'
  | 'needs_takeover'
  | 'completed'
  | 'archived';
