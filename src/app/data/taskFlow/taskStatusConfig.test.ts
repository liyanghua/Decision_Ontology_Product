import { describe, expect, it } from 'vitest';
import { TASK_STATUS_CONFIG } from './taskStatusConfig';

const EXPECTED_STATUSES = [
  'draft',
  'waiting_input',
  'diagnosing',
  'pending_decision',
  'approved',
  'executing',
  'blocked',
  'failed',
  'needs_takeover',
  'completed',
  'archived',
] as const;

describe('TASK_STATUS_CONFIG', () => {
  it('covers the full operator task lifecycle', () => {
    expect(Object.keys(TASK_STATUS_CONFIG).sort()).toEqual([...EXPECTED_STATUSES].sort());
  });

  it('defines business copy, visual tone and controls for every status', () => {
    for (const status of EXPECTED_STATUSES) {
      const config = TASK_STATUS_CONFIG[status];
      expect(config.labelZh.length).toBeGreaterThan(0);
      expect(config.badgeClass.length).toBeGreaterThan(0);
      expect(config.borderClass.length).toBeGreaterThan(0);
      expect(config.nextHintTemplate.length).toBeGreaterThan(0);
      expect(Array.isArray(config.availableActions)).toBe(true);
      expect(typeof config.allowTakeover).toBe('boolean');
      expect(typeof config.allowRetry).toBe('boolean');
    }
  });

  it('gives pre-stage tasks direct next-step controls', () => {
    expect(TASK_STATUS_CONFIG.waiting_input.availableActions).toContain('fill_inputs');
    expect(TASK_STATUS_CONFIG.diagnosing.availableActions).toContain('finish_diagnosis');
  });
});
