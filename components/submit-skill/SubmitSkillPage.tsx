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
  getSubmitSkillDraft,
  submitSkillForReview,
  updateSubmitSkillDraft,
} from "@/lib/api/submit-skill";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import { type Locale, withLocale } from "@/lib/i18n";
import type {
  SkillSubmissionDraft,
  SkillSubmissionMeta,
  SubmitSkillStep,
} from "@/lib/types/submit-skill";

type Props = {
  locale: Locale;
  meta: SkillSubmissionMeta;
  embedded?: boolean;
};

type PromptInputMode = "manual" | "markdown";

const steps: SubmitSkillStep[] = ["basic", "prompt"];
const coverOptions = [
  "/icons/tutorials/cover-chatgpt-prompt.svg",
  "/icons/tutorials/cover-midjourney-guide.svg",
  "/icons/tutorials/cover-workflow-guide.svg",
  "/icons/tutorials/cover-excel-ai.svg",
  "/icons/tutorials/cover-xiaohongshu-writing.svg",
  "/icons/tutorials/cover-python-ai.svg",
];
const PROMPT_MIN_LENGTH = 20;
const PROMPT_MAX_LENGTH = 50000;
const CUSTOM_PROMPT_ROLE_VALUE = "自定义角色";

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
  const leafCategories = getLeafCategories(meta);
  return {
    title: "",
    summary: "",
    description: "",
    categoryId: leafCategories[0]?.id || "",
    categoryIds: leafCategories[0]?.id ? [leafCategories[0].id] : [],
    categoryName: leafCategories[0]?.name || "",
    tags: [],
    skillType: "prompt",
    recommendedModels: [],
    difficulty: "beginner",
    estimatedTime: "",
    coverImage: coverOptions[0],
    useCases: [],
    promptRole: meta.promptRoles[0] || "",
    promptFileName: null,
    systemPrompt: "",
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

function getPromptRoleLabel(locale: Locale, value: string) {
  const labels: Record<string, { zh: string; en: string }> = {
    内容创作助手: { zh: "内容创作助手", en: "Content Writer" },
    营销文案专家: { zh: "营销文案专家", en: "Marketing Copywriter" },
    小红书运营: { zh: "小红书运营", en: "Xiaohongshu Operator" },
    品牌种草专家: { zh: "品牌种草专家", en: "Brand Growth Specialist" },
    文案校对大师: { zh: "文案校对大师", en: "Copy Editor" },
    自定义角色: { zh: "自定义角色", en: "Custom Role" },
  };
  return labels[value]?.[locale] || value;
}

function isCustomPromptRoleValue(value: string, promptRoles: string[]) {
  return Boolean(value.trim()) && !promptRoles.includes(value);
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
        description: "Share your AI workflow and prompt. This MVP only keeps basic info and prompt setup.",
      },
      auth: {
        checking: "Checking login status...",
        needLoginTitle: "Log in to submit your Skill",
        needLoginDescription: "Draft saving, review submission, and later edits require a real account session.",
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
        summaryRule: "10-80 chars",
        category: "Category",
        tags: "Tags",
        tagsPlaceholder: "Separate with commas, for example: copywriting, marketing, social media",
        tagsRule: "1-8 tags",
        coverPreset: "Preset Cover",
        description: "Detailed Description",
        descriptionPlaceholder: "Explain the use case, expected output, and value of this Skill",
        descriptionRule: "20-500 chars",
        useCases: "Use Cases",
        useCasesPlaceholder: "Select applicable scenarios",
        useCasesRule: "Select at least 1",
        skillType: "Skill Type",
        skillTypePlaceholder: "Select skill type",
        recommendedModels: "Recommended Models",
        recommendedModelsPlaceholder: "Select recommended models",
      },
      prompt: {
        role: "Prompt Role",
        customRole: "Custom Role Name",
        customRolePlaceholder: "Enter your custom prompt role",
        source: "Prompt Input Method",
        sourceHint: "Choose one: type the prompt manually or upload a Markdown file",
        sourceManual: "Manual Input",
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
      useCases: "Use Cases",
      skillType: "Skill Type",
      recommendedModels: "Recommended Models",
      empty: "To be filled",
      tipsTitle: "Submission Tips",
        tips: [
          "Keep the title, summary, and prompt aligned.",
          "This flow currently uses preset covers only.",
          "After submission, the item enters the admin review workflow and will become a formal Skill after approval.",
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
      description: "分享你的 AI 创意与经验，帮助更多人提升效率。当前只保留基础信息和 Prompt 配置。",
      },
      auth: {
        checking: "正在检查登录状态...",
        needLoginTitle: "登录后才能提交 Skill",
        needLoginDescription: "保存草稿、提交审核和后续修改都需要真实登录账号。",
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
      summaryRule: "10-80 字",
      category: "分类",
      tags: "标签",
      tagsPlaceholder: "用逗号分隔，如：小红书, 文案, 营销",
      tagsRule: "1-8 个标签",
      coverPreset: "预设封面",
      description: "详细介绍",
      descriptionPlaceholder: "介绍这个 Skill 的适用方式、产出效果和价值",
      descriptionRule: "20-500 字",
      useCases: "适用场景",
      useCasesPlaceholder: "选择适用场景",
      useCasesRule: "至少选择 1 个",
      skillType: "Skill 类型",
      skillTypePlaceholder: "选择 Skill 类型",
      recommendedModels: "推荐模型",
      recommendedModelsPlaceholder: "选择推荐模型",
    },
    prompt: {
      role: "Prompt 角色",
      customRole: "自定义角色名称",
      customRolePlaceholder: "输入你自己的 Prompt 角色名称",
      source: "Prompt 输入方式",
      sourceHint: "二选一：手动填写系统 Prompt，或上传 Markdown 文件",
      sourceManual: "手动填写",
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
      useCases: "适用场景",
      skillType: "Skill 类型",
      recommendedModels: "推荐模型",
      empty: "待填写",
      tipsTitle: "提交提醒",
      tips: [
        "尽量让标题、简介与 Prompt 保持一致。",
        "现在已经支持真实封面上传，保留预设封面作为兜底选项。",
        "提交后会进入后台审核页，审核通过后转为正式 Skill。",
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
  const submissionId = searchParams.get("id") || "";
  const [draft, setDraft] = useState<SkillSubmissionDraft>(() => createEmptyDraft(meta));
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
      pageUrl: withLocale(locale, `/me/submit?step=${step}${submissionId ? `&id=${submissionId}` : ""}`),
      targetType: "skill_submission",
      targetId: submissionId || draft.id || null,
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

    if (!submissionId) {
      setLoadingDraft(false);
      return;
    }

    setLoadingDraft(true);
    setError(null);
    setSuccessMessage(null);
    getSubmitSkillDraft(submissionId)
      .then((data) => {
        if (!active) {
          return;
        }
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
  }, [authReady, authed, meta.useCaseOptions, submissionId, text.errors.loadDraft]);

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
    () => leafCategories.find((item) => item.id === draft.categoryId) || leafCategories[0] || null,
    [draft.categoryId, leafCategories],
  );
  const usingCustomPromptRole = useMemo(
    () => isCustomPromptRoleValue(draft.promptRole, meta.promptRoles),
    [draft.promptRole, meta.promptRoles],
  );

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
    if (nextId || submissionId) {
      params.set("id", nextId || submissionId);
    }
    router.push(withLocale(locale, `/me/submit?${params.toString()}`), { scroll: true });
  }

  async function ensureDraftId(nextDraft?: Partial<SkillSubmissionDraft>) {
    if (submissionId) {
      return submissionId;
    }
    const created = await createSubmitSkillDraft({
      title: nextDraft?.title || draft.title,
      summary: nextDraft?.summary || draft.summary,
    });
    const newId = created.id || "";
    setDraft((previous) => ({
      ...previous,
      ...created,
    }));
    updateQuery(step, newId);
    return newId;
  }

  async function saveDraft(partial?: Partial<SkillSubmissionDraft>, options?: { track?: boolean }) {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const merged = {
        ...draft,
        ...partial,
        useCases: normalizeUseCases((partial?.useCases || draft.useCases) as string[], meta.useCaseOptions),
      };
      const id = await ensureDraftId(merged);
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
    await saveDraft();
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
    try {
      const saved = await saveDraft();
      const id = saved.id || submissionId;
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
      router.push(withLocale(locale, `/me/submit-success?id=${id}`), { scroll: true });
    } catch (err) {
      trackSubmitEvent("submit_skill_submit_failed", {
        message: err instanceof Error ? err.message : text.errors.submitReview,
      });
      setError(err instanceof Error ? err.message : text.errors.submitReview);
    } finally {
      setSubmitting(false);
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
      const descriptionLength = draft.description.trim().length;
      if (titleLength < 2 || titleLength > 50) return locale === "en" ? "Skill Title must be 2-50 characters." : "Skill 标题需填写 2-50 字。";
      if (summaryLength < 10 || summaryLength > 80) return locale === "en" ? "One-line Summary must be 10-80 characters." : "一句话简介需填写 10-80 字。";
      if (!draft.categoryIds.length && !draft.categoryId) return locale === "en" ? "Please select a Category." : "请选择分类。";
      if (draft.tags.length < 1 || draft.tags.length > 8) return locale === "en" ? "Tags must contain 1-8 items." : "标签需填写 1-8 个。";
      if (!draft.skillType) return locale === "en" ? "Please select a Skill Type." : "请选择 Skill 类型。";
      if (descriptionLength > 0 && (descriptionLength < 20 || descriptionLength > 500)) {
        return locale === "en" ? "Detailed Description must be 20-500 characters." : "详细介绍填写后需为 20-500 字。";
      }
      if (draft.useCases.length < 1) return locale === "en" ? "Please select at least 1 Use Case." : "请至少选择 1 个适用场景。";
    }

    if (targetStep === "prompt") {
      const promptLength = draft.systemPrompt.trim().length;
      const hasMarkdown = Boolean(draft.promptFileName?.trim());
      const markdownValid = hasMarkdown && promptLength >= PROMPT_MIN_LENGTH && promptLength <= PROMPT_MAX_LENGTH;
      const manualValid = promptLength >= PROMPT_MIN_LENGTH && promptLength <= PROMPT_MAX_LENGTH;
      if (
        !draft.promptRole.trim() ||
        (promptInputMode === "markdown" ? !markdownValid : !manualValid)
      ) {
        return text.errors.promptInvalid;
      }
    }

    return null;
  }

  function renderBasicStep() {
    return (
      <div className="space-y-5">
        <Field label={text.basic.title} hint={text.basic.titleRule} required>
          <InputField
            value={draft.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder={text.basic.titlePlaceholder}
          />
        </Field>
        <Field label={text.basic.summary} hint={text.basic.summaryRule} required>
          <TextAreaField
            value={draft.summary}
            onChange={(event) => setField("summary", event.target.value)}
            placeholder={text.basic.summaryPlaceholder}
            rows={2}
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
            options={leafCategories.map((item) => ({ label: item.displayName, value: item.id }))}
            placeholder={locale === "en" ? "Select categories, first one is primary" : "选择分类，首个为主分类"}
            className="w-full"
            triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
            popoverClassName="min-w-[260px]"
          />
        </Field>
        <Field label={text.basic.tags} hint={text.basic.tagsRule} required>
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
        <Field label={text.basic.recommendedModels}>
          <HeroMultiSelect
            ariaLabel={text.basic.recommendedModels}
            values={draft.recommendedModels}
            onChange={(values) => setField("recommendedModels", values)}
            options={meta.modelOptions}
            placeholder={text.basic.recommendedModelsPlaceholder}
            className="w-full"
            triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
            popoverClassName="min-w-[260px]"
          />
        </Field>
        <Field label={text.basic.coverPreset}>
          <HeroSelect
            ariaLabel={text.basic.coverPreset}
            value={draft.coverImage || ""}
            onChange={(value) => setField("coverImage", value)}
            options={coverOptions.map((item) => ({
              label: item.split("/").pop() || item,
              value: item,
            }))}
            className="w-full"
            triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
            popoverClassName="min-w-[220px]"
          />
        </Field>
        <Field label={text.basic.description} hint={text.basic.descriptionRule}>
          <TextAreaField
            value={draft.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder={text.basic.descriptionPlaceholder}
            rows={5}
          />
        </Field>
        <Field label={text.basic.useCases} hint={text.basic.useCasesRule} required>
          <HeroMultiSelect
            ariaLabel={text.basic.useCases}
            values={draft.useCases}
            onChange={(values) => setField("useCases", normalizeUseCases(values, meta.useCaseOptions))}
            options={meta.useCaseOptions}
            placeholder={text.basic.useCasesPlaceholder}
            className="w-full"
            triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
            popoverClassName="min-w-[260px]"
          />
        </Field>
      </div>
    );
  }

  function renderPromptStep() {
    return (
      <div className="space-y-5">
        <Field label={text.prompt.role} required>
          <HeroSelect
            ariaLabel={text.prompt.role}
            value={usingCustomPromptRole ? CUSTOM_PROMPT_ROLE_VALUE : draft.promptRole}
            onChange={(value) => {
              if (value === CUSTOM_PROMPT_ROLE_VALUE) {
                setField("promptRole", usingCustomPromptRole ? draft.promptRole : "");
                return;
              }
              setField("promptRole", value);
            }}
            options={meta.promptRoles.map((item) => ({
              label: getPromptRoleLabel(locale, item),
              value: item,
            }))}
            className="w-full"
            triggerClassName="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition data-[focus-visible=true]:border-brand-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-brand-100"
            popoverClassName="min-w-[240px]"
          />
        </Field>
        {usingCustomPromptRole || draft.promptRole === "" ? (
          <Field label={text.prompt.customRole} required>
            <InputField
              value={draft.promptRole}
              onChange={(event) => setField("promptRole", event.target.value)}
              placeholder={text.prompt.customRolePlaceholder}
            />
          </Field>
        ) : null}
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
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          {steps.map((item, index) => {
            const active = item === step;
            const done = steps.indexOf(item) < steps.indexOf(step);
            const disabled = item === "prompt" && !canOpenPromptStep;
            return (
              <button
                key={item}
                type="button"
                onClick={() => updateQuery(item)}
                disabled={disabled}
                className={`rounded-[24px] border px-5 py-4 text-left transition ${
                  active
                    ? "border-brand-500 bg-brand-500 text-white shadow-[0_16px_34px_rgba(37,99,235,0.22)]"
                    : done
                      ? "border-brand-200 bg-brand-50 text-brand-700"
                      : disabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em]">Step {index + 1}</div>
                <div className="mt-2 text-base font-semibold">{text.stepTitles[item]}</div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <section className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            {loadingDraft ? <div className="py-20 text-center text-slate-500">{text.state.loadingDraft}</div> : null}
            {!loadingDraft && step === "basic" ? renderBasicStep() : null}
            {!loadingDraft && step === "prompt" ? renderPromptStep() : null}
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
                  onPress={goPrev}
                  onClick={goPrev}
                  isDisabled={step === "basic" || saving || submitting}
                >
                  {text.actions.prev}
                </HeroButton>
                <HeroButton
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  onPress={() => {
                    void saveDraft(undefined, { track: true });
                  }}
                  onClick={() => {
                    void saveDraft(undefined, { track: true });
                  }}
                  isDisabled={saving || submitting}
                >
                  {saving ? text.actions.saving : text.actions.save}
                </HeroButton>
                {step === "basic" ? (
                  <HeroButton
                    className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
                    onPress={() => {
                      void goNext();
                    }}
                    onClick={() => {
                      void goNext();
                    }}
                    isDisabled={saving || submitting}
                  >
                    {text.actions.next}
                  </HeroButton>
                ) : (
                  <HeroButton
                    className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
                    onPress={() => {
                      void goNext();
                    }}
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
                {draft.coverImage ? (
                  <img src={draft.coverImage} alt={draft.title || "cover"} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-100 text-sm text-slate-400">
                    {text.preview.coverPlaceholder}
                  </div>
                )}
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
                  <p className="text-sm leading-7 text-slate-600">{draft.summary || text.preview.defaultSummary}</p>
                  <div className="grid gap-3 rounded-[24px] border border-slate-100 bg-white p-4 text-sm text-slate-600">
                    <div>
                      {text.preview.skillType}:
                      {" "}
                      {meta.skillTypeOptions.find((item) => item.value === draft.skillType)?.label || text.preview.empty}
                    </div>
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
                        ? draft.recommendedModels
                            .map((item) => meta.modelOptions.find((option) => option.value === item)?.label || item)
                            .join(" / ")
                        : text.preview.empty}
                    </div>
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
