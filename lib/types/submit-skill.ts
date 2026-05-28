export type SubmitSkillStep = "basic" | "prompt";

export type SkillDifficulty = "beginner" | "intermediate" | "advanced";
export type SkillType = "prompt" | "workflow" | "tutorial" | "tool_config" | "agent";

export type SkillSubmitStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "needs_revision"
  | "withdrawn";

export type SkillOutputFormat = "title" | "body" | "tags" | "interaction" | "section";

export type SkillCategory = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  level?: number;
};

export type SkillCategoryTree = SkillCategory & {
  children: SkillCategoryTree[];
};

export type SkillUseCaseOption = {
  label: string;
  value: string;
};

export type SkillModelOption = {
  label: string;
  value: string;
};

export type SkillPromptVariable = {
  id?: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  description?: string;
  sortOrder: number;
};

export type SkillExampleInput = {
  key: string;
  label: string;
  value: string;
};

export type SkillExampleOutput = {
  title?: string;
  body?: string;
  tags?: string[];
  interactionGuide?: string;
  rawText?: string;
};

export type SkillFaq = {
  question: string;
  answer: string;
};

export type SkillSubmissionDraft = {
  id?: string;
  title: string;
  slug?: string;
  summary: string;
  description: string;
  categoryId: string;
  categoryIds: string[];
  categoryName?: string | null;
  tags: string[];
  skillType: SkillType;
  recommendedModels: string[];
  difficulty: SkillDifficulty;
  estimatedTime: string;
  coverImage?: string | null;
  useCases: string[];
  promptRole: string;
  promptFileName?: string | null;
  systemPrompt: string;
  status: SkillSubmitStatus;
  qualityScore?: number | null;
  reviewComment?: string | null;
  reviewReasonCode?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SkillSubmissionMeta = {
  categories: SkillCategory[];
  categoryTree: SkillCategoryTree[];
  promptRoles: string[];
  useCaseOptions: SkillUseCaseOption[];
  modelOptions: SkillModelOption[];
  skillTypeOptions: Array<{ label: string; value: SkillType }>;
  outputFormats: Array<{ label: string; value: SkillOutputFormat }>;
  difficulties: Array<{ label: string; value: SkillDifficulty }>;
  revisionFieldOptions: Array<{ label: string; value: string }>;
  rejectReasonOptions: Array<{ label: string; value: string }>;
};

export type SkillSubmissionListItem = {
  id: string;
  title: string;
  summary: string;
  coverImage?: string | null;
  tags: string[];
  status: SkillSubmitStatus;
  difficulty: SkillDifficulty;
  category?: SkillCategory | null;
  submittedAt?: string | null;
  updatedAt: string;
};

export type SkillSubmissionListResponse = {
  list: SkillSubmissionListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
