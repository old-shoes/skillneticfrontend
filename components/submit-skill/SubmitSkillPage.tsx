"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HeroMultiSelect } from "@/components/HeroMultiSelect";
import { HeroButton } from "@/components/HeroButton";
import { HeroSelect } from "@/components/HeroSelect";
import { ProfileLoginRequired, ProfileWorkspaceShell } from "@/components/profile/profile-shared";
import { trackEvent } from "@/lib/api/track";
import {
  createSubmitSkillDraft,
  directSubmitSkill,
  getSubmitSkillDraft,
  parseUserGithubSkill,
  submitSkillForReview,
  submitUserGithubSkill,
  updateSubmitSkillDraft,
} from "@/lib/api/submit-skill";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import { type Locale, withLocale } from "@/lib/i18n";
import type {
  SkillSubmissionDraft,
  SkillSubmissionMeta,
  SubmitSkillStep,
  SubmitSkillMode,
  UserGithubSkillParseResult,
} from "@/lib/types/submit-skill";

type Props = {
  locale: Locale;
  meta: SkillSubmissionMeta;
  embedded?: boolean;
};

type PromptInputMode = "manual" | "markdown";

const steps: SubmitSkillStep[] = ["basic", "prompt"];
const PROMPT_MIN_LENGTH = 20;
const PROMPT_MAX_LENGTH = 50000;
const TAXONOMY_HINTS: Record<
  SkillSubmissionDraft["skillType"],
  {
    categories: string[];
    scenes: string[];
    tools: string[];
  }
> = {
  prompt: {
    categories: ["办公效率", "知识管理", "产品管理", "上下文工程", "软件工程", "编码工作流"],
    scenes: ["内容", "知识", "文档", "需求", "分析", "写作", "规划"],
    tools: ["Claude", "OpenAI", "Codex", "Claude Code", "Cursor", "Gemini"],
  },
  workflow: {
    categories: ["自动化", "流程", "办公效率", "企业协作", "编码工作流", "软件工程", "Agent平台"],
    scenes: ["流程编排", "协作编排", "自动执行", "测试验证", "gitops", "方案设计", "需求分析"],
    tools: ["Claude Code", "Codex", "Cursor", "OpenCode", "GitHub Copilot", "Gemini CLI"],
  },
  tool_config: {
    categories: ["Skill生态", "专家代理", "知识管理", "办公效率", "浏览器自动化", "产品管理", "软件工程"],
    scenes: ["工具调用", "浏览器", "知识问答", "文档协作", "消息协作", "支付管理"],
    tools: ["Claude Code", "Codex", "Cursor", "OpenClaw", "OpenCode", "Gemini CLI"],
  },
  agent: {
    categories: ["Agent平台", "Agent运行时", "多智能体", "自治研究", "自动化", "记忆系统", "企业协作", "RAG"],
    scenes: ["agent", "自动执行", "研究自动化", "记忆管理", "外部接入", "协作编排", "模型接入"],
    tools: ["OpenClaw", "Claude Code", "Codex", "Cursor", "OpenAI", "Gemini CLI", "OpenRouter"],
  },
  tutorial: {
    categories: ["Agent框架", "软件工程", "RAG", "编码工作流", "UI/UX", "上下文工程"],
    scenes: ["agent开发", "研究自动化", "接口设计", "代码生成", "测试验证", "文献检索"],
    tools: ["LangGraph", "LangSmith", "OpenAI", "Claude", "Codex", "Cursor", "Gemini CLI"],
  },
};

function normalizeTaxonomyText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").replace(/[-_/]/g, "");
}

function matchesTaxonomyHints(value: string, hints: string[]) {
  const normalized = normalizeTaxonomyText(value);
  return hints.some((hint) => normalized.includes(normalizeTaxonomyText(hint)));
}

function filterTaxonomyOptions<T extends { label: string; value: string }>(
  options: T[],
  hints: string[],
  selectedValues: string[],
) {
  if (!hints.length) {
    return options;
  }
  const selected = new Set(selectedValues);
  const filtered = options.filter((item) => {
    const haystack = `${item.label} ${item.value}`;
    return selected.has(item.value) || matchesTaxonomyHints(haystack, hints);
  });
  return filtered.length > 0 ? filtered : options;
}

function getLeafCategories(meta: SkillSubmissionMeta) {
  const treeLeaves = (meta.categoryTree || []).flatMap((parent) =>
    (parent.children || []).map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      parentId: child.parentId,
      level: child.level,
      displayName: `${parent.name} / ${child.name}`,
    })),
  );
  if (treeLeaves.length > 0) {
    return treeLeaves;
  }
  return meta.categories.map((item) => ({
    ...item,
    displayName: item.name,
  }));
}

function createEmptyDraft(meta: SkillSubmissionMeta): SkillSubmissionDraft {
  return {
    title: "",
    summary: "",
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
    promptRole: meta.promptRoles[0] || "",
    promptFileName: null,
    systemPrompt: "",
    attachmentUrls: [],
    status: "draft",
  };
}

const PROMPT_MD_MAX_BYTES = 200 * 1024;

function parseList(value: string): string[] {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isSameList(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function getStepFromQuery(value: string | null): SubmitSkillStep {
  return value && steps.includes(value as SubmitSkillStep) ? (value as SubmitSkillStep) : "basic";
}

function getUseCaseLabel(locale: Locale, value: string, options: SkillSubmissionMeta["useCaseOptions"]) {
  const match = options.find((item) => item.value === value);
  if (match) {
    return match.label;
  }
  if (locale === "en") {
    return value
      .split("_")
      .filter(Boolean)
      .map((item) => item[0].toUpperCase() + item.slice(1))
      .join(" ");
  }
  return value;
}

function normalizeUseCases(value: string[], options: SkillSubmissionMeta["useCaseOptions"]): string[] {
  const labelMap = new Map(options.map((item) => [item.label, item.value]));
  const seen = new Set<string>();
  return value.reduce<string[]>((result, item) => {
    const normalized = labelMap.get(item) || item;
    if (!normalized || seen.has(normalized)) {
      return result;
    }
    seen.add(normalized);
    result.push(normalized);
    return result;
  }, []);
}

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      page: {
        eyebrow: "Submit Skill",
        title: "Submit Your Skill",
        description: "Choose whether to submit a prompt or import from a GitHub repository. This MVP only keeps basic info and prompt setup.",
      },
      mode: {
        title: "Choose Submission Type",
        description: "Pick the source first, then continue with the matching workflow.",
        promptTitle: "Prompt",
        promptDescription: "Fill in the title, summary, and prompt content directly.",
        githubTitle: "Git Repo Import",
        githubDescription: "Parse a GitHub repository and auto-fill the basic Skill information.",
      },
      auth: {
        checking: "Checking login status...",
        needLoginTitle: "Log in to submit your Skill",
        needLoginDescription: "Review submission and later edits require a real account session.",
        login: "Log in",
        register: "Create account",
      },
      state: {
        loadingDraft: "Loading draft...",
        currentStatus: "Current status:",
        preview: "Live Preview",
        promptPreview: "Prompt Preview",
      },
      stepTitles: {
        basic: "Basic Info",
        prompt: "Prompt Setup",
      },
      status: {
        draft: "Draft",
        pending_review: "Pending Review",
        approved: "Approved",
        rejected: "Rejected",
        needs_revision: "Needs Revision",
        withdrawn: "Withdrawn",
      },
      actions: {
        prev: "Previous",
        save: "Save Draft",
        saving: "Saving...",
        next: "Next",
        submit: "Submit for Review",
        submitting: "Submitting...",
        submitted: "Submitted",
      },
      basic: {
        title: "Skill Title",
        titlePlaceholder: "Example: Xiaohongshu Viral Copywriting Skill",
        titleRule: "2-50 chars",
        summary: "One-line Summary",
        summaryPlaceholder: "Summarize the main problem this Skill solves",
        summaryRule: "Prompt: 10-80 chars, GitHub import not limited",
        category: "Domain Category",
        tags: "Additional Tags",
        tagsPlaceholder: "Separate with commas, for example: copywriting, marketing, social media",
        tagsRule: "Required, 1-8 tags",
        coverPreset: "Preset Cover",
        description: "Detailed Description",
        descriptionPlaceholder: "Explain the use case, expected output, and value of this Skill",
      descriptionRule: "Optional.",
        useCases: "Scenes",
        useCasesPlaceholder: "Select usage scenes",
        useCasesRule: "Select at least 1",
        skillType: "Resource Type",
        skillTypePlaceholder: "Select resource type",
        recommendedModels: "Applicable Tools",
        recommendedModelsPlaceholder: "Select applicable tools",
        githubPromptHint: "Prompt files stay in the GitHub repository. After submission, go to the repo to view or download them.",
      },
      prompt: {
        role: "Prompt Role",
        customRole: "Custom Role Name",
        customRolePlaceholder: "Enter your custom prompt role",
        source: "Prompt Input Method",
        sourceHint: "Choose one: type the prompt directly or upload a Markdown file",
        sourceManual: "Direct Input",
        sourceMarkdown: "Upload Markdown",
        uploadMd: "Upload Markdown",
        uploadMdHint: "Upload a .md file to fill the prompt template automatically",
        uploadMdButton: "Choose .md File",
        replaceMdButton: "Replace File",
        clearMdButton: "Clear File",
        currentFile: "Current file",
        uploadSuccess: "Markdown loaded into the prompt template.",
        uploadInvalidType: "Only .md Markdown files are supported.",
        uploadTooLarge: "Markdown file must be 200 KB or smaller.",
        uploadPromptTooLong: "Markdown content is too long. Keep the prompt within 50,000 characters.",
        uploadReadFailed: "Failed to read the Markdown file.",
        systemPrompt: "System Prompt Template",
        systemPromptPlaceholder: "Enter the system prompt",
      },
      preview: {
      defaultTitle: "Your Skill Title",
      coverPlaceholder: "Cover Preview",
      defaultSummary: "Your one-line summary will appear here.",
      promptPlaceholder: "Prompt preview will appear here.",
      useCases: "Scenes",
      skillType: "Resource Type",
      recommendedModels: "Applicable Tools",
      empty: "To be filled",
      tipsTitle: "Submission Tips",
        tips: [
          "Add 1-8 additional tags so reviewers can understand the prompt faster.",
          "Use a clear title and keep the prompt content complete before submitting.",
          "After submission, the item enters review and will become a formal Skill after approval.",
        ],
      },
      errors: {
        loadDraft: "Failed to load draft",
        saveDraft: "Failed to save draft",
      submitReview: "Failed to submit for review",
      uploadCover: "Failed to upload cover",
      invalidSession: "Your login session has expired. Please log in again.",
      draftIdMissing: "Draft ID is missing",
      basicInvalid: "Please complete the required fields in Basic Info.",
      promptInvalid: "Please complete Prompt Role and Prompt Template.",
    },
      feedback: {
        draftSaved: "Draft saved.",
        submitSuccess: "Submitted successfully and added to the review queue.",
      },
    };
  }

  return {
      page: {
        eyebrow: "提交 Skill",
        title: "提交你的 Skill",
      description: "先选择提交提示词，还是从 Git 仓库导入，再进入对应的提交流程。当前只保留基础信息和 Prompt 配置。",
      },
      mode: {
        title: "选择提交方式",
        description: "先确定来源，再填写对应内容。",
        promptTitle: "提示词",
        promptDescription: "直接填写标题、简介和 Prompt 内容，适合独立提交 Prompt Skill。",
        githubTitle: "Git 仓库导入",
        githubDescription: "解析 GitHub 仓库并自动带入基础信息，适合从开源仓库提交 Skill。",
      },
      auth: {
        checking: "正在检查登录状态...",
        needLoginTitle: "登录后才能提交 Skill",
        needLoginDescription: "提交审核和后续修改都需要真实登录账号。",
        login: "登录",
        register: "注册账号",
      },
      state: {
        loadingDraft: "正在加载草稿...",
        currentStatus: "当前状态：",
      preview: "实时预览",
      promptPreview: "Prompt 预览",
    },
    stepTitles: {
      basic: "基础信息",
      prompt: "Prompt 配置",
    },
    status: {
      draft: "草稿",
      pending_review: "待审核",
      approved: "已通过",
      rejected: "已拒绝",
      needs_revision: "需修改",
      withdrawn: "已撤回",
    },
    actions: {
      prev: "上一步",
      save: "保存草稿",
      saving: "保存中...",
      next: "下一步",
      submit: "提交审核",
      submitting: "提交中...",
      submitted: "已提交审核",
    },
    basic: {
      title: "Skill 标题",
      titlePlaceholder: "例如：小红书爆款文案生成 Skill",
      titleRule: "2-50 字",
      summary: "一句话简介",
      summaryPlaceholder: "概括这个 Skill 能解决什么问题",
      summaryRule: "提示词 10-80 字，GitHub 导入不作限制",
      category: "领域分类",
      tags: "补充标签",
      tagsPlaceholder: "用逗号分隔，如：小红书, 文案, 营销",
      tagsRule: "必填，1-8 个",
      coverPreset: "预设封面",
      description: "详细介绍",
      descriptionPlaceholder: "介绍这个 Skill 的适用方式、产出效果和价值",
      descriptionRule: "可选填写。",
      useCases: "使用场景",
      useCasesPlaceholder: "选择使用场景",
      useCasesRule: "至少选择 1 个",
      skillType: "资源类型",
      skillTypePlaceholder: "选择资源类型",
      recommendedModels: "适用工具",
      recommendedModelsPlaceholder: "选择适用工具",
      githubPromptHint: "Prompt 原文件保留在 GitHub 仓库中，提交后请直接去仓库查看或下载。",
    },
    prompt: {
      role: "Prompt 角色",
      customRole: "自定义角色名称",
      customRolePlaceholder: "输入你自己的 Prompt 角色名称",
      source: "Prompt 输入方式",
      sourceHint: "二选一：直接填写系统 Prompt，或上传 Markdown 文件",
      sourceManual: "直接填写",
      sourceMarkdown: "上传 Markdown",
      uploadMd: "上传 Markdown",
      uploadMdHint: "支持选择 .md 文件，自动填充到 Prompt 模板里",
      uploadMdButton: "选择 .md 文件",
      replaceMdButton: "重新选择文件",
      clearMdButton: "清空文件",
      currentFile: "当前文件",
      uploadSuccess: "Markdown 已导入到 Prompt 模板。",
      uploadInvalidType: "只支持上传 .md Markdown 文件。",
      uploadTooLarge: "Markdown 文件大小不能超过 200 KB。",
      uploadPromptTooLong: "Markdown 内容过长，请控制在 50,000 字符以内。",
      uploadReadFailed: "读取 Markdown 文件失败。",
      systemPrompt: "系统 Prompt 模板",
      systemPromptPlaceholder: "输入系统 Prompt",
    },
    preview: {
      defaultTitle: "你的 Skill 标题",
      coverPlaceholder: "封面预览",
      defaultSummary: "这里会展示一句话简介。",
      promptPlaceholder: "Prompt 预览将在这里显示",
      useCases: "使用场景",
      skillType: "资源类型",
      recommendedModels: "适用工具",
      empty: "待填写",
      tipsTitle: "提交提醒",
      tips: [
        "补充标签需要填写 1-8 个，方便审核和后续归档。",
        "提交前确认标题清晰、Prompt 内容完整可用。",
        "提交后会进入审核流程，审核通过后转为正式 Skill。",
      ],
    },
    errors: {
      loadDraft: "加载草稿失败",
      saveDraft: "保存草稿失败",
      submitReview: "提交审核失败",
      uploadCover: "上传封面失败",
      invalidSession: "登录状态已失效，请重新登录。",
      draftIdMissing: "草稿 ID 不存在",
      basicInvalid: "请先完善基础信息中的必填项。",
      promptInvalid: "请先完善 Prompt 角色和 Prompt 模板。",
    },
    feedback: {
      draftSaved: "草稿已保存",
      submitSuccess: "提交成功，已进入审核队列",
    },
  };
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </div>
        {hint ? <div className="text-xs text-slate-400">{hint}</div> : null}
      </div>
      {children}
    </label>
  );
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${props.className || ""}`}
    />
  );
}

function TextAreaField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${props.className || ""}`}
    />
  );
}

export function SubmitSkillPage({ locale, meta, embedded = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const text = getCopy(locale);
  const step = getStepFromQuery(searchParams.get("step"));
  const querySubmissionId = searchParams.get("id") || "";
  const [draft, setDraft] = useState<SkillSubmissionDraft>(() => createEmptyDraft(meta));
  const [draftId, setDraftId] = useState(querySubmissionId);
  const [mode, setMode] = useState<SubmitSkillMode>("manual");
  const [githubUrlInput, setGithubUrlInput] = useState("");
  const [githubParsed, setGithubParsed] = useState<UserGithubSkillParseResult | null>(null);
  const [parsingGithub, setParsingGithub] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const promptFileInputRef = useRef<HTMLInputElement | null>(null);
  const [promptInputMode, setPromptInputMode] = useState<PromptInputMode>("manual");
  const leafCategories = useMemo(() => getLeafCategories(meta), [meta]);
  const emptyDraft = useMemo(() => createEmptyDraft(meta), [meta]);

  useEffect(() => {
    setDraftId(querySubmissionId);
  }, [querySubmissionId]);

  useEffect(() => {
    router.prefetch(withLocale(locale, "/me/submit-success"));
  }, [locale, router]);

  useEffect(() => {
    let active = true;

    fetchRealMe()
      .then(() => {
        if (!active) {
          return;
        }
        setAuthed(true);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        clearAuthSession();
        setAuthed(false);
      })
      .finally(() => {
        if (active) {
          setAuthReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function trackSubmitEvent(
    eventName:
      | "submit_skill_page_view"
      | "submit_skill_step_view"
      | "submit_skill_next_step_click"
      | "submit_skill_prev_step_click"
      | "submit_skill_save_draft"
      | "submit_skill_upload_cover"
      | "submit_skill_add_tag"
      | "submit_skill_add_variable"
      | "submit_skill_remove_variable"
      | "submit_skill_submit_review"
      | "submit_skill_submit_success"
      | "submit_skill_submit_failed",
    extra?: Record<string, unknown>,
  ) {
    trackEvent({
      eventName,
      pageUrl: withLocale(locale, `/me/submit?step=${step}${draftId ? `&id=${draftId}` : ""}`),
      targetType: "skill_submission",
      targetId: draftId || draft.id || null,
      extra: {
        step,
        status: draft.status,
        ...extra,
      },
    });
  }

  useEffect(() => {
    let active = true;

    if (!authReady || !authed) {
      setLoadingDraft(false);
      return;
    }

    if (!draftId) {
      setLoadingDraft(false);
      return;
    }

    setLoadingDraft(true);
    setError(null);
    setSuccessMessage(null);
    getSubmitSkillDraft(draftId)
      .then((data) => {
        if (!active) {
          return;
        }
        const nextMode: SubmitSkillMode =
          data.submissionType === "github" || data.sourceType === "user_github" || data.sourceType === "github"
            ? "github"
            : "manual";
        setMode(nextMode);
        if (data.githubUrl) {
          setGithubUrlInput(data.githubUrl);
        }
        setGithubParsed(
          nextMode === "github" && data.githubUrl && data.repoFullName
            ? {
                repo_full_name: data.repoFullName,
                github_url: data.githubUrl,
                clone_url: data.githubUrl.endsWith(".git") ? data.githubUrl : `${data.githubUrl}.git`,
                default_branch: null,
                repo_description: data.description || null,
                stars_count: 0,
                forks_count: 0,
                watchers_count: 0,
                open_issues_count: 0,
                license: data.license || null,
                skill_md_found: Boolean(data.promptFileName),
                readme_found: false,
                parsed: {
                  title: data.title,
                  summary: data.summary,
                  description: data.description,
                  category: null,
                  skill_type: data.skillType,
                  difficulty: data.difficulty,
                  tags: data.tags || [],
                  use_cases: data.useCases || [],
                  models: data.recommendedModels || [],
                  prompt_role: data.promptRole || null,
                  system_prompt: data.systemPrompt || "",
                },
                warnings: [],
              }
            : null,
        );
        setDraft((previous) => ({
          ...previous,
          ...data,
          categoryId: data.categoryId || previous.categoryId,
          categoryIds: data.categoryIds?.length ? data.categoryIds : previous.categoryIds,
          categoryName: data.categoryName || previous.categoryName,
          skillType: data.skillType || previous.skillType,
          recommendedModels: data.recommendedModels || previous.recommendedModels,
          coverImage: data.coverImage || previous.coverImage,
          useCases: normalizeUseCases(data.useCases || [], meta.useCaseOptions),
        }));
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : text.errors.loadDraft);
      })
      .finally(() => {
        if (active) {
          setLoadingDraft(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authReady, authed, draftId, meta.useCaseOptions, text.errors.loadDraft]);

  useEffect(() => {
    trackSubmitEvent("submit_skill_page_view");
  }, []);

  useEffect(() => {
    trackSubmitEvent("submit_skill_step_view");
  }, [step]);

  useEffect(() => {
    if (!isSameList(parseList(tagsInput), draft.tags)) {
      setTagsInput(draft.tags.join(", "));
    }
  }, [draft.tags, tagsInput]);

  useEffect(() => {
    setPromptInputMode(draft.promptFileName ? "markdown" : "manual");
  }, [draft.promptFileName]);

  const currentCategory = useMemo(
    () => leafCategories.find((item) => item.id === draft.categoryId) || null,
    [draft.categoryId, leafCategories],
  );
  const activeSkillType = mode === "manual" ? null : draft.skillType;
  const taxonomyHints = activeSkillType ? TAXONOMY_HINTS[activeSkillType] : null;
  const categoryOptions = useMemo(() => {
    const options = leafCategories.map((item) => ({ label: item.displayName, value: item.id }));
    if (!taxonomyHints) {
      return options;
    }
    const selectedValues = draft.categoryIds;
    const selectedNameMap = new Map(leafCategories.map((item) => [item.id, `${item.displayName} ${item.name} ${item.slug}`]));
    return filterTaxonomyOptions(
      options,
      taxonomyHints.categories,
      selectedValues.filter(Boolean),
    ).sort((left, right) => {
      const leftSelected = selectedValues.includes(left.value);
      const rightSelected = selectedValues.includes(right.value);
      if (leftSelected !== rightSelected) {
        return leftSelected ? -1 : 1;
      }
      const leftRecommended = matchesTaxonomyHints(selectedNameMap.get(left.value) || left.label, taxonomyHints.categories);
      const rightRecommended = matchesTaxonomyHints(selectedNameMap.get(right.value) || right.label, taxonomyHints.categories);
      if (leftRecommended !== rightRecommended) {
        return leftRecommended ? -1 : 1;
      }
      return left.label.localeCompare(right.label, locale === "en" ? "en" : "zh");
    });
  }, [draft.categoryIds, leafCategories, locale, taxonomyHints]);
  const useCaseOptions = useMemo(() => {
    if (!taxonomyHints) {
      return meta.useCaseOptions;
    }
    return filterTaxonomyOptions(meta.useCaseOptions, taxonomyHints.scenes, draft.useCases);
  }, [draft.useCases, meta.useCaseOptions, taxonomyHints]);
  const recommendedModelOptions = useMemo(() => {
    if (!taxonomyHints) {
      return meta.modelOptions;
    }
    return filterTaxonomyOptions(meta.modelOptions, taxonomyHints.tools, draft.recommendedModels);
  }, [draft.recommendedModels, meta.modelOptions, taxonomyHints]);

  const statusPill = useMemo(() => text.status[draft.status], [draft.status, text.status]);
  const basicStepError = useMemo(() => validateStep("basic"), [draft, locale, text.errors.promptInvalid, promptInputMode]);
  const canOpenPromptStep = !basicStepError;

  useEffect(() => {
    if (currentCategory && draft.categoryName !== currentCategory.name) {
      setDraft((previous) => ({
        ...previous,
        categoryName: currentCategory.name,
      }));
    }
  }, [currentCategory, draft.categoryName]);

  useEffect(() => {
    if ((mode === "github" || mode === "manual") && step === "prompt") {
      updateQuery("basic");
    }
  }, [mode, step]);

  useEffect(() => {
    if (mode === "manual" && draft.skillType !== "prompt") {
      setDraft((previous) => ({
        ...previous,
        skillType: "prompt",
      }));
    }
  }, [draft.skillType, mode]);

  function updateQuery(nextStep: SubmitSkillStep, nextId?: string) {
    if (nextStep === "prompt") {
      const validationError = validateStep("basic");
      if (validationError) {
        setSuccessMessage(null);
        setError(validationError);
        return;
      }
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", nextStep);
    if (nextId || draftId) {
      params.set("id", nextId || draftId);
    } else {
      params.delete("id");
    }
    router.push(withLocale(locale, `/me/submit?${params.toString()}`), { scroll: true });
  }

  function replaceDraftIdInUrl(nextId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step);
    if (nextId) {
      params.set("id", nextId);
    } else {
      params.delete("id");
    }
    const query = params.toString();
    const nextUrl = withLocale(locale, `/me/submit${query ? `?${query}` : ""}`);
    window.history.replaceState(window.history.state, "", nextUrl);
  }

  function switchMode(nextMode: SubmitSkillMode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setDraft(emptyDraft);
    setGithubUrlInput("");
    setGithubParsed(null);
    setTagsInput("");
    setPromptInputMode("manual");
    setDraftId("");
    setError(null);
    setSuccessMessage(null);

    const params = new URLSearchParams(searchParams.toString());
    params.set("step", "basic");
    params.delete("id");
    router.push(withLocale(locale, `/me/submit?${params.toString()}`), { scroll: true });
  }

  async function ensureDraftId(nextDraft?: Partial<SkillSubmissionDraft>, options?: { syncUrl?: boolean }) {
    if (draftId) {
      return draftId;
    }
    const created = await createSubmitSkillDraft({
      title: nextDraft?.title || draft.title,
      summary: nextDraft?.summary || draft.summary || (nextDraft?.title || draft.title),
    });
    const newId = created.id || "";
    setDraftId(newId);
    setDraft((previous) => ({
      ...previous,
      ...created,
    }));
    if (newId && options?.syncUrl !== false) {
      replaceDraftIdInUrl(newId);
    }
    return newId;
  }

  async function saveDraft(partial?: Partial<SkillSubmissionDraft>, options?: { track?: boolean; syncUrl?: boolean }) {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const mergedBase = {
        ...draft,
        ...partial,
        useCases: normalizeUseCases((partial?.useCases || draft.useCases) as string[], meta.useCaseOptions),
      };
      const merged = mode === "manual"
        ? {
            ...mergedBase,
            summary: mergedBase.summary?.trim() || mergedBase.title,
            description: mergedBase.description?.trim() || mergedBase.systemPrompt?.trim() || mergedBase.title,
            promptRole: mergedBase.promptRole?.trim() || mergedBase.title,
          }
        : mergedBase;
      const id = await ensureDraftId(merged, { syncUrl: options?.syncUrl });
      const saved = await updateSubmitSkillDraft(id, merged);
      setDraft((previous) => ({
        ...previous,
        ...saved,
        useCases: normalizeUseCases(saved.useCases || [], meta.useCaseOptions),
      }));
      setSuccessMessage(text.feedback.draftSaved);
      if (options?.track) {
        trackSubmitEvent("submit_skill_save_draft", {
          savedId: saved.id || id,
        });
      }
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : text.errors.saveDraft);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  function goPrev() {
    const index = steps.indexOf(step);
    if (index > 0) {
      trackSubmitEvent("submit_skill_prev_step_click", {
        toStep: steps[index - 1],
      });
      updateQuery(steps[index - 1]);
    }
  }

  async function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setSuccessMessage(null);
      setError(validationError);
      return;
    }
    if (mode === "github" || mode === "manual") {
      await submitForReview();
      return;
    }
    if (step === "basic") {
      trackSubmitEvent("submit_skill_next_step_click", {
        toStep: "prompt",
      });
      updateQuery("prompt");
      return;
    }
    await submitForReview();
  }

  async function submitForReview() {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    let shouldResetSubmitting = true;
    try {
      if (mode === "github") {
        const result = await submitUserGithubSkill({
          github_url: githubUrlInput.trim(),
          title: draft.title,
          summary: draft.summary,
          description: draft.description,
          category: currentCategory?.slug,
          skill_type: draft.skillType,
          difficulty: draft.difficulty,
          tags: draft.tags,
          use_cases: draft.useCases,
          recommended_models: draft.recommendedModels,
          usage_guide: "",
          example_output: draft.systemPrompt || "",
          cover_url: draft.coverImage || undefined,
          attachment_urls: draft.attachmentUrls || [],
        });
        setSuccessMessage(locale === "en" ? "GitHub Skill submitted successfully." : "GitHub Skill 提交成功。");
        shouldResetSubmitting = false;
        router.push(withLocale(locale, `/me/submit-success?id=${result.submission_id}`), { scroll: true });
        return;
      }
      if (!draftId) {
        trackSubmitEvent("submit_skill_submit_review", {
          savedId: null,
        });
        const result = await directSubmitSkill({
          ...draft,
          summary: draft.summary?.trim() || draft.title,
          description: draft.description?.trim() || draft.systemPrompt?.trim() || draft.title,
          promptRole: draft.promptRole?.trim() || draft.title,
          submitNote: undefined,
        });
        setDraft((previous) => ({
          ...previous,
          ...result,
        }));
        trackSubmitEvent("submit_skill_submit_success", {
          savedId: result.id,
        });
        shouldResetSubmitting = false;
        router.push(withLocale(locale, `/me/submit-success?id=${result.id}`), { scroll: true });
        return;
      }
      const saved = await saveDraft(undefined, { syncUrl: false });
      const id = saved.id || draftId;
      if (!id) {
        throw new Error(text.errors.draftIdMissing);
      }
      trackSubmitEvent("submit_skill_submit_review", {
        savedId: id,
      });
      const result = await submitSkillForReview(id);
      setDraft((previous) => ({
        ...previous,
        ...result,
      }));
      trackSubmitEvent("submit_skill_submit_success", {
        savedId: id,
      });
      shouldResetSubmitting = false;
      router.push(withLocale(locale, `/me/submit-success?id=${id}`), { scroll: true });
    } catch (err) {
      trackSubmitEvent("submit_skill_submit_failed", {
        message: err instanceof Error ? err.message : text.errors.submitReview,
      });
      setError(err instanceof Error ? err.message : text.errors.submitReview);
    } finally {
      if (shouldResetSubmitting) {
        setSubmitting(false);
      }
    }
  }

  async function handleParseGithub() {
    setParsingGithub(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const parsed = await parseUserGithubSkill(githubUrlInput.trim());
      setGithubParsed(parsed);
      const matchedCategory = leafCategories.find((item) => item.slug === parsed.parsed.category) || leafCategories[0] || null;
      setDraft((previous) => ({
        ...previous,
        submissionType: "github",
        sourceType: "user_github",
        githubUrl: parsed.github_url,
        repoFullName: parsed.repo_full_name,
        sourceName: parsed.repo_full_name,
        license: parsed.license || null,
        title: parsed.parsed.title || previous.title,
        summary: parsed.parsed.summary || previous.summary,
        description: parsed.parsed.description || previous.description,
        categoryId: matchedCategory?.id || previous.categoryId,
        categoryIds: matchedCategory?.id ? [matchedCategory.id] : previous.categoryIds,
        categoryName: matchedCategory?.name || previous.categoryName,
        tags: parsed.parsed.tags?.length ? parsed.parsed.tags : previous.tags,
        useCases: parsed.parsed.use_cases?.length ? parsed.parsed.use_cases : previous.useCases,
        recommendedModels: parsed.parsed.models?.length ? parsed.parsed.models : previous.recommendedModels,
        skillType: (parsed.parsed.skill_type as SkillSubmissionDraft["skillType"]) || previous.skillType,
        difficulty: parsed.parsed.difficulty || previous.difficulty,
        promptRole: parsed.parsed.prompt_role || previous.promptRole,
        systemPrompt: parsed.parsed.system_prompt || previous.systemPrompt,
        promptFileName: parsed.skill_md_found ? "SKILL.md" : null,
      }));
      setTagsInput(parsed.parsed.tags.join(", "));
      setSuccessMessage(locale === "en" ? "GitHub repository parsed successfully." : "GitHub 仓库解析成功。");
    } catch (err) {
      setError(err instanceof Error ? err.message : text.errors.loadDraft);
    } finally {
      setParsingGithub(false);
    }
  }

  function setField<K extends keyof SkillSubmissionDraft>(key: K, value: SkillSubmissionDraft[K]) {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function handlePromptMdFile(file: File) {
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".md") && file.type !== "text/markdown" && file.type !== "text/plain") {
      setSuccessMessage(null);
      setError(text.prompt.uploadInvalidType);
      return;
    }
    if (file.size > PROMPT_MD_MAX_BYTES) {
      setSuccessMessage(null);
      setError(text.prompt.uploadTooLarge);
      return;
    }
    try {
      const content = await file.text();
      if (content.trim().length > PROMPT_MAX_LENGTH) {
        setSuccessMessage(null);
        setError(text.prompt.uploadPromptTooLong);
        return;
      }
      setDraft((previous) => ({
        ...previous,
        promptFileName: file.name,
        systemPrompt: content,
      }));
      setError(null);
      setSuccessMessage(text.prompt.uploadSuccess);
    } catch {
      setSuccessMessage(null);
      setError(text.prompt.uploadReadFailed);
    } finally {
      if (promptFileInputRef.current) {
        promptFileInputRef.current.value = "";
      }
    }
  }

  function validateStep(targetStep: SubmitSkillStep): string | null {
    if (targetStep === "basic") {
      const titleLength = draft.title.trim().length;
      const summaryLength = draft.summary.trim().length;
      const promptLength = draft.systemPrompt.trim().length;
      if (titleLength < 2 || titleLength > 50) return locale === "en" ? "Skill Title must be 2-50 characters." : "Skill 标题需填写 2-50 字。";
      if (mode === "github" && summaryLength < 1) {
        return locale === "en" ? "One-line Summary is required." : "一句话简介不能为空。";
      }
      if (draft.tags.length < 1 || draft.tags.length > 8) {
        return locale === "en" ? "Additional Tags must contain 1-8 items." : "补充标签需填写 1-8 个。";
      }
      if (!draft.skillType) return locale === "en" ? "Please select a Resource Type." : "请选择资源类型。";
      if (mode === "github" && !draft.categoryIds.length && !draft.categoryId) {
        return locale === "en" ? "Please select a Domain Category." : "请选择领域分类。";
      }
      if (mode === "github" && draft.useCases.length < 1) {
        return locale === "en" ? "Please select at least 1 Scene." : "请至少选择 1 个使用场景。";
      }
      if (mode === "github" && draft.recommendedModels.length < 1) {
        return locale === "en" ? "Please select at least 1 Applicable Tool." : "请至少选择 1 个适用工具。";
      }
      const hasMarkdown = Boolean(draft.promptFileName?.trim());
      const markdownValid = hasMarkdown && promptLength >= PROMPT_MIN_LENGTH && promptLength <= PROMPT_MAX_LENGTH;
      const manualValid = promptLength >= PROMPT_MIN_LENGTH && promptLength <= PROMPT_MAX_LENGTH;
      if (mode === "manual" && (promptInputMode === "markdown" ? !markdownValid : !manualValid)) {
        return text.errors.promptInvalid;
      }
    }

    if (targetStep === "prompt") {
      const promptLength = draft.systemPrompt.trim().length;
      const hasMarkdown = Boolean(draft.promptFileName?.trim());
      const markdownValid = hasMarkdown && promptLength >= PROMPT_MIN_LENGTH && promptLength <= PROMPT_MAX_LENGTH;
      const manualValid = promptLength >= PROMPT_MIN_LENGTH && promptLength <= PROMPT_MAX_LENGTH;
      if (promptInputMode === "markdown" ? !markdownValid : !manualValid) {
        return text.errors.promptInvalid;
      }
    }

    return null;
  }

  function renderBasicStep() {
    return (
      <div className="space-y-5">
        {mode === "github" ? (
          <Field label={locale === "en" ? "GitHub Repository URL" : "GitHub 仓库地址"} required>
            <div className="flex flex-col gap-3 md:flex-row">
              <InputField
                value={githubUrlInput}
                onChange={(event) => setGithubUrlInput(event.target.value)}
                placeholder="https://github.com/owner/repo.git"
              />
              <HeroButton
                className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
                onPress={() => {
                  void handleParseGithub();
                }}
                onClick={() => {
                  void handleParseGithub();
                }}
                isDisabled={parsingGithub || !githubUrlInput.trim()}
              >
                {parsingGithub ? (locale === "en" ? "Parsing..." : "解析中...") : locale === "en" ? "Parse Repository" : "解析仓库"}
              </HeroButton>
            </div>
            {githubParsed ? (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <div>{githubParsed.repo_full_name}</div>
                <a
                  href={githubParsed.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all text-brand-600 hover:text-brand-700"
                >
                  {githubParsed.github_url}
                </a>
                <div>{githubParsed.license || "-"}</div>
              </div>
            ) : null}
          </Field>
        ) : null}
        {mode === "github" ? (
          <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm text-brand-700">
            {text.basic.githubPromptHint}
          </div>
        ) : null}
        <Field label={text.basic.title} hint={text.basic.titleRule} required>
          <InputField
            value={draft.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder={text.basic.titlePlaceholder}
          />
        </Field>
        {mode === "manual" ? (
          <Field label={text.basic.skillType} required>
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
              {meta.skillTypeOptions.find((item) => item.value === "prompt")?.label || "Prompt"}
            </div>
          </Field>
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={text.basic.skillType} required>
                <HeroSelect
                  ariaLabel={text.basic.skillType}
                  value={draft.skillType}
                  onChange={(value) => setField("skillType", value as SkillSubmissionDraft["skillType"])}
                  options={meta.skillTypeOptions}
                  placeholder={text.basic.skillTypePlaceholder}
                  className="w-full"
                  triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
                  popoverClassName="min-w-[220px]"
                />
              </Field>
              <Field label={text.basic.category} required>
                <HeroMultiSelect
                  ariaLabel={text.basic.category}
                  values={draft.categoryIds}
                  onChange={(values) => {
                    const primaryId = values[0] || "";
                    const category = leafCategories.find((item) => item.id === primaryId);
                    setDraft((previous) => ({
                      ...previous,
                      categoryIds: values,
                      categoryId: primaryId,
                      categoryName: category?.name || "",
                    }));
                  }}
                  options={categoryOptions}
                  placeholder={locale === "en" ? "Select domains, first one is primary" : "选择领域分类，首个为主分类"}
                  className="w-full"
                  triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
                  popoverClassName="min-w-[260px]"
                />
              </Field>
              <Field label={text.basic.useCases} hint={text.basic.useCasesRule} required>
                <HeroMultiSelect
                  ariaLabel={text.basic.useCases}
                  values={draft.useCases}
                  onChange={(values) => setField("useCases", normalizeUseCases(values, meta.useCaseOptions))}
                  options={useCaseOptions}
                  placeholder={text.basic.useCasesPlaceholder}
                  className="w-full"
                  triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
                  popoverClassName="min-w-[260px]"
                />
              </Field>
              <Field label={text.basic.recommendedModels} required>
                <HeroMultiSelect
                  ariaLabel={text.basic.recommendedModels}
                  values={draft.recommendedModels}
                  onChange={(values) => setField("recommendedModels", values)}
                  options={recommendedModelOptions}
                  placeholder={text.basic.recommendedModelsPlaceholder}
                  className="w-full"
                  triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
                  popoverClassName="min-w-[260px]"
                />
              </Field>
            </div>
          </div>
        )}
        <Field label={text.basic.tags} hint={text.basic.tagsRule}>
          <InputField
            value={tagsInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              const nextTags = parseList(nextValue);
              setTagsInput(nextValue);
              if (nextTags.length > draft.tags.length) {
                const addedTag = nextTags.find((item) => !draft.tags.includes(item));
                trackSubmitEvent("submit_skill_add_tag", {
                  tag: addedTag || "",
                });
              }
              setField("tags", nextTags);
            }}
            placeholder={text.basic.tagsPlaceholder}
          />
        </Field>
        {mode === "manual" ? renderPromptStep() : null}
        {mode === "github" ? (
          <Field label={text.basic.description} hint={text.basic.descriptionRule}>
            <TextAreaField
              value={draft.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder={text.basic.descriptionPlaceholder}
              rows={5}
            />
          </Field>
        ) : null}
      </div>
    );
  }

  function renderPromptStep() {
    return (
      <div className="space-y-5">
        <Field label={text.prompt.source} hint={text.prompt.sourceHint} required>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setPromptInputMode("manual");
                setField("promptFileName", null);
                if (promptFileInputRef.current) {
                  promptFileInputRef.current.value = "";
                }
              }}
              className={`rounded-[20px] border px-4 py-4 text-left transition ${
                promptInputMode === "manual"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <div className="text-sm font-semibold">{text.prompt.sourceManual}</div>
              <div className="mt-1 text-xs text-slate-500">{text.prompt.systemPrompt}</div>
            </button>
            <button
              type="button"
              onClick={() => setPromptInputMode("markdown")}
              className={`rounded-[20px] border px-4 py-4 text-left transition ${
                promptInputMode === "markdown"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <div className="text-sm font-semibold">{text.prompt.sourceMarkdown}</div>
              <div className="mt-1 text-xs text-slate-500">{text.prompt.uploadMdHint}</div>
            </button>
          </div>
        </Field>
        <input
          ref={promptFileInputRef}
          type="file"
          accept=".md,text/markdown,text/plain"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            void handlePromptMdFile(file);
          }}
        />
        {promptInputMode === "markdown" ? (
          <Field label={text.prompt.uploadMd} hint={text.prompt.uploadMdHint} required>
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    {draft.promptFileName || text.prompt.currentFile}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {draft.promptFileName || text.prompt.uploadMdHint}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => promptFileInputRef.current?.click()}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    {draft.promptFileName ? text.prompt.replaceMdButton : text.prompt.uploadMdButton}
                  </button>
                  {draft.promptFileName ? (
                    <button
                      type="button"
                      onClick={() => {
                        setField("promptFileName", null);
                        setField("systemPrompt", "");
                        if (promptFileInputRef.current) {
                          promptFileInputRef.current.value = "";
                        }
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      {text.prompt.clearMdButton}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </Field>
        ) : null}
        {promptInputMode === "manual" ? (
          <Field label={text.prompt.systemPrompt} required>
            <TextAreaField
              value={draft.systemPrompt}
              onChange={(event) => setField("systemPrompt", event.target.value)}
              placeholder={text.prompt.systemPromptPlaceholder}
              rows={10}
            />
          </Field>
        ) : null}
      </div>
    );
  }

  if (!authReady) {
    return <div className="px-4 py-12 text-sm text-slate-500">{text.auth.checking}</div>;
  }

  if (!authed) {
    return (
      <ProfileLoginRequired
        locale={locale}
        title={text.auth.needLoginTitle}
        description={text.auth.needLoginDescription}
        embedded={embedded}
      />
    );
  }

  const content = (
    <>
        <div className="mb-5 rounded-[20px] border border-white/80 bg-white/92 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="text-sm font-semibold text-slate-900">{text.mode.title}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{text.mode.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => switchMode("manual")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                mode === "manual"
                  ? "border-brand-500 bg-brand-500 text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/40"
              }`}
            >
              {text.mode.promptTitle}
            </button>
            <button
              type="button"
              onClick={() => switchMode("github")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                mode === "github"
                  ? "border-brand-500 bg-brand-500 text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/40"
              }`}
            >
              {text.mode.githubTitle}
            </button>
          </div>
          <div className="mt-2 text-xs leading-5 text-slate-500">
            {mode === "manual" ? text.mode.promptDescription : text.mode.githubDescription}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <section className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            {loadingDraft ? <div className="py-20 text-center text-slate-500">{text.state.loadingDraft}</div> : null}
            {!loadingDraft && step === "basic" ? renderBasicStep() : null}
            {!loadingDraft && step === "prompt" && mode !== "github" ? renderPromptStep() : null}
            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}
            {successMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <div className="text-sm text-slate-500">
                {text.state.currentStatus}
                {statusPill}
              </div>
              <div className="flex flex-wrap gap-3">
                <HeroButton
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  onClick={goPrev}
                  isDisabled={step === "basic" || saving || submitting}
                >
                  {text.actions.prev}
                </HeroButton>
                {step === "basic" ? (
                  <HeroButton
                    className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
                    onClick={() => {
                      void goNext();
                    }}
                    isDisabled={saving || submitting}
                  >
                    {mode === "github" || mode === "manual"
                      ? (submitting
                        ? text.actions.submitting
                        : draft.status === "pending_review"
                          ? text.actions.submitted
                          : text.actions.submit)
                      : text.actions.next}
                  </HeroButton>
                ) : (
                  <HeroButton
                    className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
                    onClick={() => {
                      void goNext();
                    }}
                    isDisabled={saving || submitting || draft.status === "pending_review"}
                  >
                    {submitting
                      ? text.actions.submitting
                      : draft.status === "pending_review"
                        ? text.actions.submitted
                        : text.actions.submit}
                  </HeroButton>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[32px] border border-white/80 bg-white/92 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">{text.state.preview}</div>
                  <div className="text-lg font-semibold text-slate-900">{draft.title || text.preview.defaultTitle}</div>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  {statusPill}
                </span>
              </div>
              <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50">
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-2">
                    {currentCategory ? (
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {currentCategory.name}
                      </span>
                    ) : null}
                    {draft.tags.slice(0, 3).map((item, index) => (
                      <span key={`${item}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm leading-7 text-slate-600">
                    {mode === "manual"
                      ? (draft.systemPrompt
                        ? `${draft.systemPrompt.trim().slice(0, 120)}${draft.systemPrompt.trim().length > 120 ? "..." : ""}`
                        : text.preview.promptPlaceholder)
                      : (draft.summary || text.preview.defaultSummary)}
                  </p>
                  <div className="grid gap-3 rounded-[24px] border border-slate-100 bg-white p-4 text-sm text-slate-600">
                    {mode === "github" && githubParsed ? (
                      <div>
                        GitHub:
                        {" "}
                        <a
                          href={githubParsed.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-brand-600 hover:text-brand-700"
                        >
                          {githubParsed.github_url}
                        </a>
                      </div>
                    ) : null}
                    <div>
                      {text.preview.skillType}:
                      {" "}
                      {meta.skillTypeOptions.find((item) => item.value === draft.skillType)?.label || text.preview.empty}
                    </div>
                    {mode === "github" ? (
                      <>
                        <div>
                          {text.preview.useCases}:
                          {" "}
                          {draft.useCases.length > 0
                            ? draft.useCases.map((item) => getUseCaseLabel(locale, item, meta.useCaseOptions)).join(" / ")
                            : text.preview.empty}
                        </div>
                        <div>
                          {text.preview.recommendedModels}:
                          {" "}
                          {draft.recommendedModels.length > 0
                            ? draft.recommendedModels.join(" / ")
                            : text.preview.empty}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="rounded-[24px] border border-slate-100 bg-slate-900 p-4 text-sm text-slate-200">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {text.state.promptPreview}
                    </div>
                    <div className="line-clamp-8 whitespace-pre-wrap font-mono text-[13px] leading-6">
                      {draft.systemPrompt || text.preview.promptPlaceholder}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[32px] border border-amber-200 bg-amber-50/80 p-5 text-sm leading-7 text-amber-900 shadow-[0_16px_38px_rgba(217,119,6,0.08)]">
              <div className="font-semibold">{text.preview.tipsTitle}</div>
              {text.preview.tips.map((item, index) => (
                <div key={`${index}-${item}`}>{item}</div>
              ))}
            </div>
          </aside>
        </div>
        {submitting ? (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/28 backdrop-blur-[2px]">
            <div className="flex min-w-[220px] items-center gap-3 rounded-[24px] bg-white px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
              <div className="text-sm font-medium text-slate-700">
                {text.actions.submitting}
              </div>
            </div>
          </div>
        ) : null}
    </>
  );

  if (embedded) {
    return (
      <ProfileWorkspaceShell title={text.page.title} description={text.page.description}>
        {content}
      </ProfileWorkspaceShell>
    );
  }

  return (
    <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="text-sm font-medium text-brand-600">{text.page.eyebrow}</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{text.page.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{text.page.description}</p>
        </div>
        {content}
      </div>
    </div>
  );
}
