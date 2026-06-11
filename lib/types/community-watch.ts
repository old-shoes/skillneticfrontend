export type CommunityWatchMeta = {
  generatedAt: string;
  source: string;
  scriptVersion: number;
  trendingFeedUrl: string;
  githubTrendingUrl: string;
  usesGithubToken: boolean;
  translationEnabled?: boolean;
  translationModel?: string;
  translationProvider?: string;
};

export type CommunityWatchFilters = {
  since: string;
  language: string;
  topic: string;
};

export type CommunityWatchSummary = {
  trackedRepositories: number;
  trackedIssues: number;
  trackedTopics: number;
  totalStars: number;
  totalForks: number;
  totalStarsLabel: string;
  totalForksLabel: string;
  topLanguage: string;
  topLanguageCount: number;
  filters: CommunityWatchFilters;
};

export type CommunityWatchRepository = {
  title: string;
  fullName: string;
  owner: string;
  repo: string;
  url: string;
  description: string;
  descriptionZh?: string;
  language: string;
  publishedAt: string;
  source: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  starsLabel: string;
  forksLabel: string;
  watchersLabel: string;
  topics: string[];
  homepageUrl?: string;
  updatedAt?: string;
  pushedAt?: string;
};

export type CommunityWatchIssue = {
  title: string;
  url: string;
  repository: string;
  commentCount: number;
  commentCountLabel: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  state: string;
  labels: string[];
};

export type CommunityWatchTopic = {
  name: string;
  repoCount: number;
  repoCountLabel: string;
  sampleRepo: string;
  sampleRepoUrl: string;
  sampleRepoDescription: string;
  sampleRepoDescriptionZh?: string;
};

export type CommunityWatchSnapshot = {
  meta: CommunityWatchMeta;
  summary: CommunityWatchSummary;
  repositories: CommunityWatchRepository[];
  issues: CommunityWatchIssue[];
  topics: CommunityWatchTopic[];
};
