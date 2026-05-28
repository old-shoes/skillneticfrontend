export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromPathname(pathname?: string | null): Locale {
  if (!pathname) {
    return defaultLocale;
  }

  const [firstSegment] = pathname.split("/").filter(Boolean);
  return firstSegment && isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function stripLocaleFromPath(pathname?: string | null): string {
  if (!pathname) {
    return "/";
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "/";
  }

  if (isLocale(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname;
}

export function withLocale(locale: Locale, href: string): string {
  if (!href || href.startsWith("#") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
    return href;
  }

  const [pathWithQuery, hash = ""] = href.split("#");
  const [rawPath = "/", query = ""] = pathWithQuery.split("?");
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
    return href;
  }

  const localizedPath = path === "/" ? `/${locale}` : `/${locale}${path}`;
  const querySuffix = query ? `?${query}` : "";
  const hashSuffix = hash ? `#${hash}` : "";

  return `${localizedPath}${querySuffix}${hashSuffix}`;
}

export const localeDisplayName: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
};

export const localeNumberFormat: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en-US",
};

export const messages = {
  zh: {
    shell: {
      nav: {
        home: "首页",
        skills: "技能库",
        community: "社区",
        tutorials: "教程",
        categories: "分类",
        submit: "提交 Skill",
      },
      login: "登录",
      register: "免费注册",
      logout: "退出",
      search: "搜索",
      footer: {
        tagline: "让每个人都能更高效地使用 AI。",
        product: "产品",
        resources: "资源",
        about: "关于我们",
        skills: "技能库",
        categories: "分类",
        submit: "提交 Skill",
        changelog: "更新日志",
        tutorials: "教程",
        learn: "学习路径",
        help: "帮助中心",
        faq: "常见问题",
        aboutLink: "关于我们",
        contact: "联系我们",
        join: "加入我们",
        partners: "合作伙伴",
        subscribeTitle: "订阅更新",
        subscribeDesc: "获取最新 Skill、教程与平台动态。",
        emailPlaceholder: "输入你的邮箱",
        subscribe: "订阅",
        copyright: "© 2024 skillnetic.ai. All rights reserved.",
      },
    },
    homepage: {
      hot: "热门",
      sections: {
        categories: "分类卡片",
        featured: "精选 Skill",
        latest: "最新更新",
        tutorials: "新手教程 / 学习路径",
      },
      actions: {
        viewAll: "查看全部",
        viewAllTutorials: "查看全部教程",
        favorite: "收藏",
        details: "查看详情",
        startLearning: "开始学习",
        browseSkills: "浏览 Skill",
        submitSkill: "提交 Skill",
        search: "搜索",
      },
      hero: {
        titlePrefix: "找到适合你的",
        titleHighlight: "Skill",
        description: "发现、学习、收藏和复用高质量的 AI 提示词、工作流与教程，让 AI 真正提升你的效率与创造力。",
        placeholder: "搜索写作、编程、设计、办公、Agent...",
      },
      stats: {
        favorites: {
          label: "Skill 收藏",
          description: "来自用户的真实收藏与认可",
        },
        templates: {
          label: "优质模板",
          description: "高质量 Prompt 与工作流",
        },
        visits: {
          label: "月访问",
          description: "活跃用户持续增长中",
        },
        tutorials: {
          label: "新手教程",
          description: "快速上手 AI 技能",
        },
      },
    },
    skills: {
      hot: "热门",
      hero: {
        titlePrefix: "探索",
        titleHighlight: "Skillnetic",
        titleSuffix: "技能库",
        description: "按分类、场景和类型筛选高质量 Skill，找到适合你的提示词、工作流和实用方法。",
        placeholder: "搜索写作、编程、办公、设计、Agent、小红书...",
      },
      search: "搜索",
      hotSearch: "热门搜索:",
      filters: {
        title: "筛选",
        category: "分类",
        scene: "场景",
        model: "模型",
        type: "类型",
        all: "全部",
        allCategories: "全部分类",
        expand: "展开筛选",
        collapse: "收起筛选",
        more: "更多",
        less: "收起",
        clear: "清空筛选",
      },
      sort: {
        label: "排序:",
        latest: "最新",
        popular: "最热",
        favorites: "最多收藏",
        views: "最多浏览",
      },
      results: "共找到 {count} 个 Skill",
      card: {
        favoritesSuffix: "收藏",
        viewsSuffix: "浏览",
        details: "查看详情",
        favorite: "收藏",
      },
      empty: {
        title: "没有找到相关 Skill",
        description: "换个关键词，或者清空筛选条件再试试。",
        clear: "清空筛选",
        submit: "提交 Skill",
      },
      loadMore: "加载更多 Skill",
      loadingMore: "加载中...",
      reachedEnd: "已经到底啦",
      cta: {
        title: "找不到合适的 Skill?",
        description: "提交你的需求，或者分享你的独家 Skill 帮助更多人！",
        submit: "提交 Skill",
        latest: "浏览最新提交",
      },
      detail: {
        downloadMarkdown: "下载 Markdown",
        downloadSuccess: "Markdown 已开始下载",
      },
    },
    tutorials: {
      hero: {
        titleHighlight: "AI 教程",
        titleSuffix: "· 文字指南",
        description: "精选中文 AI 使用教程、Prompt 写法、工具配置和工作流方法，从入门到进阶，掌握 AI 时代的核心技能。",
        placeholder: "搜索教程、关键词，如：ChatGPT 提示词、Midjourney 绘图、Agent 搭建...",
      },
      search: "搜索",
      hotSearch: "热门搜索:",
      sort: {
        label: "排序：",
        latest: "最新发布",
        popular: "最热阅读",
        favorites: "最多收藏",
      },
      results: "共 {count} 篇教程",
      card: {
        readMore: "阅读全文",
      },
      empty: {
        title: "没有找到相关教程",
        description: "换个关键词，或者调整分类和标签后再试试。",
      },
      sidebar: {
        viewAll: "查看全部",
        pathsTitle: "学习路径推荐",
        hotTagsTitle: "热门标签",
        weeklyTitle: "本周热门教程",
        subscribeTitle: "订阅教程更新",
        subscribeDescription: "获取最新的 AI 教程和实用技巧",
        emailPlaceholder: "输入你的邮箱",
        subscribe: "订阅",
      },
      detail: {
        breadcrumbHome: "首页",
        breadcrumbList: "教程",
        updatedAt: "更新于",
        readTime: "分钟阅读",
        views: "阅读",
        favorites: "收藏",
        learnTitle: "你将学到",
        suitableTitle: "适合人群",
        favoriteAction: "收藏文章",
        shareAction: "分享",
        copyLinkAction: "复制链接",
        likeAction: "赞",
        articleToc: "文章目录",
        promptExamples: "可复制的 Prompt 示例",
        promptDescription: "复制下面的 Prompt，直接在 ChatGPT 中使用",
        copyPrompt: "复制 Prompt",
        tipCardTitle: "小贴士",
        tipCardDescription: "先明确目标、对象和输出格式，再去写 Prompt，往往比单纯堆关键词更有效。",
        frameworkCardTitle: "四步法结构",
        frameworkSteps: ["角色设定", "任务描述", "输出格式", "约束条件"],
        compareTitle: "Prompt 对比示例",
        compareDescription: "下面用一个弱 Prompt 和一个更完整的 Prompt 做对比，方便快速理解差异。",
        compareWeakTitle: "弱 Prompt",
        compareWeakDescription: "帮我写一篇小红书笔记。",
        compareStrongTitle: "优化后的 Prompt",
        faqTitle: "常见问题",
        faqItems: [
          {
            question: "Prompt 一定要很长吗？",
            answer: "不一定。关键不是长度，而是信息是否清楚、完整、可执行。",
          },
          {
            question: "什么时候需要加示例？",
            answer: "当你希望输出风格、结构或语气更稳定时，加一个短示例通常很有效。",
          },
          {
            question: "为什么 AI 输出还是不稳定？",
            answer: "通常是因为任务边界不清、对象不明确，或者缺少格式和约束条件。",
          },
        ],
        relatedTitle: "相关文章推荐",
        hotTagsTitle: "热门标签",
        subscribeTitle: "订阅更新",
        subscribeDescription: "获取最新的 AI 教程和实用技巧",
        emailPlaceholder: "输入你的邮箱",
        subscribe: "订阅",
        advancedTitle: "进阶学习推荐",
        helpfulTitle: "这篇教程对你有帮助吗？",
        helpfulYes: "有帮助",
        helpfulNo: "没太大帮助",
        prev: "上一篇",
        next: "下一篇",
        readArticle: "阅读全文",
        copied: "已复制",
        beginner: "新手友好",
      },
    },
    categories: {
      breadcrumb: {
        home: "首页",
        tutorials: "教程",
        current: "分类",
      },
      hero: {
        title: "全部分类",
        description: "浏览所有教程分类，找到你感兴趣的内容",
        placeholder: "搜索分类或教程...",
      },
      stats: {
        totalCategories: "分类总数",
        totalTutorials: "教程总数",
        weeklyViews: "本周阅读量",
        weeklyFavorites: "本周收藏",
      },
      sidebar: {
        browseTitle: "浏览方式",
        sceneTitle: "学习场景",
        expand: "展开更多",
        collapse: "收起",
      },
      sort: {
        label: "排序",
        default: "默认排序",
        tutorials: "教程数量",
        alphabetical: "按名称",
      },
      card: {
        action: "查看教程",
      },
      hotTags: {
        title: "热门标签",
        viewAll: "查看全部标签",
        more: "更多标签",
      },
      empty: "没有符合当前筛选条件的分类。",
    },
    placeholder: {
      ready: "当前页骨架已建立，后续可在这个独立路由上继续开发。",
      entryReady: "页面入口已打通",
      reserveSpace: "保留后续业务扩展位",
      nextStep: "Next Step",
      pageReady: "此页面已具备独立开发入口。",
      hint: "如需继续做这个页面，只需要在当前路由下补真实列表、详情、表单或鉴权逻辑即可。",
      backHome: "返回首页",
    },
    staticPages: {
      about: {
        eyebrow: "关于我们",
        title: "关于我们页骨架",
        description: "首页页脚的关于我们入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补平台介绍、团队信息和愿景说明。",
      },
      categories: {
        eyebrow: "分类",
        title: "分类总览页骨架",
        description: "首页分类区和导航入口已经可以跳到这里。当前提供分类总览的独立路由骨架，后续可继续接分类列表与统计信息。",
      },
      changelog: {
        eyebrow: "更新日志",
        title: "更新日志页骨架",
        description: "首页页脚的更新日志入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补版本记录、发布时间和变更说明。",
      },
      community: {
        eyebrow: "社区",
        title: "社区页骨架",
        description: "顶部导航的社区入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补帖子广场、互动动态、评论回复和社区规则。",
      },
      contact: {
        eyebrow: "联系我们",
        title: "联系我们页骨架",
        description: "首页页脚的联系我们入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补联系方式、反馈渠道和商务合作信息。",
      },
      faq: {
        eyebrow: "常见问题",
        title: "常见问题页骨架",
        description: "首页页脚的常见问题入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补问答列表、分类和搜索。",
      },
      help: {
        eyebrow: "帮助中心",
        title: "帮助中心页骨架",
        description: "首页页脚的帮助中心入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补使用说明、问题排查和支持信息。",
      },
      join: {
        eyebrow: "加入我们",
        title: "加入我们页骨架",
        description: "首页页脚的加入我们入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补招聘职位、团队介绍和投递方式。",
      },
      learn: {
        eyebrow: "学习路径",
        title: "学习路径页骨架",
        description: "首页页脚的学习路径入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补阶段课程、路线图和推荐内容。",
      },
      login: {
        eyebrow: "登录",
        title: "登录页骨架",
        description: "首页中的登录入口和收藏按钮跳转已经可用。当前只提供独立登录路由骨架，后续可继续接账号认证。",
      },
      partners: {
        eyebrow: "合作伙伴",
        title: "合作伙伴页骨架",
        description: "首页页脚的合作伙伴入口已经可以跳到这里。当前先提供独立路由骨架，后续可继续补合作案例、伙伴列表和合作方式。",
      },
      register: {
        eyebrow: "注册",
        title: "注册页骨架",
        description: "首页免费注册按钮已经可以跳到这里。当前提供独立注册路由骨架，后续可继续接注册表单与用户流程。",
      },
      submit: {
        eyebrow: "提交 Skill",
        title: "提交 Skill 页骨架",
        description: "首页 Hero CTA 和导航入口已经可以跳到这里。当前提供表单入口骨架，后续可继续补提交表单与校验逻辑。",
      },
      tutorials: {
        eyebrow: "教程",
        title: "教程列表页骨架",
        description: "首页教程区和顶部导航已经可以跳到这里。当前先提供独立路由骨架，后续可继续接教程列表、学习路径和分类筛选。",
      },
    },
  },
  en: {
    shell: {
      nav: {
        home: "Home",
        skills: "Skills",
        community: "Community",
        tutorials: "Tutorials",
        categories: "Categories",
        submit: "Submit Skill",
      },
      login: "Log in",
      register: "Sign up free",
      logout: "Log out",
      search: "Search",
      footer: {
        tagline: "Help everyone use AI more effectively.",
        product: "Product",
        resources: "Resources",
        about: "About",
        skills: "Skill Library",
        categories: "Categories",
        submit: "Submit Skill",
        changelog: "Changelog",
        tutorials: "Tutorials",
        learn: "Learning Paths",
        help: "Help Center",
        faq: "FAQ",
        aboutLink: "About Us",
        contact: "Contact",
        join: "Careers",
        partners: "Partners",
        subscribeTitle: "Subscribe",
        subscribeDesc: "Get the latest Skills, tutorials, and product updates.",
        emailPlaceholder: "Enter your email",
        subscribe: "Subscribe",
        copyright: "© 2024 skillnetic.ai. All rights reserved.",
      },
    },
    homepage: {
      hot: "Hot",
      sections: {
        categories: "Categories",
        featured: "Featured Skills",
        latest: "Latest Updates",
        tutorials: "Beginner Tutorials / Learning Paths",
      },
      actions: {
        viewAll: "View all",
        viewAllTutorials: "View all tutorials",
        favorite: "Favorite",
        details: "View details",
        startLearning: "Start learning",
        browseSkills: "Browse Skills",
        submitSkill: "Submit Skill",
        search: "Search",
      },
      hero: {
        titlePrefix: "Find the right",
        titleHighlight: "Skill",
        description: "Discover, learn, save, and reuse high-quality AI prompts, workflows, and tutorials to boost your productivity and creativity.",
        placeholder: "Search writing, coding, design, office, agent...",
      },
      stats: {
        favorites: {
          label: "Skill Favorites",
          description: "Real saves and endorsements from users",
        },
        templates: {
          label: "Quality Templates",
          description: "High-quality prompts and workflows",
        },
        visits: {
          label: "Monthly Visits",
          description: "An active and growing audience",
        },
        tutorials: {
          label: "Beginner Tutorials",
          description: "A fast start to AI skills",
        },
      },
    },
    skills: {
      hot: "Hot",
      hero: {
        titlePrefix: "Explore the",
        titleHighlight: "Skillnetic",
        titleSuffix: "Library",
        description: "Filter high-quality Skills by category, scenario, and type to find the prompts, workflows, and methods that fit you.",
        placeholder: "Search writing, coding, office, design, agent, Xiaohongshu...",
      },
      search: "Search",
      hotSearch: "Hot searches:",
      filters: {
        title: "Filters",
        category: "Category",
        scene: "Scenario",
        model: "Model",
        type: "Type",
        all: "All",
        allCategories: "All Categories",
        expand: "Show filters",
        collapse: "Hide filters",
        more: "More",
        less: "Less",
        clear: "Clear filters",
      },
      sort: {
        label: "Sort:",
        latest: "Latest",
        popular: "Popular",
        favorites: "Most Favorited",
        views: "Most Viewed",
      },
      results: "{count} Skills found",
      card: {
        favoritesSuffix: "favorites",
        viewsSuffix: "views",
        details: "View details",
        favorite: "Favorite",
      },
      empty: {
        title: "No matching Skills found",
        description: "Try another keyword or clear the current filters.",
        clear: "Clear filters",
        submit: "Submit Skill",
      },
      loadMore: "Load more Skills",
      loadingMore: "Loading...",
      reachedEnd: "You have reached the end",
      cta: {
        title: "Can't find the right Skill?",
        description: "Submit your need, or share your unique Skill to help more people.",
        submit: "Submit Skill",
        latest: "Browse latest submissions",
      },
      detail: {
        downloadMarkdown: "Download Markdown",
        downloadSuccess: "Markdown download started",
      },
    },
    tutorials: {
      hero: {
        titleHighlight: "AI Tutorials",
        titleSuffix: "· Text Guides",
        description: "Curated AI tutorials, prompt-writing guides, tool setup walkthroughs, and workflow methods to help you build core AI skills from beginner to advanced.",
        placeholder: "Search tutorials or keywords, like ChatGPT prompts, Midjourney, or Agent setup...",
      },
      search: "Search",
      hotSearch: "Hot searches:",
      sort: {
        label: "Sort:",
        latest: "Latest",
        popular: "Most Read",
        favorites: "Most Favorited",
      },
      results: "{count} tutorials",
      card: {
        readMore: "Read article",
      },
      empty: {
        title: "No matching tutorials found",
        description: "Try another keyword or adjust the category and tag filters.",
      },
      sidebar: {
        viewAll: "View all",
        pathsTitle: "Recommended Learning Paths",
        hotTagsTitle: "Hot Tags",
        weeklyTitle: "Weekly Popular Tutorials",
        subscribeTitle: "Subscribe for Updates",
        subscribeDescription: "Get the latest AI tutorials and practical tips",
        emailPlaceholder: "Enter your email",
        subscribe: "Subscribe",
      },
      detail: {
        breadcrumbHome: "Home",
        breadcrumbList: "Tutorials",
        updatedAt: "Updated",
        readTime: "min read",
        views: "views",
        favorites: "favorites",
        learnTitle: "What you'll learn",
        suitableTitle: "Who this is for",
        favoriteAction: "Favorite",
        shareAction: "Share",
        copyLinkAction: "Copy link",
        likeAction: "Helpful",
        articleToc: "Article Outline",
        promptExamples: "Copyable Prompt Examples",
        promptDescription: "Copy the prompt below and use it directly in ChatGPT",
        copyPrompt: "Copy Prompt",
        tipCardTitle: "Quick Tip",
        tipCardDescription: "Define the goal, audience, and output format first. That usually matters more than adding more keywords.",
        frameworkCardTitle: "The Four-Step Structure",
        frameworkSteps: ["Role setup", "Task description", "Output format", "Constraints"],
        compareTitle: "Prompt Comparison",
        compareDescription: "Compare a weak prompt and a stronger prompt to understand the difference more quickly.",
        compareWeakTitle: "Weak Prompt",
        compareWeakDescription: "Help me write a Xiaohongshu post.",
        compareStrongTitle: "Improved Prompt",
        faqTitle: "FAQ",
        faqItems: [
          {
            question: "Does a prompt need to be long?",
            answer: "Not necessarily. Clarity and completeness matter more than raw length.",
          },
          {
            question: "When should I add examples?",
            answer: "Examples help when you want more stable style, structure, or tone in the output.",
          },
          {
            question: "Why is the output still unstable?",
            answer: "The task is often too broad, the audience is unclear, or the format and constraints are missing.",
          },
        ],
        relatedTitle: "Related Articles",
        hotTagsTitle: "Hot Tags",
        subscribeTitle: "Subscribe for Updates",
        subscribeDescription: "Get the latest AI tutorials and practical tips",
        emailPlaceholder: "Enter your email",
        subscribe: "Subscribe",
        advancedTitle: "Next Tutorials to Read",
        helpfulTitle: "Was this tutorial helpful?",
        helpfulYes: "Helpful",
        helpfulNo: "Not really",
        prev: "Previous",
        next: "Next",
        readArticle: "Read article",
        copied: "Copied",
        beginner: "Beginner Friendly",
      },
    },
    categories: {
      breadcrumb: {
        home: "Home",
        tutorials: "Tutorials",
        current: "Categories",
      },
      hero: {
        title: "All Categories",
        description: "Browse every tutorial category and jump into the topics you care about.",
        placeholder: "Search categories or tutorials...",
      },
      stats: {
        totalCategories: "Categories",
        totalTutorials: "Tutorials",
        weeklyViews: "Weekly Views",
        weeklyFavorites: "Weekly Favorites",
      },
      sidebar: {
        browseTitle: "Browse Mode",
        sceneTitle: "Learning Scenes",
        expand: "Show more",
        collapse: "Collapse",
      },
      sort: {
        label: "Sort",
        default: "Default",
        tutorials: "Tutorial Count",
        alphabetical: "A to Z",
      },
      card: {
        action: "View tutorials",
      },
      hotTags: {
        title: "Hot Tags",
        viewAll: "View all tags",
        more: "More tags",
      },
      empty: "No categories match the current filters.",
    },
    placeholder: {
      ready: "This page scaffold is ready and can be extended independently later.",
      entryReady: "The route entry is already connected",
      reserveSpace: "Reserved for future business logic",
      nextStep: "Next Step",
      pageReady: "This page already has an independent implementation entry point.",
      hint: "When you want to continue, you can add the real list, detail, form, or auth flow under the current route.",
      backHome: "Back to home",
    },
    staticPages: {
      about: {
        eyebrow: "About",
        title: "About Page Scaffold",
        description: "The About link in the homepage footer already points here. This route currently provides a scaffold for future company, team, and vision content.",
      },
      categories: {
        eyebrow: "Categories",
        title: "Category Overview Scaffold",
        description: "The homepage category section and navigation entry already point here. This route currently provides a scaffold for a category overview, future lists, and statistics.",
      },
      changelog: {
        eyebrow: "Changelog",
        title: "Changelog Page Scaffold",
        description: "The changelog link in the homepage footer already points here. This route currently provides a scaffold for future release notes and update history.",
      },
      community: {
        eyebrow: "Community",
        title: "Community Page Scaffold",
        description: "The Community entry in the top navigation already points here. This route currently provides a standalone scaffold for future posts, activity feeds, replies, and community rules.",
      },
      contact: {
        eyebrow: "Contact",
        title: "Contact Page Scaffold",
        description: "The Contact link in the homepage footer already points here. This route currently provides a scaffold for future support channels and business contact details.",
      },
      faq: {
        eyebrow: "FAQ",
        title: "FAQ Page Scaffold",
        description: "The FAQ link in the homepage footer already points here. This route currently provides a scaffold for future questions, answers, and search.",
      },
      help: {
        eyebrow: "Help Center",
        title: "Help Center Scaffold",
        description: "The Help Center link in the homepage footer already points here. This route currently provides a scaffold for future guides, troubleshooting, and support content.",
      },
      join: {
        eyebrow: "Careers",
        title: "Careers Page Scaffold",
        description: "The Careers link in the homepage footer already points here. This route currently provides a scaffold for future job listings, team intro, and application details.",
      },
      learn: {
        eyebrow: "Learning Paths",
        title: "Learning Paths Scaffold",
        description: "The Learning Paths link in the homepage footer already points here. This route currently provides a scaffold for future course stages, roadmaps, and recommendations.",
      },
      login: {
        eyebrow: "Log in",
        title: "Login Page Scaffold",
        description: "The login entry and favorite-button jump are already connected. This route currently provides a scaffold for future authentication flows.",
      },
      partners: {
        eyebrow: "Partners",
        title: "Partners Page Scaffold",
        description: "The Partners link in the homepage footer already points here. This route currently provides a scaffold for future partner lists, case studies, and collaboration details.",
      },
      register: {
        eyebrow: "Sign up",
        title: "Registration Page Scaffold",
        description: "The free registration button on the homepage already points here. This route currently provides a scaffold for future registration flows.",
      },
      submit: {
        eyebrow: "Submit Skill",
        title: "Submit Skill Scaffold",
        description: "The hero CTA and navigation entry already point here. This route currently provides a scaffold for future submission forms and validation logic.",
      },
      tutorials: {
        eyebrow: "Tutorials",
        title: "Tutorial List Scaffold",
        description: "The homepage tutorial section and top navigation already point here. This route currently provides a scaffold for future tutorial lists, learning paths, and filters.",
      },
    },
  },
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function getStaticPlaceholderCopy(locale: Locale, slug: string) {
  const localeMessages = getMessages(locale);
  return localeMessages.staticPages[slug as keyof typeof localeMessages.staticPages] ?? null;
}
