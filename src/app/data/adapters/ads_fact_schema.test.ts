import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ADS_FACT_ITEM_SUMMARY_COLUMNS,
  validateCsvHeaders,
  resetAdsFactHeaderValidationForTests,
} from './adsFactSchema';

describe('adsFactSchema', () => {
  beforeEach(() => {
    resetAdsFactHeaderValidationForTests();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not warn when headers match schema', () => {
    validateCsvHeaders([...ADS_FACT_ITEM_SUMMARY_COLUMNS]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('warns once when columns are missing', () => {
    validateCsvHeaders(['statist_date', 'goods_id']);
    expect(console.warn).toHaveBeenCalled();
    validateCsvHeaders(['statist_date', 'goods_id']);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
