export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  skillCount: number;
};

export type SkillTag = {
  id: string;
  name: string;
  type: "model" | "scene" | "difficulty" | "type";
};

export type HomepageSkill = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverIcon?: string;
  categoryName: string;
  tags: SkillTag[];
  difficulty: "beginner" | "intermediate" | "advanced";
  modelLabels: string[];
  favoriteCount: number;
  viewCount: number;
  isFeatured: boolean;
  isHot: boolean;
  isFavorited?: boolean;
};

export type TutorialItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string;
  chapterCount: number;
  durationMinutes: number;
};

export type HomepageStats = {
  skillFavorites: number;
  qualityTemplates: number;
  monthlyVisits: number;
  beginnerTutorials: number;
};

export type HomepageData = {
  categories: CategoryItem[];
  featuredSkills: HomepageSkill[];
  latestSkills: HomepageSkill[];
  tutorials: TutorialItem[];
  stats: HomepageStats;
};
