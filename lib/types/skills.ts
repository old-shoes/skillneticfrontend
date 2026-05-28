export type SkillDifficulty = "beginner" | "intermediate" | "advanced";

export type SkillSort = "latest" | "popular" | "favorites" | "views";

export type SkillTagType = "model" | "scene" | "difficulty" | "type";

export type SkillCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  parentId?: string | null;
  level?: number;
};

export type SkillCategoryTree = SkillCategory & {
  children: SkillCategoryTree[];
};

export type SkillTag = {
  id: string;
  name: string;
  slug: string;
  type: SkillTagType;
};

export type SkillListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverIcon?: string | null;
  category: SkillCategory;
  tags: SkillTag[];
  difficulty: SkillDifficulty;
  type: string;
  recommendedModels: string[];
  favoriteCount: number;
  viewCount: number;
  publishedAt: string;
  isFeatured: boolean;
  isHot: boolean;
  isFavorited?: boolean;
};

export type SkillFilterOption = {
  label: string;
  value: string;
  count?: number;
};

export type SkillFilters = {
  categories: SkillFilterOption[];
  categoryTree: SkillCategoryTree[];
  scenes: SkillFilterOption[];
  models: SkillFilterOption[];
  types: SkillFilterOption[];
};

export type SkillListQuery = {
  q?: string;
  category?: string;
  scene?: string;
  model?: string;
  type?: string;
  sort?: SkillSort;
  page?: number;
  pageSize?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type SkillListResponse = {
  list: SkillListItem[];
  pagination: Pagination;
};

export type SkillFavoriteResponse = {
  success: boolean;
  favorited: boolean;
  favoriteCount: number;
};

export type SkillDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  coverIcon?: string | null;
  category: SkillCategory;
  tags: SkillTag[];
  difficulty: SkillDifficulty;
  type: string;
  useCase?: string | null;
  recommendedModels: string[];
  favoriteCount: number;
  viewCount: number;
  publishedAt: string;
  updatedAt: string;
  isFeatured: boolean;
  isHot: boolean;
  isFavorited?: boolean;
};
