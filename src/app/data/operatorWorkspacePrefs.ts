import type { MemoryProfileVM } from './operatorHome/operatorHomeData';
import { listProducts } from './liveCatalog';

export const WORKSPACE_PREFS_STORAGE_KEY = 'operator-workbench-workspace-v1';

export type WorkspacePrefs = {
  onboardingCompleted: boolean;
  shopName: string;
  categories: string[];
  monthlyGoal: string;
  completedAtIso?: string;
};

const FALLBACK_CATEGORIES = [
  '家纺 · 床上四件套',
  '被芯被罩',
  '夏季凉感系列',
  '家居收纳',
];

export function getCategoryOptionsFromCatalog(): string[] {
  try {
    const cats = [...new Set(listProducts().map((p) => p.category).filter(Boolean))] as string[];
    cats.sort((a, b) => a.localeCompare(b, 'zh-Hans'));
    return cats.length > 0 ? cats : [...FALLBACK_CATEGORIES];
  } catch {
    return [...FALLBACK_CATEGORIES];
  }
}

export function loadWorkspacePrefs(): WorkspacePrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_PREFS_STORAGE_KEY);
    if (!raw?.trim()) return null;
    const data = JSON.parse(raw) as Partial<WorkspacePrefs>;
    if (typeof data !== 'object' || data == null) return null;
    if (typeof data.shopName !== 'string' || typeof data.monthlyGoal !== 'string') return null;
    return {
      onboardingCompleted: Boolean(data.onboardingCompleted),
      shopName: data.shopName,
      categories: Array.isArray(data.categories) ? data.categories.filter((c) => typeof c === 'string') : [],
      monthlyGoal: data.monthlyGoal,
      completedAtIso: typeof data.completedAtIso === 'string' ? data.completedAtIso : undefined,
    };
  } catch {
    return null;
  }
}

export function saveWorkspacePrefs(prefs: WorkspacePrefs): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKSPACE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* 私密模式等：静默失败 */
  }
}

export function mergeMemoryWithWorkspace(
  base: MemoryProfileVM,
  saved: WorkspacePrefs | null,
): MemoryProfileVM {
  if (!saved?.onboardingCompleted) return base;
  const categoryFocus =
    saved.categories.length > 0 ? saved.categories.join('、') : base.categoryFocus;
  return {
    ...base,
    shopName: saved.shopName.trim() || base.shopName,
    categoryFocus: categoryFocus.trim() || base.categoryFocus,
    monthlyGoal: saved.monthlyGoal.trim() || base.monthlyGoal,
  };
}
