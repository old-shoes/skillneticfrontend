import type { Locale } from "@/lib/i18n";
import type { TutorialCategory, TutorialDifficulty, TutorialTag } from "@/lib/types/tutorials";

export type TutorialAuthor = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  title?: string | null;
};

export type TutorialPromptBlock = {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  sortOrder: number;
};

export type TutorialRelatedItem = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: string | null;
  readTimeMinutes: number;
  viewCount: number;
};

export type TutorialPrevNextItem = {
  title: string;
  slug: string;
};

export type TutorialDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  coverImage?: string | null;
  coverIcon?: string | null;
  category: TutorialCategory;
  tags: TutorialTag[];
  author: TutorialAuthor;
  difficulty: TutorialDifficulty;
  readTimeMinutes: number;
  viewCount: number;
  favoriteCount: number;
  likeCount: number;
  isBeginner: boolean;
  publishedAt: string;
  updatedAt: string;
  learningPoints: string[];
  suitableFor: string[];
  promptBlocks: TutorialPromptBlock[];
  relatedTutorials: TutorialRelatedItem[];
  prevNext: {
    prev?: TutorialPrevNextItem | null;
    next?: TutorialPrevNextItem | null;
  };
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type TutorialDetailProps = {
  locale: Locale;
  tutorial: TutorialDetail;
};
