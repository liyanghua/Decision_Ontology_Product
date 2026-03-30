/** 复盘沉淀（DEMO）：前台可感知闭环，不接真实资产 API */

export type ReviewDepositionSource = 'execution_complete' | 'diagnosis_complete' | 'home_task_complete';

export type ReviewLedgerEntry = {
  id: string;
  source: ReviewDepositionSource;
  objectLabel: string;
  actionSummary: string;
  outcomeSummary: string;
  lesson: string;
  suggestForExperience: boolean;
  createdAtIso: string;
};

export type ReviewDepositionPrefill = {
  source: ReviewDepositionSource;
  objectLabel: string;
  actionSummary: string;
  outcomeSummary: string;
  defaultLesson?: string;
  defaultSuggest?: boolean;
};
