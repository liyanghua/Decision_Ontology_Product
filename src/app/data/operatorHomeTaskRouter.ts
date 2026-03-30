/**
 * 轻量任务路由：关键词 → 路径（非 NLP、非聊天）
 */
export function routeOperatorHomeTaskQuery(raw: string): string {
  const q = raw.trim().toLowerCase();
  if (!q) return '/products';

  if (
    q.includes('最该优化') ||
    q.includes('优先优化') ||
    q.includes('优化商品') ||
    (q.includes('先看') && q.includes('商品'))
  ) {
    return '/products?sort=priority';
  }
  if (q.includes('高风险') || q.includes('风险商品')) {
    return '/products?risk=high';
  }
  if (q.includes('爆款') || q.includes('机会')) {
    return '/today?focus=opportunity';
  }
  if (q.includes('复盘') || q.includes('活动')) {
    return '/replay';
  }
  if (q.includes('审批') || q.includes('待审')) {
    return '/approvals';
  }
  if (q.includes('引流') || q.includes('内容') || q.includes('ctr')) {
    return '/today?focus=signals';
  }

  return `/products?q=${encodeURIComponent(raw.trim())}`;
}
