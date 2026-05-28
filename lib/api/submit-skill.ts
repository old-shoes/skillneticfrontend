import type {
  SkillSubmissionDraft,
  SkillSubmissionListResponse,
  SkillSubmissionMeta,
} from "@/lib/types/submit-skill";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SERVER_FETCH_TIMEOUT_MS = 1200;
const ENABLE_SUBMIT_SKILL_API_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_SUBMIT_SKILL_API_FALLBACK !== "false";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const LOCAL_SUBMIT_SKILL_DRAFT_KEY = "ai_skill_submit_draft";

type LegacyPromptFields = {
  promptVariables?: unknown[];
  outputFormats?: unknown[];
  creativity?: number;
  precision?: number;
  outputLanguage?: string;
  outputLength?: string;
};

function sanitizeDraftPayload(payload: Partial<SkillSubmissionDraft> & LegacyPromptFields): Partial<SkillSubmissionDraft> {
  const {
    promptVariables,
    outputFormats,
    creativity,
    precision,
    outputLanguage,
    outputLength,
    ...nextPayload
  } = payload;
  void promptVariables;
  void outputFormats;
  void creativity;
  void precision;
  void outputLanguage;
  void outputLength;
  return nextPayload;
}

const submitSkillMetaFallback: SkillSubmissionMeta = {
  categories: [],
  categoryTree: [],
  promptRoles: [
    "内容创作助手",
    "营销文案专家",
    "小红书运营",
    "品牌种草专家",
    "文案校对大师",
    "自定义角色",
  ],
  useCaseOptions: [
    { label: "内容创作", value: "content_creation" },
    { label: "社交媒体运营", value: "social_media" },
    { label: "营销推广", value: "marketing" },
    { label: "电商转化", value: "ecommerce" },
    { label: "办公提效", value: "productivity" },
    { label: "学习辅导", value: "learning" },
    { label: "数据分析", value: "data_analysis" },
    { label: "编程开发", value: "development" },
  ],
  modelOptions: [],
  skillTypeOptions: [
    { label: "提示词", value: "prompt" },
    { label: "工作流", value: "workflow" },
    { label: "教程", value: "tutorial" },
    { label: "工具配置", value: "tool_config" },
    { label: "Agent", value: "agent" },
  ],
  outputFormats: [
    { label: "标题", value: "title" },
    { label: "正文", value: "body" },
    { label: "标签", value: "tags" },
    { label: "互动引导", value: "interaction" },
    { label: "分段输出", value: "section" },
  ],
  difficulties: [
    { label: "新手", value: "beginner" },
    { label: "进阶", value: "intermediate" },
    { label: "专业", value: "advanced" },
  ],
  revisionFieldOptions: [
    { label: "标题", value: "title" },
    { label: "简介", value: "summary" },
    { label: "详细介绍", value: "description" },
    { label: "分类", value: "categoryId" },
    { label: "标签", value: "tags" },
    { label: "Skill 类型", value: "skillType" },
    { label: "推荐模型", value: "recommendedModels" },
    { label: "预计使用时长", value: "estimatedTime" },
    { label: "适用场景", value: "useCases" },
    { label: "Prompt 角色", value: "promptRole" },
    { label: "Prompt 模板", value: "systemPrompt" },
    { label: "封面", value: "coverImage" },
  ],
  rejectReasonOptions: [
    { label: "内容质量不足", value: "low_quality" },
    { label: "涉嫌抄袭", value: "copyright_risk" },
    { label: "违规内容", value: "policy_violation" },
    { label: "分类不符", value: "category_mismatch" },
    { label: "无实际价值", value: "no_value" },
    { label: "其他", value: "other" },
  ],
};

async function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  if (typeof window !== "undefined") {
    return fetch(input, init);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function shouldUseFallback(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return error.name === "AbortError" || message.includes("fetch failed") || message.includes("failed to fetch");
}

function canUseLocalDraftFallback(): boolean {
  return typeof window !== "undefined" && ENABLE_SUBMIT_SKILL_API_FALLBACK;
}

function createLocalDraftId(): string {
  return `local-${Date.now()}`;
}

function readLocalDraft(): SkillSubmissionDraft | null {
  if (!canUseLocalDraftFallback()) {
    return null;
  }
  const raw = window.localStorage.getItem(LOCAL_SUBMIT_SKILL_DRAFT_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SkillSubmissionDraft;
  } catch {
    return null;
  }
}

function writeLocalDraft(draft: SkillSubmissionDraft): SkillSubmissionDraft {
  window.localStorage.setItem(LOCAL_SUBMIT_SKILL_DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
    ...(typeof window === "undefined" ? { cache: "no-store" as const } : { cache: "no-store" as const }),
    ...init,
  });

  const json = (await res.json()) as Partial<ApiResponse<T>> & { detail?: string };
  if (!res.ok || json.code !== 0 || json.data === undefined) {
    throw new Error(json.message || json.detail || "Request failed");
  }
  return json.data;
}

export function getSubmitSkillMeta(): Promise<SkillSubmissionMeta> {
  return request<SkillSubmissionMeta>("/api/v1/skill-submissions/meta").catch((error) => {
    if (!ENABLE_SUBMIT_SKILL_API_FALLBACK || !shouldUseFallback(error)) {
      throw error;
    }
    return submitSkillMetaFallback;
  });
}

export function createSubmitSkillDraft(payload: Pick<SkillSubmissionDraft, "title" | "summary">): Promise<SkillSubmissionDraft> {
  return request<SkillSubmissionDraft>("/api/v1/skill-submissions/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch((error) => {
    if (!shouldUseFallback(error) || !canUseLocalDraftFallback()) {
      throw error;
    }
    const now = new Date().toISOString();
    return writeLocalDraft({
      id: createLocalDraftId(),
      title: payload.title,
      summary: payload.summary,
      description: "",
      categoryId: "",
      categoryIds: [],
      categoryName: "",
      tags: [],
      skillType: "prompt",
      recommendedModels: [],
      difficulty: "beginner",
      estimatedTime: "",
      coverImage: null,
      useCases: [],
      promptRole: "",
      promptFileName: null,
      systemPrompt: "",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  });
}

export function getSubmitSkillDraft(id: string): Promise<SkillSubmissionDraft> {
  return request<SkillSubmissionDraft>(`/api/v1/skill-submissions/${id}`).catch((error) => {
    if (!shouldUseFallback(error) || !canUseLocalDraftFallback()) {
      throw error;
    }
    const draft = readLocalDraft();
    if (!draft || draft.id !== id) {
      throw error;
    }
    return draft;
  });
}

export function updateSubmitSkillDraft(id: string, payload: Partial<SkillSubmissionDraft>): Promise<SkillSubmissionDraft> {
  const nextPayload = sanitizeDraftPayload(payload);
  return request<SkillSubmissionDraft>(`/api/v1/skill-submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(nextPayload),
  }).catch((error) => {
    if (!shouldUseFallback(error) || !canUseLocalDraftFallback()) {
      throw error;
    }
    const current = readLocalDraft();
    const now = new Date().toISOString();
    return writeLocalDraft({
      ...(current || { id, status: "draft" as const }),
      ...nextPayload,
      id,
      updatedAt: now,
      createdAt: current?.createdAt || now,
    } as SkillSubmissionDraft);
  });
}

export function submitSkillForReview(id: string): Promise<SkillSubmissionDraft> {
  return request<SkillSubmissionDraft>(`/api/v1/skill-submissions/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function deleteSubmitSkillSubmission(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/v1/skill-submissions/${id}`, {
    method: "DELETE",
  });
}

export function getMySkillSubmissions(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<SkillSubmissionListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) {
    searchParams.set("status", params.status);
  }
  if (params?.page) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  const query = searchParams.toString();
  return request<SkillSubmissionListResponse>(`/api/v1/my/skill-submissions${query ? `?${query}` : ""}`);
}
