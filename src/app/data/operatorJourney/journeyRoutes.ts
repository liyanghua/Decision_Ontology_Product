export type JourneyRouteParams = {
  actionId?: string;
  productId?: string;
};

function withSearch(basePath: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value?.trim()) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildJourneyLinks({ actionId, productId }: JourneyRouteParams) {
  const diagnosisPath = productId ? `/products/${encodeURIComponent(productId)}` : '/products';
  return {
    diagnosis: withSearch(diagnosisPath, {
      focus: 'actions',
      actionId,
    }),
    approvals: withSearch('/approvals', {
      actionId,
    }),
    execution: withSearch('/execution', {
      actionId,
    }),
    replay: withSearch('/replay', {
      actionId,
      goodsId: productId,
    }),
    replayReview: `${withSearch('/replay', {
      actionId,
      goodsId: productId,
    })}#journey-review-cta`,
  };
}
