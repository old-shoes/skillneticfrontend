import type { SkillSubmissionListItem } from "@/lib/types/submit-skill";

export type ProfileUser = {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  emailVerified: boolean;
  githubConnected: boolean;
  points: number;
  level: string;
  locale: string;
  joinedAt: string;
};

export type ProfileStats = {
  favoriteCount: number;
  submissionCount: number;
  pendingReviewCount: number;
  helpPostCount: number;
};

export type PointRuleItem = {
  label: string;
  points: number;
};

export type PointSummary = {
  currentPoints: number;
  rules: {
    earn: PointRuleItem[];
    consume: PointRuleItem[];
  };
};

export type ProfileNotification = {
  id: string;
  type: string;
  title: string;
  content?: string | null;
  isRead: boolean;
  createdAt: string;
  relatedType?: string | null;
  relatedId?: string | null;
};

export type ProfileSecurity = {
  emailVerified: boolean;
  githubConnected: boolean;
  hasPassword: boolean;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
};

export type ProfileFavorite = {
  targetId: string;
  title: string;
  summary: string;
  slug?: string | null;
  categoryName?: string | null;
  favoritedAt: string;
};

export type ProfileUpdatePayload = {
  nickname?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  locale?: string;
};

export type PointLogItem = {
  id: string;
  eventType: string;
  pointsChange: number;
  pointsBefore: number;
  pointsAfter: number;
  description?: string | null;
  relatedType?: string | null;
  relatedId?: string | null;
  createdAt: string;
};

export type PointLogListResponse = {
  list: PointLogItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ProfileNotificationListResponse = {
  list: ProfileNotification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ProfileFavoriteListResponse = {
  list: ProfileFavorite[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ProfileOverview = {
  user: ProfileUser;
  stats: ProfileStats;
  pointSummary: PointSummary;
  recentNotifications: ProfileNotification[];
  recentSubmissions: SkillSubmissionListItem[];
};
