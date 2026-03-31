import { describe, expect, it } from 'vitest';
import { getInProgressTasks, getRecentCompletedTasks, getSuggestedActions } from './operatorHomeData';

describe('operatorHomeData task adapters', () => {
  it('returns in-progress tasks with unified task metadata', () => {
    const items = getInProgressTasks();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.task != null)).toBe(true);
    expect(
      items.some((item) =>
        item.task.status === 'waiting_input' ||
        item.task.status === 'diagnosing' ||
        item.task.status === 'pending_decision' ||
        item.task.status === 'approved' ||
        item.task.status === 'executing' ||
        item.task.status === 'failed' ||
        item.task.status === 'needs_takeover',
      ),
    ).toBe(true);
    expect(items.some((item) => item.task.timeline.length > 0)).toBe(true);
  });

  it('surfaces pre-stage tasks on the homepage so the operator can continue preparation work', () => {
    const items = getInProgressTasks();
    expect(items.some((item) => item.task.status === 'waiting_input')).toBe(true);
    expect(items.some((item) => item.task.status === 'diagnosing')).toBe(true);
    expect(items[0]?.task.status).toBe('waiting_input');
  });

  it('returns suggested actions that are all pending decision tasks', () => {
    const items = getSuggestedActions();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.task != null)).toBe(true);
    expect(items.every((item) => item.task.status === 'pending_decision')).toBe(true);
  });

  it('returns recent completed tasks for the review digest area', () => {
    const items = getRecentCompletedTasks();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.task.status === 'completed')).toBe(true);
    expect(items.every((item) => item.href.length > 0)).toBe(true);
  });
});
