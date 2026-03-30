import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ReviewDepositionPrefill, ReviewLedgerEntry } from '../data/reviewLedgerTypes';
import { ReviewDepositionDialog } from '../components/review/ReviewDepositionDialog';

type LastDigest = {
  entryId: string;
  suggestForExperience: boolean;
  at: number;
};

type ReviewLedgerContextValue = {
  entries: ReviewLedgerEntry[];
  openDeposition: (prefill: ReviewDepositionPrefill) => void;
  closeDeposition: () => void;
  commitDeposition: (payload: { lesson: string; suggestForExperience: boolean }) => void;
  lastDigest: LastDigest | null;
  dismissLastDigest: () => void;
};

const ReviewLedgerContext = createContext<ReviewLedgerContextValue | null>(null);

function newId(): string {
  return `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ReviewLedgerProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ReviewLedgerEntry[]>([]);
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

  const commitDeposition = useCallback(
    (payload: { lesson: string; suggestForExperience: boolean }) => {
      if (!prefill) return;
      const entry: ReviewLedgerEntry = {
        id: newId(),
        source: prefill.source,
        objectLabel: prefill.objectLabel,
        actionSummary: prefill.actionSummary,
        outcomeSummary: prefill.outcomeSummary,
        lesson:
          payload.lesson.trim() ||
          prefill.defaultLesson?.trim() ||
          '（可稍后从回放页补充要点）',
        suggestForExperience: payload.suggestForExperience,
        createdAtIso: new Date().toISOString(),
      };
      setEntries((prev) => [entry, ...prev]);
      setLastDigest({
        entryId: entry.id,
        suggestForExperience: entry.suggestForExperience,
        at: Date.now(),
      });
    },
    [prefill],
  );

  const value = useMemo(
    () => ({
      entries,
      openDeposition,
      closeDeposition,
      commitDeposition,
      lastDigest,
      dismissLastDigest,
    }),
    [entries, openDeposition, closeDeposition, commitDeposition, lastDigest, dismissLastDigest],
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
