export type CategoryDifficulty = "beginner" | "intermediate" | "advanced";

export type CategorySort = "default" | "tutorials" | "alphabetical";

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  tutorialCount: number;
  skillCount?: number;
  sortOrder: number;
  isEnabled: boolean;
  group?: string;
  scene?: string;
  difficulty?: CategoryDifficulty;
  isHot?: boolean;
};

export type CategoryOverviewStats = {
  totalCategories: number;
  totalTutorials: number;
  weeklyViews: number;
  weeklyFavorites: number;
};

export type CategorySidebarFilter = {
  label: string;
  value: string;
  count?: number;
};

export type HotTag = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export type CategoryOverviewData = {
  stats: CategoryOverviewStats;
  groups: CategorySidebarFilter[];
  scenes: CategorySidebarFilter[];
  hotTags: HotTag[];
};

export type CategoryListQuery = {
  q?: string;
  group?: string;
  scene?: string;
  sort?: CategorySort;
};

export type CategoryListResponse = {
  list: CategoryItem[];
};
