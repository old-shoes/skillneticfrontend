export type TutorialDifficulty = "beginner" | "intermediate" | "advanced";
export type TutorialSort = "latest" | "popular" | "favorites";

export type TutorialTag = {
  id: string;
  name: string;
  slug: string;
};

export type TutorialCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  tutorialCount: number;
};

export type TutorialListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string | null;
  coverIcon?: string | null;
  category: TutorialCategory;
  tags: TutorialTag[];
  difficulty: TutorialDifficulty;
  readTimeMinutes: number;
  viewCount: number;
  favoriteCount: number;
  publishedAt: string;
  updatedAt: string;
  isFeatured: boolean;
  isBeginner: boolean;
};

export type TutorialPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TutorialListResponse = {
  list: TutorialListItem[];
  pagination: TutorialPagination;
};

export type TutorialFilterOption = {
  label: string;
  value: string;
  icon?: string;
  count: number;
};

export type TutorialFilters = {
  categories: TutorialFilterOption[];
  hotKeywords: string[];
  hotTags: TutorialFilterOption[];
};

export type LearningPath = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  tutorialCount: number;
};

export type WeeklyHotTutorial = {
  id: string;
  title: string;
  slug: string;
  rank: number;
  viewCount: number;
};

export type TutorialListQuery = {
  q?: string;
  category?: string;
  tag?: string;
  sort?: TutorialSort;
  page?: number;
  pageSize?: number;
};
