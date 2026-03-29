/**
 * Column names aligned with ads_fact_item_summary_d (see data/*.sql).
 * Note: upstream DDL uses serach_buyer_num (typo preserved).
 */
export const ADS_FACT_ITEM_SUMMARY_COLUMNS = [
  'statist_date',
  'goods_id',
  'main_click',
  'goods_describe',
  'pay_sales',
  'promotion_sales',
  'promotion_percent',
  'visitors',
  'search_visitors',
  'serach_buyer_num',
  'search_pay_percent',
  'business_buys',
  'business_qty',
  'business_amount',
  'refund_amount',
  'real_buyers',
  'real_qty',
  'real_amount',
  'actual_conversion',
  'real_perprice',
  'real_uv_value',
  'add_persion_num',
  'add_num',
  'add_percent',
  'goods_like_num',
  'goods_like_num_percent',
  'order_buyer_num',
  'order_pay_num',
  'pay_percent',
  'real_amountls_refund',
  'order_refund',
  'refund_percent',
  'order_pay',
  'per_price',
  'uv_value',
  'avg_stay_time',
  'goods_details_bounce',
  'goods_view_num',
  'order_buy',
  'order_num',
  'order_money',
  'order_percent',
  'pay_new_buyer',
  'pay_old_buyer',
  'old_buyer_pay_money',
  'bargin_pay_money',
  'pay_real_percent',
  'ref_order_percent',
  'business_order_refund',
  'qty_price',
  'search_click_rate',
  'data_load_time',
  'search_visitors_7d_rate',
  'diagnosis_content',
  'diagnosis_grade',
  'diagnosis_content_json',
] as const;

export type AdsFactColumn = (typeof ADS_FACT_ITEM_SUMMARY_COLUMNS)[number];

const expectedSet = new Set<string>(ADS_FACT_ITEM_SUMMARY_COLUMNS);

let headerValidated = false;

/**
 * Warn once on missing / unexpected CSV columns compared to schema.
 */
export function validateCsvHeaders(headers: string[]): void {
  if (headerValidated) return;
  headerValidated = true;

  const headerSet = new Set(headers.map((h) => h.trim()));
  const missing = ADS_FACT_ITEM_SUMMARY_COLUMNS.filter((c) => !headerSet.has(c));
  const unexpected = headers.map((h) => h.trim()).filter((h) => h && !expectedSet.has(h));

  if (missing.length > 0) {
    console.warn(
      '[ads_fact] CSV missing columns vs SQL schema:',
      missing.join(', '),
    );
  }
  if (unexpected.length > 0) {
    console.warn('[ads_fact] CSV has unexpected columns:', unexpected.join(', '));
  }
}

export function resetAdsFactHeaderValidationForTests(): void {
  headerValidated = false;
}
