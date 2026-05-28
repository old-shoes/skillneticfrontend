import type {
  CategoryItem,
  CategoryListQuery,
  CategoryListResponse,
  CategoryOverviewData,
} from "@/lib/types/categories";
import type { Locale } from "@/lib/i18n";

const categorySeeds = [
  {
    id: "cat-prompt",
    slug: "prompt",
    icon: "category-prompt",
    color: "#3B82F6",
    tutorialCount: 128,
    sortOrder: 1,
    isEnabled: true,
    group: "all",
    scene: "content",
    difficulty: "beginner",
    isHot: true,
    name: {
      zh: "提示词技巧",
      en: "Prompt Skills",
    },
    description: {
      zh: "学习如何编写高质量提示词，提升 AI 输出效果",
      en: "Learn how to write higher-quality prompts and get better AI output.",
    },
  },
  {
    id: "cat-tools",
    slug: "tools",
    icon: "category-tools",
    color: "#22C55E",
    tutorialCount: 96,
    sortOrder: 2,
    isEnabled: true,
    group: "tools",
    scene: "office",
    difficulty: "beginner",
    isHot: true,
    name: {
      zh: "工具使用",
      en: "Tool Usage",
    },
    description: {
      zh: "掌握各类 AI 工具的使用方法和最佳实践",
      en: "Master practical usage patterns and best practices for AI tools.",
    },
  },
  {
    id: "cat-workflow",
    slug: "workflow",
    icon: "category-workflow",
    color: "#8B5CF6",
    tutorialCount: 85,
    sortOrder: 3,
    isEnabled: true,
    group: "automation",
    scene: "office",
    difficulty: "intermediate",
    isHot: true,
    name: {
      zh: "工作流搭建",
      en: "Workflow Building",
    },
    description: {
      zh: "学习构建高效的 AI 工作流和自动化方案",
      en: "Build efficient AI workflows and practical automation systems.",
    },
  },
  {
    id: "cat-industry",
    slug: "industry",
    icon: "category-industry",
    color: "#F59E0B",
    tutorialCount: 64,
    sortOrder: 4,
    isEnabled: true,
    group: "industry",
    scene: "content",
    difficulty: "intermediate",
    isHot: true,
    name: {
      zh: "行业应用",
      en: "Industry Use Cases",
    },
    description: {
      zh: "探索 AI 在各个行业的应用场景和解决方案",
      en: "Explore how AI is applied across industries and real workflows.",
    },
  },
  {
    id: "cat-automation",
    slug: "automation",
    icon: "category-automation",
    color: "#EF4444",
    tutorialCount: 52,
    sortOrder: 5,
    isEnabled: true,
    group: "automation",
    scene: "office",
    difficulty: "intermediate",
    isHot: true,
    name: {
      zh: "自动化",
      en: "Automation",
    },
    description: {
      zh: "学习自动化技术，提升工作效率和生产力",
      en: "Learn automation techniques to improve productivity and output.",
    },
  },
  {
    id: "cat-data",
    slug: "data-analysis",
    icon: "category-data",
    color: "#06B6D4",
    tutorialCount: 47,
    sortOrder: 6,
    isEnabled: true,
    group: "data",
    scene: "data",
    difficulty: "beginner",
    isHot: false,
    name: {
      zh: "数据分析",
      en: "Data Analysis",
    },
    description: {
      zh: "掌握 AI 驱动的数据分析方法和可视化技巧",
      en: "Use AI for analysis workflows, summaries, and clearer insights.",
    },
  },
  {
    id: "cat-programming",
    slug: "programming",
    icon: "category-programming",
    color: "#2563EB",
    tutorialCount: 73,
    sortOrder: 7,
    isEnabled: true,
    group: "programming",
    scene: "programming",
    difficulty: "intermediate",
    isHot: false,
    name: {
      zh: "编程开发",
      en: "Programming",
    },
    description: {
      zh: "学习 AI 编程辅助开发工具的使用方法",
      en: "Learn how to use AI coding tools in practical development work.",
    },
  },
  {
    id: "cat-drawing",
    slug: "ai-drawing",
    icon: "category-ai-drawing",
    color: "#EC4899",
    tutorialCount: 38,
    sortOrder: 8,
    isEnabled: true,
    group: "content",
    scene: "content",
    difficulty: "beginner",
    isHot: false,
    name: {
      zh: "AI 绘画",
      en: "AI Art",
    },
    description: {
      zh: "使用 AI 工具进行图像创作和设计制作",
      en: "Create images and visual assets with modern AI art tools.",
    },
  },
  {
    id: "cat-office",
    slug: "office-work",
    icon: "category-office",
    color: "#0EA5E9",
    tutorialCount: 61,
    sortOrder: 9,
    isEnabled: true,
    group: "office",
    scene: "office",
    difficulty: "beginner",
    isHot: false,
    name: {
      zh: "职场办公",
      en: "Office Work",
    },
    description: {
      zh: "提升职场效率的 AI 工具和方法技巧",
      en: "Boost day-to-day office work with AI tools and practical methods.",
    },
  },
  {
    id: "cat-learning",
    slug: "learning-method",
    icon: "category-learning",
    color: "#8B5CF6",
    tutorialCount: 34,
    sortOrder: 10,
    isEnabled: true,
    group: "learning",
    scene: "learning",
    difficulty: "advanced",
    isHot: false,
    name: {
      zh: "学习方法",
      en: "Learning Methods",
    },
    description: {
      zh: "利用 AI 提升学习效率和知识管理能力",
      en: "Use AI to improve learning speed, retention, and knowledge workflows.",
    },
  },
] as const;

const sceneCounts = {
  office: 156,
  content: 189,
  data: 98,
  programming: 87,
  learning: 148,
  life: 76,
  tools: 132,
  industry: 91,
  automation: 84,
} as const;

const hotTagsByLocale: Record<Locale, CategoryOverviewData["hotTags"]> = {
  zh: [
    { id: "tag-chatgpt", name: "ChatGPT", slug: "chatgpt", count: 156 },
    { id: "tag-midjourney", name: "Midjourney", slug: "midjourney", count: 89 },
    { id: "tag-prompt", name: "提示词", slug: "prompt", count: 234 },
    { id: "tag-drawing", name: "AI绘画", slug: "ai-drawing", count: 67 },
    { id: "tag-automation", name: "自动化", slug: "automation", count: 45 },
    { id: "tag-workflow", name: "工作流", slug: "workflow", count: 78 },
    { id: "tag-data", name: "数据分析", slug: "data-analysis", count: 56 },
    { id: "tag-office", name: "职场办公", slug: "office-work", count: 123 },
    { id: "tag-python", name: "Python", slug: "python", count: 34 },
  ],
  en: [
    { id: "tag-chatgpt", name: "ChatGPT", slug: "chatgpt", count: 156 },
    { id: "tag-midjourney", name: "Midjourney", slug: "midjourney", count: 89 },
    { id: "tag-prompt", name: "Prompts", slug: "prompt", count: 234 },
    { id: "tag-drawing", name: "AI Art", slug: "ai-drawing", count: 67 },
    { id: "tag-automation", name: "Automation", slug: "automation", count: 45 },
    { id: "tag-workflow", name: "Workflow", slug: "workflow", count: 78 },
    { id: "tag-data", name: "Data Analysis", slug: "data-analysis", count: 56 },
    { id: "tag-office", name: "Office Work", slug: "office-work", count: 123 },
    { id: "tag-python", name: "Python", slug: "python", count: 34 },
  ],
};

const sceneLabelMap: Record<Locale, Record<string, string>> = {
  zh: {
    office: "职场办公",
    content: "内容创作",
    data: "数据分析",
    programming: "开发编程",
    learning: "学习提升",
    life: "生活娱乐",
    tools: "AI工具使用",
    industry: "行业应用",
    automation: "自动化",
  },
  en: {
    office: "Office Work",
    content: "Content Creation",
    data: "Data Analysis",
    programming: "Programming",
    learning: "Learning",
    life: "Lifestyle",
    tools: "AI Tools",
    industry: "Industry",
    automation: "Automation",
  },
};

function mapCategory(locale: Locale, item: (typeof categorySeeds)[number]): CategoryItem {
  return {
    id: item.id,
    name: item.name[locale],
    slug: item.slug,
    icon: item.icon,
    color: item.color,
    description: item.description[locale],
    tutorialCount: item.tutorialCount,
    skillCount: 0,
    sortOrder: item.sortOrder,
    isEnabled: item.isEnabled,
    group: item.group,
    scene: item.scene,
    isHot: item.isHot,
  };
}

export function getCategoriesOverviewMockData(locale: Locale): CategoryOverviewData {
  return {
    stats: {
      totalCategories: 10,
      totalTutorials: 678,
      weeklyViews: 45200,
      weeklyFavorites: 128,
    },
    groups: [
      { label: locale === "en" ? "All Categories" : "全部分类", value: "all", count: 10 },
      { label: locale === "en" ? "Hot Categories" : "热门分类", value: "hot", count: 6 },
      { label: locale === "en" ? "Recently Updated" : "最近更新", value: "recent", count: 4 },
    ],
    scenes: Object.entries(sceneCounts).map(([value, count]) => ({
      label: sceneLabelMap[locale][value],
      value,
      count,
    })),
    hotTags: hotTagsByLocale[locale],
  };
}

export function getCategoriesMockData(query: CategoryListQuery, locale: Locale): CategoryListResponse {
  const keyword = query.q?.trim().toLowerCase();
  const rows = categorySeeds
    .map((item) => mapCategory(locale, item))
    .filter((item) => {
      if (query.group && query.group !== "all") {
        if (query.group === "hot" && !item.isHot) return false;
        if (query.group === "recent" && item.sortOrder > 4) return false;
        if (!["hot", "recent"].includes(query.group) && item.group !== query.group) return false;
      }
      if (query.scene && item.scene !== query.scene) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return item.name.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword) || item.slug.includes(keyword);
    });

  if (query.sort === "tutorials") {
    rows.sort((a, b) => b.tutorialCount - a.tutorialCount || a.sortOrder - b.sortOrder);
  } else if (query.sort === "alphabetical") {
    rows.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return { list: rows };
}
