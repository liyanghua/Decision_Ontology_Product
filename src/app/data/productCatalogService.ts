import type { Product } from './mockData';
import type { RawItemMetricRow, ProductDiagnosisSummaryVM } from './adapters/adsFactTypes';
import {
  rawRowToProduct,
  buildProductDiagnosisSummaryVM,
} from './adapters/adsFactMapper';
import {
  defaultProductPriorityStrategy,
  type ProductPriorityStrategy,
} from './adapters/productPriorityScore';

export type { ProductPriorityStrategy } from './adapters/productPriorityScore';

function maxStatistDate(rows: RawItemMetricRow[]): string {
  let max = '';
  for (const r of rows) {
    const d = String(r.statist_date ?? '').trim();
    if (d && d > max) max = d;
  }
  return max;
}

function compareStatistDateDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

/**
 * Groups rows by goods_id; supports lookup by optional statist_date (defaults to latest per product).
 */
export function indexRowsByGoodsId(rows: RawItemMetricRow[]): Map<string, RawItemMetricRow[]> {
  const m = new Map<string, RawItemMetricRow[]>();
  for (const r of rows) {
    const gid = String(r.goods_id ?? '').trim();
    if (!gid) continue;
    let list = m.get(gid);
    if (!list) {
      list = [];
      m.set(gid, list);
    }
    list.push(r);
  }
  for (const list of m.values()) {
    list.sort((x, y) =>
      compareStatistDateDesc(
        String(x.statist_date ?? '').trim(),
        String(y.statist_date ?? '').trim(),
      ),
    );
  }
  return m;
}

export function pickRowForGoods(
  byGoods: Map<string, RawItemMetricRow[]>,
  goodsId: string,
  statistDate?: string,
): RawItemMetricRow | undefined {
  const list = byGoods.get(goodsId);
  if (!list?.length) return undefined;
  if (statistDate) {
    const exact = list.find((r) => String(r.statist_date ?? '').trim() === statistDate);
    if (exact) return exact;
  }
  return list[0];
}

export interface ProductCatalogService {
  /** Latest snapshot per goods_id. */
  listProducts(): Product[];
  getProductDiagnosis(goodsId: string, statistDate?: string): ProductDiagnosisSummaryVM | undefined;
  getTopPriorityProducts(limit?: number): Product[];
  getAvailableStatDates(goodsId: string): string[];
  getLatestGlobalStatistDate(): string;
  getRawRows(): RawItemMetricRow[];
  getIndexedRows(): Map<string, RawItemMetricRow[]>;
}

export function createAdsFactCatalogService(
  rows: RawItemMetricRow[],
  deps?: { priorityStrategy?: ProductPriorityStrategy },
): ProductCatalogService {
  const byGoods = indexRowsByGoodsId(rows);
  const latestGlobalDate = maxStatistDate(rows);
  const priorityStrategy = deps?.priorityStrategy ?? defaultProductPriorityStrategy;

  return {
    getRawRows: () => rows,
    getIndexedRows: () => byGoods,
    getLatestGlobalStatistDate: () => latestGlobalDate,

    listProducts(): Product[] {
      const products: Product[] = [];
      for (const [, list] of byGoods) {
        const row = list[0];
        if (row) products.push(rawRowToProduct(row, priorityStrategy));
      }
      products.sort((a, b) => b.priority - a.priority);
      return products;
    },

    getProductDiagnosis(goodsId: string, statistDate?: string): ProductDiagnosisSummaryVM | undefined {
      const row = pickRowForGoods(byGoods, goodsId, statistDate);
      if (!row) return undefined;
      return buildProductDiagnosisSummaryVM(row, priorityStrategy);
    },

    getTopPriorityProducts(limit = 10): Product[] {
      const list = this.listProducts();
      return list.slice(0, limit);
    },

    getAvailableStatDates(goodsId: string): string[] {
      const list = byGoods.get(goodsId);
      if (!list?.length) return [];
      return [...new Set(list.map((r) => String(r.statist_date ?? '').trim()).filter(Boolean))].sort(
        (a, b) => b.localeCompare(a),
      );
    },
  };
}
