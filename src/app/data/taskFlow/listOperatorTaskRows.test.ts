import { describe, expect, it } from 'vitest';
import { listOperatorTaskRows } from './listOperatorTaskRows';

describe('listOperatorTaskRows', () => {
  it('includes execution-only failed rows in the unified task list', () => {
    const rows = listOperatorTaskRows();
    const failedExecutionOnlyRow = rows.find((row) => row.action.id === 'A007');

    expect(failedExecutionOnlyRow).toBeTruthy();
    expect(failedExecutionOnlyRow?.sourceKind).toBe('execution_only');
    expect(failedExecutionOnlyRow?.task.status).toBe('failed');
    expect(failedExecutionOnlyRow?.task.sourceRefs.executionId).toBe('EX003');
  });

  it('includes pre-stage seed rows for waiting input and diagnosis wrap-up', () => {
    const rows = listOperatorTaskRows();
    const prestageRows = rows.filter((row) => row.sourceKind === 'prestage_seed');

    expect(prestageRows).toHaveLength(2);
    expect(prestageRows.some((row) => row.task.status === 'waiting_input')).toBe(true);
    expect(prestageRows.some((row) => row.task.status === 'diagnosing')).toBe(true);
  });
});
