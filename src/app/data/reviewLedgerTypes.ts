/** 复盘沉淀（DEMO）：前台只感知“系统记住了这次处理”。 */

export type ReviewDepositionSource =
  | 'execution_complete'
  | 'diagnosis_complete'
  | 'home_task_complete'
  | 'takeover_complete';

export type ReviewTaskRefs = {
  actionId?: string;
  executionId?: string;
  productId?: string;
  taskId?: string;
};

export type ReviewCard = {
  id: string;
  source: ReviewDepositionSource;
  objectLabel: string;
  originalProblem: string;
  actionSummary: string;
  actualResult: string;
  lesson: string;
  suggestForExperience: boolean;
  inCandidatePool: boolean;
  createdAtIso: string;
  taskRefs: ReviewTaskRefs;
};

export type LearningCandidate = {
  id: string;
  reviewId: string;
  source: ReviewDepositionSource;
  objectLabel: string;
  lesson: string;
  enteredAtIso: string;
  status: 'candidate';
  taskRefs: ReviewTaskRefs;
};

export type RecentCompletedTask = {
  id: string;
  title: string;
  productName: string;
  completedAt: string;
  href: string;
  productId?: string;
  actionId?: string;
  taskRefs: ReviewTaskRefs;
};

export type ReviewStatus = 'none' | 'reviewed' | 'candidate';

export type ReviewSummary = {
  totalReviews: number;
  candidateCount: number;
  lastUpdatedIso: string;
  recentReviews: ReviewCard[];
  recentCompletedTasks: RecentCompletedTask[];
  recentLearningCandidates: LearningCandidate[];
};

export type ReviewLedgerEntry = ReviewCard;

export type ReviewDepositionPrefill = {
  source: ReviewDepositionSource;
  objectLabel: string;
  originalProblem?: string;
  actionSummary: string;
  actualResult?: string;
  outcomeSummary?: string;
  defaultLesson?: string;
  defaultSuggest?: boolean;
  taskRefs?: ReviewTaskRefs;
};
