import type {
  SkillFilterOption,
  SkillFilters,
  SkillListItem,
  SkillListQuery,
  SkillListResponse,
  SkillSort,
  SkillTag,
} from "@/lib/types/skills";

const categories = [
  { id: "cat_writing", name: "写作", slug: "writing", icon: "prompt", color: "blue" },
  { id: "cat_coding", name: "编程", slug: "coding", icon: "browse", color: "green" },
  { id: "cat_office", name: "办公", slug: "office", icon: "tool", color: "orange" },
  { id: "cat_design", name: "设计", slug: "design", icon: "browse", color: "purple" },
  { id: "cat_marketing", name: "营销", slug: "marketing", icon: "prompt", color: "rose" },
  { id: "cat_learning", name: "学习", slug: "learning", icon: "tutorial", color: "indigo" },
  { id: "cat_video", name: "视频", slug: "video", icon: "browse", color: "cyan" },
  { id: "cat_automation", name: "自动化", slug: "automation", icon: "agent", color: "emerald" },
] as const;

function tag(id: string, name: string, slug: string, type: SkillTag["type"]): SkillTag {
  return { id, name, slug, type };
}

const skillList: SkillListItem[] = [
  {
    id: "skill_1",
    title: "小红书爆款标题生成",
    slug: "xiaohongshu-title-generator",
    summary: "输入产品、人群和卖点，快速生成 20 个小红书风格标题。",
    coverIcon: "prompt",
    category: categories[0],
    tags: [tag("t2", "小红书", "xiaohongshu", "scene"), tag("t3", "新手", "beginner", "difficulty"), tag("t4", "提示词", "prompt", "type")],
    difficulty: "beginner",
    type: "prompt",
    recommendedModels: ["GPT-4o", "ChatGPT"],
    favoriteCount: 8600,
    viewCount: 23000,
    publishedAt: "2026-05-16T23:15:29+08:00",
    isFeatured: true,
    isHot: true,
  },
  {
    id: "skill_2",
    title: "代码解释器（Python）",
    slug: "python-code-explainer",
    summary: "粘贴代码，自动解释逻辑、找出问题并给出优化建议。",
    coverIcon: "browse",
    category: categories[1],
    tags: [tag("t6", "新手", "beginner", "difficulty"), tag("t7", "工具配置", "tool_config", "type")],
    difficulty: "beginner",
    type: "tool_config",
    recommendedModels: ["DeepSeek", "ChatGPT"],
    favoriteCount: 6200,
    viewCount: 18000,
    publishedAt: "2026-05-15T23:15:29+08:00",
    isFeatured: true,
    isHot: true,
  },
  {
    id: "skill_3",
    title: "Excel 数据分析助手",
    slug: "excel-data-analysis-assistant",
    summary: "上传表格后贴数据，自动分析趋势、生成图表并给出业务洞察。",
    coverIcon: "workflow",
    category: categories[2],
    tags: [tag("t9", "Excel", "excel", "scene"), tag("t10", "进阶", "intermediate", "difficulty"), tag("t11", "工作流", "workflow", "type")],
    difficulty: "intermediate",
    type: "workflow",
    recommendedModels: ["GPT-4o", "ChatGPT"],
    favoriteCount: 5100,
    viewCount: 16000,
    publishedAt: "2026-05-14T23:15:29+08:00",
    isFeatured: true,
    isHot: false,
  },
  {
    id: "skill_4",
    title: "文章润色助手",
    slug: "article-polisher",
    summary: "提升文章语言质量，让表达更流畅、专业，适合各类写作场景。",
    coverIcon: "prompt",
    category: categories[0],
    tags: [tag("t13", "新手", "beginner", "difficulty"), tag("t14", "提示词", "prompt", "type")],
    difficulty: "beginner",
    type: "prompt",
    recommendedModels: ["Claude"],
    favoriteCount: 4300,
    viewCount: 12000,
    publishedAt: "2026-05-13T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_5",
    title: "Midjourney 提示词生成",
    slug: "midjourney-prompt-generator",
    summary: "根据描述生成高质量 Midjourney 画面提示词，轻松获得更稳定的出图。",
    coverIcon: "browse",
    category: categories[3],
    tags: [tag("t16", "新手", "beginner", "difficulty"), tag("t17", "提示词", "prompt", "type")],
    difficulty: "beginner",
    type: "prompt",
    recommendedModels: ["Midjourney"],
    favoriteCount: 3800,
    viewCount: 11000,
    publishedAt: "2026-05-12T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_6",
    title: "简历优化大师",
    slug: "resume-optimizer-master",
    summary: "上传简历后，优化内容结构，突出亮点，提升求职竞争力。",
    coverIcon: "user",
    category: categories[2],
    tags: [tag("t19", "简历", "resume", "scene"), tag("t20", "进阶", "intermediate", "difficulty"), tag("t21", "提示词", "prompt", "type")],
    difficulty: "intermediate",
    type: "prompt",
    recommendedModels: ["GPT-4o", "Claude"],
    favoriteCount: 7200,
    viewCount: 20000,
    publishedAt: "2026-05-11T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_7",
    title: "PPT 大纲生成器",
    slug: "ppt-outline-generator",
    summary: "输入主题，自动生成结构清晰的 PPT 大纲和内容要点，节省构思时间。",
    coverIcon: "tutorial",
    category: categories[2],
    tags: [tag("t23", "PPT", "ppt", "scene"), tag("t24", "新手", "beginner", "difficulty"), tag("t25", "工作流", "workflow", "type")],
    difficulty: "beginner",
    type: "workflow",
    recommendedModels: ["ChatGPT", "通义千问"],
    favoriteCount: 3200,
    viewCount: 9000,
    publishedAt: "2026-05-10T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_8",
    title: "短视频脚本创作",
    slug: "short-video-script-creator",
    summary: "生成短视频脚本、分镜和文案，适合抖音、小红书等创作场景。",
    coverIcon: "prompt",
    category: categories[6],
    tags: [tag("t27", "短视频", "short-video", "scene"), tag("t28", "进阶", "intermediate", "difficulty"), tag("t29", "提示词", "prompt", "type")],
    difficulty: "intermediate",
    type: "prompt",
    recommendedModels: ["GPT-4o", "Kimi"],
    favoriteCount: 4700,
    viewCount: 13000,
    publishedAt: "2026-05-09T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_9",
    title: "自动化 Workflow 设计",
    slug: "automation-workflow-design",
    summary: "根据需求设计自动化工作流，提升效率，减少重复劳动。",
    coverIcon: "workflow",
    category: categories[7],
    tags: [tag("t31", "专业", "advanced", "difficulty"), tag("t32", "工作流", "workflow", "type")],
    difficulty: "advanced",
    type: "workflow",
    recommendedModels: ["ChatGPT", "DeepSeek"],
    favoriteCount: 2600,
    viewCount: 6000,
    publishedAt: "2026-05-08T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_10",
    title: "会议纪要整理助手",
    slug: "meeting-notes-assistant",
    summary: "自动整理会议纪要、待办和结论，适合团队协作和项目推进。",
    coverIcon: "workflow",
    category: categories[2],
    tags: [tag("t34", "会议", "meeting", "scene"), tag("t35", "新手", "beginner", "difficulty"), tag("t36", "工作流", "workflow", "type")],
    difficulty: "beginner",
    type: "workflow",
    recommendedModels: ["Kimi", "GPT-4o"],
    favoriteCount: 5800,
    viewCount: 17000,
    publishedAt: "2026-05-07T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_11",
    title: "产品需求文档生成",
    slug: "prd-generator",
    summary: "一键生成结构完整、清晰的 PRD 文档，减少反复修改成本。",
    coverIcon: "workflow",
    category: categories[2],
    tags: [tag("t38", "进阶", "intermediate", "difficulty"), tag("t39", "工作流", "workflow", "type")],
    difficulty: "intermediate",
    type: "workflow",
    recommendedModels: ["DeepSeek", "ChatGPT"],
    favoriteCount: 2900,
    viewCount: 8600,
    publishedAt: "2026-05-06T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_12",
    title: "邮件润色助手",
    slug: "email-polisher",
    summary: "让邮件表达更专业、简洁且礼貌，适合商务沟通和对外联系。",
    coverIcon: "prompt",
    category: categories[2],
    tags: [tag("t41", "新手", "beginner", "difficulty"), tag("t42", "提示词", "prompt", "type")],
    difficulty: "beginner",
    type: "prompt",
    recommendedModels: ["Claude"],
    favoriteCount: 2500,
    viewCount: 7900,
    publishedAt: "2026-05-05T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_13",
    title: "论文大纲生成器",
    slug: "paper-outline-generator",
    summary: "根据研究主题快速生成论文大纲、章节建议和写作切入点。",
    coverIcon: "tutorial",
    category: categories[5],
    tags: [tag("t44", "论文", "paper", "scene"), tag("t45", "新手", "beginner", "difficulty"), tag("t46", "教程", "tutorial", "type")],
    difficulty: "beginner",
    type: "tutorial",
    recommendedModels: ["Gemini", "ChatGPT"],
    favoriteCount: 2100,
    viewCount: 6500,
    publishedAt: "2026-05-04T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_14",
    title: "社媒文案日历生成",
    slug: "social-content-calendar-generator",
    summary: "生成一周社媒选题、文案与发布时间建议，适合内容团队排期。",
    coverIcon: "prompt",
    category: categories[4],
    tags: [tag("t48", "社媒", "social-media", "scene"), tag("t49", "进阶", "intermediate", "difficulty"), tag("t50", "工作流", "workflow", "type")],
    difficulty: "intermediate",
    type: "workflow",
    recommendedModels: ["通义千问", "GPT-4o"],
    favoriteCount: 1900,
    viewCount: 5600,
    publishedAt: "2026-05-03T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_15",
    title: "代码注释生成",
    slug: "code-comment-generator",
    summary: "为代码自动补充清晰注释，帮助团队理解上下文和维护逻辑。",
    coverIcon: "tool_config",
    category: categories[1],
    tags: [tag("t52", "新手", "beginner", "difficulty"), tag("t53", "工具配置", "tool_config", "type")],
    difficulty: "beginner",
    type: "tool_config",
    recommendedModels: ["DeepSeek"],
    favoriteCount: 1700,
    viewCount: 5100,
    publishedAt: "2026-05-02T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_16",
    title: "SEO 标题生成器",
    slug: "seo-title-generator",
    summary: "围绕关键词生成 SEO 友好的标题和描述，适合内容分发和搜索优化。",
    coverIcon: "prompt",
    category: categories[4],
    tags: [tag("t55", "SEO", "seo", "scene"), tag("t56", "新手", "beginner", "difficulty"), tag("t57", "提示词", "prompt", "type")],
    difficulty: "beginner",
    type: "prompt",
    recommendedModels: ["ChatGPT", "Claude"],
    favoriteCount: 1600,
    viewCount: 4800,
    publishedAt: "2026-05-01T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_17",
    title: "电商详情页文案生成",
    slug: "ecommerce-detail-copy-generator",
    summary: "生成商品卖点、详情页模块和转化型文案，适合电商上新与活动页。",
    coverIcon: "prompt",
    category: categories[4],
    tags: [tag("t59", "电商", "ecommerce", "scene"), tag("t60", "进阶", "intermediate", "difficulty"), tag("t61", "提示词", "prompt", "type")],
    difficulty: "intermediate",
    type: "prompt",
    recommendedModels: ["Claude", "通义千问"],
    favoriteCount: 2400,
    viewCount: 7200,
    publishedAt: "2026-04-30T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_18",
    title: "学习计划制定助手",
    slug: "study-plan-assistant",
    summary: "根据目标和时间生成可执行学习计划，适合自学者和考试准备场景。",
    coverIcon: "tutorial",
    category: categories[5],
    tags: [tag("t63", "新手", "beginner", "difficulty"), tag("t64", "教程", "tutorial", "type")],
    difficulty: "beginner",
    type: "tutorial",
    recommendedModels: ["Kimi", "Gemini"],
    favoriteCount: 2800,
    viewCount: 7600,
    publishedAt: "2026-04-29T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_19",
    title: "面试问答模拟器",
    slug: "interview-qa-simulator",
    summary: "模拟岗位面试问答，补充追问和反馈，帮助你更有针对性地准备面试。",
    coverIcon: "agent",
    category: categories[5],
    tags: [tag("t66", "简历", "resume", "scene"), tag("t67", "进阶", "intermediate", "difficulty"), tag("t68", "Agent", "agent", "type")],
    difficulty: "intermediate",
    type: "agent",
    recommendedModels: ["ChatGPT", "GPT-4o"],
    favoriteCount: 3300,
    viewCount: 8700,
    publishedAt: "2026-04-28T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
  {
    id: "skill_20",
    title: "AI 周报生成器",
    slug: "ai-weekly-report-generator",
    summary: "整理一周工作进展，快速生成结构清晰的 AI 周报和复盘内容。",
    coverIcon: "workflow",
    category: categories[2],
    tags: [tag("t70", "专业", "advanced", "difficulty"), tag("t71", "工作流", "workflow", "type")],
    difficulty: "advanced",
    type: "workflow",
    recommendedModels: ["通义千问", "GPT-4o"],
    favoriteCount: 2200,
    viewCount: 6400,
    publishedAt: "2026-04-27T23:15:29+08:00",
    isFeatured: false,
    isHot: false,
  },
];

function uniqueOptions(type: SkillTag["type"]): SkillFilterOption[] {
  const map = new Map<string, SkillFilterOption>();

  skillList.forEach((skill) => {
    skill.tags
      .filter((item) => item.type === type)
      .forEach((item) => {
        const current = map.get(item.slug);
        map.set(item.slug, {
          label: item.name,
          value: item.slug,
          count: (current?.count || 0) + 1,
        });
      });
  });

  return Array.from(map.values());
}

export const skillFiltersMockData: SkillFilters = {
  categories: categories.map((item) => ({
    label: item.name,
    value: item.slug,
    count: skillList.filter((skill) => skill.category.slug === item.slug).length,
  })),
  categoryTree: [],
  scenes: uniqueOptions("scene"),
  types: [
    { label: "提示词", value: "prompt", count: skillList.filter((skill) => skill.type === "prompt").length },
    { label: "工作流", value: "workflow", count: skillList.filter((skill) => skill.type === "workflow").length },
    { label: "教程", value: "tutorial", count: skillList.filter((skill) => skill.type === "tutorial").length },
    { label: "工具配置", value: "tool_config", count: skillList.filter((skill) => skill.type === "tool_config").length },
    { label: "Agent", value: "agent", count: skillList.filter((skill) => skill.type === "agent").length },
  ],
};

function sortSkills(list: SkillListItem[], sort: SkillSort = "latest"): SkillListItem[] {
  const sorted = [...list];

  if (sort === "popular") {
    return sorted.sort((a, b) => Number(b.isHot) - Number(a.isHot) || b.favoriteCount - a.favoriteCount || b.viewCount - a.viewCount);
  }
  if (sort === "favorites") {
    return sorted.sort((a, b) => b.favoriteCount - a.favoriteCount);
  }
  if (sort === "views") {
    return sorted.sort((a, b) => b.viewCount - a.viewCount);
  }
  return sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getSkillsMockData(query: SkillListQuery): SkillListResponse {
  const page = query.page || 1;
  const pageSize = query.pageSize || 9;
  const keyword = query.q?.trim().toLowerCase();

  let list = [...skillList];

  if (keyword) {
    list = list.filter((skill) => `${skill.title} ${skill.summary} ${skill.tags.map((item) => item.name).join(" ")}`.toLowerCase().includes(keyword));
  }
  if (query.category) {
    list = list.filter((skill) => skill.category.slug === query.category);
  }
  if (query.scene) {
    list = list.filter((skill) => skill.tags.some((tagItem) => tagItem.type === "scene" && tagItem.slug === query.scene));
  }
  if (query.type) {
    list = list.filter((skill) => skill.type === query.type);
  }

  const sorted = sortSkills(list, query.sort || "latest");
  const total = sorted.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const offset = (page - 1) * pageSize;

  return {
    list: sorted.slice(offset, offset + pageSize),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}
