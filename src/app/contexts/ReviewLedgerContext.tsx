import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  LearningCandidate,
  ReviewCard,
  ReviewDepositionPrefill,
  ReviewStatus,
  ReviewSummary,
  ReviewTaskRefs,
} from '../data/reviewLedgerTypes';
import {
  buildReviewSummary,
  createReviewArtifacts,
  getLatestReviewForTask,
  getReviewStatusForTask,
  REVIEW_CARD_SEEDS,
  REVIEW_LEARNING_CANDIDATE_SEEDS,
} from '../data/reviewLedgerData';
import { ReviewDepositionDialog } from '../components/review/ReviewDepositionDialog';

type LastDigest = {
  entryId: string;
  suggestForExperience: boolean;
  inCandidatePool: boolean;
  at: number;
};

type ReviewLedgerContextValue = {
  entries: ReviewCard[];
  reviewCards: ReviewCard[];
  learningCandidates: LearningCandidate[];
  summary: ReviewSummary;
  openDeposition: (prefill: ReviewDepositionPrefill) => void;
  closeDeposition: () => void;
  commitDeposition: (payload: { lesson: string; suggestForExperience: boolean }) => void;
  lastDigest: LastDigest | null;
  dismissLastDigest: () => void;
  getReviewStatus: (taskRefs: ReviewTaskRefs) => ReviewStatus;
  getLatestReview: (taskRefs: ReviewTaskRefs) => ReviewCard | undefined;
};

const ReviewLedgerContext = createContext<ReviewLedgerContextValue | null>(null);

function newId(prefix: 'rv' | 'lc'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ReviewLedgerProvider({ children }: { children: ReactNode }) {
  const [reviewCards, setReviewCards] = useState<ReviewCard[]>(() => REVIEW_CARD_SEEDS);
  const [learningCandidates, setLearningCandidates] = useState<LearningCandidate[]>(
    () => REVIEW_LEARNING_CANDIDATE_SEEDS,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefill, setPrefill] = useState<ReviewDepositionPrefill | null>(null);
  const [lastDigest, setLastDigest] = useState<LastDigest | null>(null);

  const openDeposition = useCallback((p: ReviewDepositionPrefill) => {
    setPrefill(p);
    setSheetOpen(true);
  }, []);

  const closeDeposition = useCallback(() => {
    setSheetOpen(false);
    setPrefill(null);
  }, []);

  const dismissLastDigest = useCallback(() => setLastDigest(null), []);

  const getReviewStatus = useCallback(
    (taskRefs: ReviewTaskRefs) =>
      getReviewStatusForTask({
        reviewCards,
        learningCandidates,
        taskRefs,
      }),
    [learningCandidates, reviewCards],
  );

  const getLatestReview = useCallback(
    (taskRefs: ReviewTaskRefs) => getLatestReviewForTask(reviewCards, taskRefs),
    [reviewCards],
  );

  const commitDeposition = useCallback(
    (payload: { lesson: string; suggestForExperience: boolean }) => {
      if (!prefill) return;
      const createdAtIso = new Date().toISOString();
      const { reviewCard, learningCandidate } = createReviewArtifacts({
        reviewId: newId('rv'),
        candidateId: newId('lc'),
        createdAtIso,
        prefill,
        payload,
      });

      setReviewCards((prev) => [reviewCard, ...prev]);
      if (learningCandidate) {
        setLearningCandidates((prev) => [learningCandidate, ...prev]);
      }
      setLastDigest({
        entryId: reviewCard.id,
        suggestForExperience: reviewCard.suggestForExperience,
        inCandidatePool: reviewCard.inCandidatePool,
        at: Date.now(),
      });
    },
    [prefill],
  );

  const summary = useMemo(
    () =>
      buildReviewSummary({
        reviewCards,
        learningCandidates,
      }),
    [learningCandidates, reviewCards],
  );

  const value = useMemo(
    () => ({
      entries: reviewCards,
      reviewCards,
      learningCandidates,
      summary,
      openDeposition,
      closeDeposition,
      commitDeposition,
      lastDigest,
      dismissLastDigest,
      getReviewStatus,
      getLatestReview,
    }),
    [
      closeDeposition,
      commitDeposition,
      dismissLastDigest,
      getLatestReview,
      getReviewStatus,
      lastDigest,
      learningCandidates,
      openDeposition,
      reviewCards,
      summary,
    ],
  );

  return (
    <ReviewLedgerContext.Provider value={value}>
      {children}
      <ReviewDepositionDialog
        open={sheetOpen}
        prefill={prefill}
        onClose={closeDeposition}
        onCommit={commitDeposition}
      />
    </ReviewLedgerContext.Provider>
  );
}

export function useReviewLedger(): ReviewLedgerContextValue {
  const ctx = useContext(ReviewLedgerContext);
  if (!ctx) {
    throw new Error('useReviewLedger must be used within ReviewLedgerProvider');
  }
  return ctx;
}
