import type { Locale } from "@/lib/i18n";
import type {
  TutorialAuthor,
  TutorialDetail,
  TutorialPrevNextItem,
  TutorialPromptBlock,
  TutorialRelatedItem,
} from "@/lib/types/tutorial-detail";
import type { TutorialCategory, TutorialDifficulty, TutorialTag } from "@/lib/types/tutorials";

type TutorialSlug =
  | "chatgpt-prompt-beginner"
  | "midjourney-guide-complete"
  | "n8n-workflow-automation"
  | "excel-ai-data-analysis"
  | "xiaohongshu-ai-content-guide"
  | "python-ai-app-practice";

type LocalizedText = {
  zh: string;
  en: string;
};

type TutorialSeed = {
  id: string;
  slug: TutorialSlug;
  categorySlug: "prompt" | "tools" | "workflow" | "industry" | "cases" | "advanced";
  difficulty: TutorialDifficulty;
  readTimeMinutes: number;
  viewCount: number;
  favoriteCount: number;
  likeCount: number;
  isBeginner: boolean;
  coverImage: string;
  coverIcon: string;
  title: LocalizedText;
  summary: LocalizedText;
  contentMarkdown: LocalizedText;
  learningPoints: {
    zh: string[];
    en: string[];
  };
  suitableFor: {
    zh: string[];
    en: string[];
  };
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  promptBlock: {
    title: LocalizedText;
    description: LocalizedText;
    content: LocalizedText;
  };
  tags: Array<{
    id: string;
    slug: string;
    name: LocalizedText;
  }>;
  related: TutorialSlug[];
};

const authors: Record<Locale, TutorialAuthor> = {
  zh: {
    id: "ai-skill-editorial",
    name: "Skillnetic 团队",
    avatarUrl: null,
    title: "官方编辑",
  },
  en: {
    id: "ai-skill-editorial",
    name: "Skillnetic Team",
    avatarUrl: null,
    title: "Editorial Team",
  },
};

const categories: Record<Locale, Record<TutorialSeed["categorySlug"], TutorialCategory>> = {
  zh: {
    prompt: { id: "category-prompt", name: "提示词技巧", slug: "prompt", icon: "category-prompt", color: "purple", tutorialCount: 32 },
    tools: { id: "category-tools", name: "工具使用", slug: "tools", icon: "category-tool", color: "emerald", tutorialCount: 18 },
    workflow: { id: "category-workflow", name: "工作流搭建", slug: "workflow", icon: "category-workflow", color: "indigo", tutorialCount: 15 },
    industry: { id: "category-industry", name: "行业应用", slug: "industry", icon: "category-industry", color: "orange", tutorialCount: 20 },
    cases: { id: "category-cases", name: "案例实战", slug: "cases", icon: "category-case", color: "cyan", tutorialCount: 17 },
    advanced: { id: "category-advanced", name: "进阶提升", slug: "advanced", icon: "category-advanced", color: "rose", tutorialCount: 14 },
  },
  en: {
    prompt: { id: "category-prompt", name: "Prompt Techniques", slug: "prompt", icon: "category-prompt", color: "purple", tutorialCount: 32 },
    tools: { id: "category-tools", name: "Tool Usage", slug: "tools", icon: "category-tool", color: "emerald", tutorialCount: 18 },
    workflow: { id: "category-workflow", name: "Workflow Building", slug: "workflow", icon: "category-workflow", color: "indigo", tutorialCount: 15 },
    industry: { id: "category-industry", name: "Industry Use Cases", slug: "industry", icon: "category-industry", color: "orange", tutorialCount: 20 },
    cases: { id: "category-cases", name: "Case Studies", slug: "cases", icon: "category-case", color: "cyan", tutorialCount: 17 },
    advanced: { id: "category-advanced", name: "Advanced Growth", slug: "advanced", icon: "category-advanced", color: "rose", tutorialCount: 14 },
  },
};

const tutorialOrder: TutorialSlug[] = [
  "chatgpt-prompt-beginner",
  "midjourney-guide-complete",
  "n8n-workflow-automation",
  "excel-ai-data-analysis",
  "xiaohongshu-ai-content-guide",
  "python-ai-app-practice",
];

const publishedAtBySlug: Record<TutorialSlug, string> = {
  "chatgpt-prompt-beginner": "2026-05-17T00:00:00+08:00",
  "midjourney-guide-complete": "2026-05-16T00:00:00+08:00",
  "n8n-workflow-automation": "2026-05-15T00:00:00+08:00",
  "excel-ai-data-analysis": "2026-05-14T00:00:00+08:00",
  "xiaohongshu-ai-content-guide": "2026-05-13T00:00:00+08:00",
  "python-ai-app-practice": "2026-05-12T00:00:00+08:00",
};

const tutorialSeeds: TutorialSeed[] = [
  {
    id: "tutorial-chatgpt-prompt-beginner",
    slug: "chatgpt-prompt-beginner",
    categorySlug: "prompt",
    difficulty: "beginner",
    readTimeMinutes: 12,
    viewCount: 23600,
    favoriteCount: 1200,
    likeCount: 128,
    isBeginner: true,
    coverImage: "/icons/tutorials/cover-chatgpt-prompt.svg",
    coverIcon: "chatgpt",
    title: {
      zh: "ChatGPT 提示词入门：从一句话到高质量 Prompt",
      en: "ChatGPT Prompt Basics: From One Sentence to a High-Quality Prompt",
    },
    summary: {
      zh: "从角色设定、任务描述、示例约束、示例结构四个部分，学会写出稳定可复用的提示词，让 AI 输出更准确、更高质量的结果。",
      en: "Learn how to write stable, reusable prompts through role setup, task framing, constraints, and structure so AI outputs become more accurate and useful.",
    },
    contentMarkdown: {
      zh: `## 1. 先理解什么是提示词

提示词就是你给 AI 的任务说明。说明越清楚，AI 越容易理解你的目标、边界和输出方式。

> 小贴士：先把目标、对象和输出结果说清楚，再让 AI 执行，成功率会高很多。

## 2. 提示词的核心结构

高质量 Prompt 通常包含四个部分：角色设定、任务描述、输出格式、约束条件。先让 AI 知道它是谁，再告诉它要解决什么问题。

### 角色设定

告诉 AI 它应该以什么身份回答，比如运营、设计师、数据分析师或开发者。

### 任务描述

明确你的具体目标、对象和使用场景，不要只说“帮我写一篇内容”。

### 输出格式

说明你要列表、表格、分点说明还是完整文案。

### 约束条件

加入字数、语气、不能出现的内容、输出示例等限制。

## 3. 实战示例

不要只写“帮我写一篇小红书笔记”。可以改成“你是一名小红书运营，请为刚入职的白领写一篇 AI 提升效率的笔记，口语化，含 3 个技巧和总结”。

## 4. 常见问题与避坑

最常见的问题是任务太泛、没有交代人群、没有限制格式、没有示例。这样会让输出变得空泛、不稳定。

## 5. 进阶学习建议

拿自己工作里最常见的一项任务，把 Prompt 按四步法重写一遍，再对比结果差异。`,
      en: `## 1. What is a prompt?

A prompt is the instruction you give to an AI model. The clearer it is, the easier it is for the model to understand your goal, boundaries, and expected output.

> Tip: first define the goal, audience, and output. Then let the model execute.

## 2. The core prompt structure

A high-quality prompt usually includes four parts: role setup, task description, output format, and constraints.

### Role setup

Tell the model who it should act as, such as an operator, designer, analyst, or developer.

### Task description

Describe the exact problem to solve and the target audience.

### Output format

Specify whether you want a list, table, structured answer, or a full piece of copy.

### Constraints

Add limits such as tone, length, forbidden content, or examples.

## 3. A practical example

Instead of saying "write a Xiaohongshu post for me," say "You are a Xiaohongshu content operator. Write a post for beginner office workers about using AI to improve efficiency. Use a conversational tone and include 3 practical tips plus a short summary."

## 4. Common mistakes to avoid

The most common issues are overly broad requests, no audience context, no format definition, and no examples.

## 5. What to practice next

Take one repeated task from your work and rewrite its prompt with role, task, format, and constraints. Then compare the result.`,
    },
    learningPoints: {
      zh: ["理解提示词的核心结构和设计原则", "掌握四步法编写高质量 Prompt", "通过示例对比优化 Prompt 的方法", "解决常见问题和避坑技巧"],
      en: ["Understand the core structure and design principles of prompts", "Use a practical four-step method to write higher-quality prompts", "Improve prompts through before-and-after comparisons", "Avoid common beginner mistakes and unstable outputs"],
    },
    suitableFor: {
      zh: ["AI 新手，想快速上手 ChatGPT", "希望让 AI 输出更稳定、更有结构的用户", "内容创作者、运营、设计师、开发者等"],
      en: ["Beginners who want to get started with ChatGPT quickly", "Users who want more stable and structured AI output", "Creators, operators, designers, and developers who need reusable prompts"],
    },
    seoTitle: {
      zh: "ChatGPT 提示词入门教程",
      en: "ChatGPT Prompt Basics Tutorial",
    },
    seoDescription: {
      zh: "学习如何写出高质量 ChatGPT Prompt，掌握结构、示例和优化方法。",
      en: "Learn the structure, examples, and optimization method behind high-quality ChatGPT prompts.",
    },
    promptBlock: {
      title: {
        zh: "小红书标题生成 Prompt",
        en: "Xiaohongshu post prompt",
      },
      description: {
        zh: "适合直接在 ChatGPT 中使用",
        en: "Use it directly in ChatGPT",
      },
      content: {
        zh: "你是一名资深小红书运营专家，请帮我生成 10 个关于“如何用 AI 提升工作效率”的小红书标题。要求：口语化、有点击欲望、不夸大，适合新手白领。",
        en: "You are an experienced Xiaohongshu content strategist. Write a post about how AI improves work efficiency for beginner office workers. Requirements:\n1. Identify the target audience clearly\n2. Use a conversational and natural tone\n3. Include 3 practical tips and a short conclusion\n4. Keep the post under 800 Chinese characters",
      },
    },
    tags: [
      { id: "tag-chatgpt", slug: "chatgpt", name: { zh: "ChatGPT", en: "ChatGPT" } },
      { id: "tag-prompt", slug: "prompt", name: { zh: "提示词", en: "Prompt" } },
    ],
    related: ["midjourney-guide-complete", "n8n-workflow-automation", "excel-ai-data-analysis"],
  },
  {
    id: "tutorial-midjourney-guide-complete",
    slug: "midjourney-guide-complete",
    categorySlug: "tools",
    difficulty: "intermediate",
    readTimeMinutes: 15,
    viewCount: 18900,
    favoriteCount: 986,
    likeCount: 96,
    isBeginner: false,
    coverImage: "/icons/tutorials/cover-midjourney-guide.svg",
    coverIcon: "midjourney",
    title: {
      zh: "Midjourney 绘图完整指南：从入门到精通",
      en: "The Complete Midjourney Guide: From Beginner to Advanced",
    },
    summary: {
      zh: "从账号注册、界面使用、提示词结构、风格优化、控制参数和高清放大，带你全面掌握 MJ 绘图技巧。",
      en: "From account setup and interface basics to prompt structure, style control, parameters, and upscaling, this guide covers the full Midjourney workflow.",
    },
    contentMarkdown: {
      zh: `## 1. 先建立基础流程

Midjourney 的核心不是背参数，而是先建立稳定的提示词结构，再通过小步迭代去控制结果。

## 2. 拆清楚提示词组成

提示词可以拆成主体、场景、风格、光线、镜头、参数六部分。不要一次塞太多风格词，否则你很难知道是哪一段起了作用。

### 主体和场景

先明确画面里是什么，以及它在什么环境里。

### 风格和光线

控制整体气质、质感和情绪，不要每轮改太多。

### 参数

画幅、风格化强度、混乱度都属于控制工具，要有目的地用。

## 3. 从简单版本开始

先用简单提示词得到第一版图，再逐步补充构图、材质、色调和画幅参数，这样更容易得到可复用的风格。

## 4. 常见问题

很多人会一次改太多变量，结果不知道什么让图片变好了。每轮只改 1 到 2 个关键点，效率最高。

## 5. 建立自己的素材库

把你最常用的风格词和参数沉淀成模板，后面做海报、封面、产品图时能直接复用。`,
      en: `## 1. Start with a simple workflow

The basic Midjourney loop is simple: write a prompt, review four results, choose a direction, and iterate.

## 2. Build prompts with stable components

Use a structure like subject, scene, style, lighting, camera, and parameters. This keeps iterations easier to compare.

### Subject and scene

Start by defining what is in the frame and where it happens.

### Style and lighting

These shape the visual mood. Change them carefully.

### Parameters

Aspect ratio, stylize, and chaos help with control. Use them intentionally.

## 3. Use style words carefully

Style words such as cinematic, editorial, minimal, or watercolor can change the result dramatically. Add only one or two major style directions at a time.

## 4. Parameters are for control

If you change too many parameters at once, you will not know what actually improved the image.

## 5. Iterate with purpose

Save strong prompt fragments, note what changed each round, and reuse successful structures for the next project.`,
    },
    learningPoints: {
      zh: ["掌握 Midjourney 的基础工作流", "理解风格词和参数对结果的影响", "建立可复用的绘图提示词结构"],
      en: ["Understand the basic Midjourney workflow from prompt to upscale", "Learn how style words and parameters change image output", "Build a reusable prompt structure for visual generation tasks"],
    },
    suitableFor: {
      zh: ["设计师和视觉内容创作者", "想系统学习 AI 绘图的用户", "需要提高出图效率的小团队"],
      en: ["Designers and creators starting with AI image generation", "Users who want more control over style consistency", "Teams that need faster visual ideation"],
    },
    seoTitle: {
      zh: "Midjourney 绘图完整指南",
      en: "Midjourney Complete Guide",
    },
    seoDescription: {
      zh: "系统学习 Midjourney 提示词结构、风格控制和参数使用方法。",
      en: "A practical Midjourney guide covering prompts, style control, parameters, and iteration.",
    },
    promptBlock: {
      title: {
        zh: "产品海报 Prompt",
        en: "Product visual prompt",
      },
      description: {
        zh: "适合测试构图和风格",
        en: "Good for testing composition and style",
      },
      content: {
        zh: "一款高端无线耳机放在极简办公桌上，柔和自然光，商业摄影风格，材质真实，细节清晰，浅景深 --ar 4:5 --stylize 150",
        en: "A premium wireless headset on a clean desk, soft daylight, minimal editorial style, realistic materials, shallow depth of field, high detail --ar 4:5 --stylize 150",
      },
    },
    tags: [
      { id: "tag-midjourney", slug: "midjourney", name: { zh: "Midjourney", en: "Midjourney" } },
      { id: "tag-design", slug: "design", name: { zh: "设计", en: "Design" } },
    ],
    related: ["chatgpt-prompt-beginner", "xiaohongshu-ai-content-guide", "python-ai-app-practice"],
  },
  {
    id: "tutorial-n8n-workflow-automation",
    slug: "n8n-workflow-automation",
    categorySlug: "workflow",
    difficulty: "intermediate",
    readTimeMinutes: 18,
    viewCount: 15300,
    favoriteCount: 754,
    likeCount: 81,
    isBeginner: false,
    coverImage: "/icons/tutorials/cover-workflow-guide.svg",
    coverIcon: "workflow",
    title: {
      zh: "工作流搭建实战：用 n8n 实现自动化任务",
      en: "Workflow Practice: Automate Tasks with n8n",
    },
    summary: {
      zh: "通过 3 个实战案例，带你掌握 n8n 的核心节点与工作流搭建思路，实现日常任务自动化，提升效率。",
      en: "Use three practical cases to understand key n8n nodes and workflow design patterns so you can automate recurring tasks and improve efficiency.",
    },
    contentMarkdown: {
      zh: `## 1. 从输入、处理、输出开始

做自动化时，先别想着一口气搭完整系统。先明确输入、处理逻辑和输出结果，工作流就容易拆清楚。

## 2. 理解节点职责

n8n 的核心是触发器、节点和分支逻辑。把每个节点职责控制在最小范围内，后续维护会轻松很多。

### 触发器

先确定流程从哪里开始，比如表单、定时任务或 webhook。

### 逻辑节点

分支、判断、合并这些节点决定流程是否稳定。

### AI 节点

适合做分类、提取、改写、总结，但不适合承担全部规则判断。

## 3. 每个分支单独跑通

一上来就做超长流程最容易失控。先把关键节点单独跑通，再合并成完整链路，排错成本更低。

## 4. 做好异常兜底

建议为每条工作流记录失败点、重试方式和人工兜底策略，这样才能真正用于日常业务。

## 5. 持续优化

记录哪些步骤失败最多、哪些地方还需要人工介入，逐步收紧 Prompt 和节点配置。`,
      en: `## 1. Think in input, logic, and output

Every workflow should start with a clear trigger, move through a small number of decisions, and end with a measurable output.

## 2. Keep each workflow focused

Avoid building one giant workflow that does everything. Smaller workflows are easier to debug and reuse.

### Triggers

Define what starts the workflow: forms, schedules, webhooks, or inbound events.

### Logic nodes

Branches and conditions determine whether the flow stays predictable.

### AI nodes

Use them for classification, rewriting, summarization, and extraction rather than hard routing logic.

## 3. Add AI only to uncertain steps

AI is useful where deterministic rules become expensive or brittle.

## 4. Test each branch independently

Use sample data and isolate critical nodes before connecting the full chain. This saves a lot of debugging time later.

## 5. Monitor and improve

Track which steps fail most often, where manual fixes happen, and which prompts need tightening. Stable automation is built through iteration.`,
    },
    learningPoints: {
      zh: ["理解触发器、动作和分支节点的关系", "掌握更稳定的工作流设计思路", "知道哪些环节适合接入 AI 能力"],
      en: ["Understand how triggers, actions, and logic nodes work together", "Design workflows that are easier to test and maintain", "Use AI steps only where they add clear value"],
    },
    suitableFor: {
      zh: ["做运营自动化和流程搭建的同学", "想接入 AI 节点的工作流实践者", "需要连接表单、表格、通知和内容系统的团队"],
      en: ["Operators building repeatable automation", "Teams connecting forms, sheets, and notifications", "Users exploring AI agents on top of workflows"],
    },
    seoTitle: {
      zh: "n8n 自动化工作流实战教程",
      en: "n8n Workflow Automation Tutorial",
    },
    seoDescription: {
      zh: "学习如何设计稳定、可维护的 n8n 自动化工作流，并合理接入 AI 节点。",
      en: "Learn how to design practical n8n workflows with stable triggers, branches, and AI steps.",
    },
    promptBlock: {
      title: {
        zh: "邮件分类 Prompt",
        en: "Email classification prompt",
      },
      description: {
        zh: "适合放进 AI 节点",
        en: "Useful inside an n8n AI node",
      },
      content: {
        zh: "请将以下邮件分类到 sales、support、billing、partnership、spam 其中之一，并返回 JSON：{label, confidence}。",
        en: "Classify the following email into one of these labels: sales, support, billing, partnership, spam. Return only valid JSON with label and confidence.",
      },
    },
    tags: [
      { id: "tag-workflow", slug: "workflow", name: { zh: "工作流", en: "Workflow" } },
      { id: "tag-automation", slug: "automation", name: { zh: "自动化", en: "Automation" } },
      { id: "tag-agent", slug: "agent", name: { zh: "Agent", en: "Agent" } },
    ],
    related: ["chatgpt-prompt-beginner", "excel-ai-data-analysis", "python-ai-app-practice"],
  },
  {
    id: "tutorial-excel-ai-data-analysis",
    slug: "excel-ai-data-analysis",
    categorySlug: "industry",
    difficulty: "beginner",
    readTimeMinutes: 14,
    viewCount: 12700,
    favoriteCount: 632,
    likeCount: 64,
    isBeginner: true,
    coverImage: "/icons/tutorials/cover-excel-ai.svg",
    coverIcon: "excel",
    title: {
      zh: "Excel + AI 数据分析：从数据到洞察",
      en: "Excel + AI Data Analysis: From Raw Data to Insights",
    },
    summary: {
      zh: "结合 AI 工具，快速完成数据清洗、分析和可视化，让 Excel 处理数据更高效。",
      en: "Combine AI tools with Excel to clean data, analyze trends, and build visualizations faster so you can turn spreadsheets into useful insights.",
    },
    contentMarkdown: {
      zh: `## 1. 先把数据整理干净

AI 可以显著加快分析效率，但前提是表格数据足够干净、字段命名一致、问题定义明确。

## 2. 分清 Excel 和 AI 的分工

先让 Excel 处理结构化工作，比如筛选、透视、公式和清洗；再让 AI 帮你做趋势总结、异常解读和报告草稿。

### Excel 擅长什么

结构化、公式化、可复核的数据处理。

### AI 擅长什么

总结、解释、归纳、生成业务表达。

## 3. 问题要问得具体

把业务问题说清楚，比如“请总结近 4 周订单量变化、异常渠道和建议动作”，比“帮我分析一下”有效得多。

## 4. 关键结论要回到原始数据验证

AI 给出的洞察需要回到原始数据做验证，尤其是涉及业务结论、预算决策和异常判断时，不能直接照搬。

## 5. 建立复用模板

把常用分析问题、输出格式和汇报模板沉淀下来，就能形成团队可复用的数据分析流程。`,
      en: `## 1. Start with clean data

Before asking AI for analysis, make sure column names, date formats, and missing values are consistent.

## 2. Let Excel handle structure

Use Excel for sorting, filtering, formulas, and quick pivots. Let AI help with interpretation, explanation, and pattern finding.

### What Excel is good at

Structured calculations, repeatable cleaning, and traceable transformation.

### What AI is good at

Summaries, explanations, trend framing, and business-friendly wording.

## 3. Ask focused analytical questions

Instead of saying "analyze this table," ask for trends, anomalies, segments, or a concise report summary.

## 4. Validate important conclusions

AI can summarize patterns quickly, but final business decisions should still be checked against the raw numbers.

## 5. Build a repeatable reporting flow

Once you find a prompt and report structure that works, turn it into a reusable template for your team.`,
    },
    learningPoints: {
      zh: ["理解 Excel 与 AI 的分工方式", "提高数据清洗和摘要生成效率", "建立可复用的数据分析提问模板"],
      en: ["Use AI to speed up data cleaning and summary generation", "Combine spreadsheet formulas with AI reasoning effectively", "Turn rough data into clear business insights faster"],
    },
    suitableFor: {
      zh: ["经常处理表格和报表的运营、分析师", "想提高数据汇总效率的业务同学", "需要周报、月报自动化辅助的团队"],
      en: ["Operators and analysts working with repetitive spreadsheets", "Business users who need faster first-pass analysis", "Teams preparing weekly or monthly reports"],
    },
    seoTitle: {
      zh: "Excel + AI 数据分析教程",
      en: "Excel and AI Data Analysis Tutorial",
    },
    seoDescription: {
      zh: "学习如何用 Excel 和 AI 协同完成数据清洗、分析和报告输出。",
      en: "A practical guide to using AI with Excel for cleaning, analysis, and reporting.",
    },
    promptBlock: {
      title: {
        zh: "报表摘要 Prompt",
        en: "Report summary prompt",
      },
      description: {
        zh: "把表格快速整理成业务摘要",
        en: "Turn a table into an executive summary",
      },
      content: {
        zh: "你是一名业务分析师，请根据这份销售表格总结 3 个核心趋势、1 个异常点，以及 2 条后续建议，输出简洁商务风。",
        en: "You are a business analyst. Based on the following sales table, summarize the top 3 trends, the biggest anomaly, and 2 suggested follow-up actions. Keep the output concise and business-friendly.",
      },
    },
    tags: [
      { id: "tag-excel", slug: "excel", name: { zh: "Excel", en: "Excel" } },
      { id: "tag-data-analysis", slug: "data-analysis", name: { zh: "数据分析", en: "Data Analysis" } },
      { id: "tag-office-efficiency", slug: "office-efficiency", name: { zh: "办公效率", en: "Office Efficiency" } },
    ],
    related: ["chatgpt-prompt-beginner", "n8n-workflow-automation", "xiaohongshu-ai-content-guide"],
  },
  {
    id: "tutorial-xiaohongshu-ai-content-guide",
    slug: "xiaohongshu-ai-content-guide",
    categorySlug: "cases",
    difficulty: "beginner",
    readTimeMinutes: 16,
    viewCount: 9800,
    favoriteCount: 512,
    likeCount: 57,
    isBeginner: true,
    coverImage: "/icons/tutorials/cover-xiaohongshu-writing.svg",
    coverIcon: "xiaohongshu",
    title: {
      zh: "小红书 AI 爆款内容创作全攻略",
      en: "The Complete AI Xiaohongshu Content Playbook",
    },
    summary: {
      zh: "从选题、标题、正文到封面图，利用 AI 提升内容创作效率，打造爆款笔记。",
      en: "Use AI to improve topic selection, titles, body copy, and cover ideas so you can produce Xiaohongshu content more efficiently.",
    },
    contentMarkdown: {
      zh: `## 1. 节省时间不只是在写正文

AI 真正节省时间的地方，往往不是直接写正文，而是前面的选题、标题角度和内容结构设计。

## 2. 先定义账号信息

先定义账号人设、受众、语气和内容目标，再让 AI 输出标题、提纲和段落，内容质量会稳定很多。

### 人设和受众

不同账号要的语言风格和信息密度完全不同。

### 标题和提纲

先批量出方向，再筛选，再展开正文。

## 3. 先批量再筛选

建议先批量生成多个标题方向，再筛出最适合的角度继续写正文，最后再做封面文案和开头优化。

## 4. 防止内容太模板化

常见问题是 AI 文案太像模板，缺少真实感。这个时候要补充个人经验、具体场景和真实细节。

## 5. 把内容生产拆成流程

把选题、标题、提纲、正文、封面图这一套流程拆成模板，后续做内容矩阵会轻松很多。`,
      en: `## 1. AI helps before writing starts

The biggest time savings often come from topic research, audience pain points, and title directions, not just body copy generation.

## 2. Keep a clear account voice

Define your account tone, audience, and content format before asking AI to write. Otherwise the output becomes generic.

### Account voice

Different audiences require different rhythm, wording, and density.

### Title and outline

Generate options in batches, then filter and expand.

## 3. Use title batches and angle tests

Generate several title directions, then compare curiosity, clarity, and conversion potential.

## 4. Turn long writing into modular steps

Draft the outline first, then expand sections, then polish transitions, and finally generate cover copy.

## 5. Review with platform judgment

AI can speed up production, but final content still needs human review for authenticity, rhythm, and platform fit.`,
    },
    learningPoints: {
      zh: ["用 AI 提高选题和标题效率", "让内容结构更适合平台阅读习惯", "把内容生产拆成可复用的流程"],
      en: ["Use AI across topic selection, titles, body copy, and cover ideas", "Keep AI outputs aligned with platform tone and audience needs", "Turn content production into a repeatable workflow"],
    },
    suitableFor: {
      zh: ["小红书创作者和内容运营", "内容产能有限的小团队", "希望用 AI 辅助内容创作的品牌方"],
      en: ["Creators and operators publishing on Xiaohongshu", "Small teams with limited content capacity", "Brands testing AI-assisted content workflows"],
    },
    seoTitle: {
      zh: "小红书 AI 内容创作教程",
      en: "AI Xiaohongshu Content Guide",
    },
    seoDescription: {
      zh: "学习如何用 AI 做小红书选题、标题、正文和封面文案，提高内容效率。",
      en: "Learn how to use AI for Xiaohongshu topics, titles, structure, and production workflows.",
    },
    promptBlock: {
      title: {
        zh: "标题批量生成 Prompt",
        en: "Title brainstorming prompt",
      },
      description: {
        zh: "先出多个方向再筛选",
        en: "Generate multiple content angles first",
      },
      content: {
        zh: "你是一名小红书增长编辑，请为“AI 提升办公室效率”这个主题生成 12 个标题，混合实用型、好奇型、情绪型角度，避免标题党。",
        en: "You are a Xiaohongshu growth editor. Generate 12 title options for a post about improving office efficiency with AI. Mix practical, emotional, and curiosity-driven angles. Avoid clickbait.",
      },
    },
    tags: [
      { id: "tag-xiaohongshu", slug: "xiaohongshu", name: { zh: "小红书", en: "Xiaohongshu" } },
      { id: "tag-content-creation", slug: "content-creation", name: { zh: "内容创作", en: "Content Creation" } },
      { id: "tag-operations", slug: "operations", name: { zh: "运营", en: "Operations" } },
    ],
    related: ["chatgpt-prompt-beginner", "midjourney-guide-complete", "excel-ai-data-analysis"],
  },
  {
    id: "tutorial-python-ai-app-practice",
    slug: "python-ai-app-practice",
    categorySlug: "advanced",
    difficulty: "advanced",
    readTimeMinutes: 20,
    viewCount: 8200,
    favoriteCount: 423,
    likeCount: 49,
    isBeginner: false,
    coverImage: "/icons/tutorials/cover-python-ai.svg",
    coverIcon: "python",
    title: {
      zh: "Python + AI 实战：构建智能应用",
      en: "Python + AI Practice: Build Intelligent Applications",
    },
    summary: {
      zh: "使用 Python 结合 OpenAI API，快速构建聊天机器人、文本分析等智能应用。",
      en: "Use Python with the OpenAI API to quickly build chatbots, text analysis tools, and other practical AI-powered applications.",
    },
    contentMarkdown: {
      zh: `## 1. 先聚焦一个使用场景

做 AI 应用时，最重要的不是功能堆砌，而是先选一个足够聚焦的使用场景，比如摘要、分类、抽取或问答。

## 2. 分离 Prompt 和程序逻辑

建议把 Prompt 模板和程序逻辑分离，Python 负责参数校验、调用接口、重试和结构化结果处理。

### Prompt 模板

单独维护，便于持续迭代和对比效果。

### Python 逻辑

负责输入、输出、错误处理、缓存和重试。

## 3. 优先结构化输出

如果后续还要给系统继续消费，就尽量让模型返回结构化 JSON，而不是只返回自然语言段落。

## 4. 早期就要有日志

很多项目早期没有日志和失败记录，后面很难定位问题。哪怕 MVP，也应该先把关键输入输出记下来。

## 5. 先打通闭环再优化

先把完整闭环做通，再逐步优化 Prompt、缓存、延迟和交互体验，不要一开始就过度设计。`,
      en: `## 1. Start with one narrow use case

A good AI app usually begins with one focused task such as summarization, classification, extraction, or question answering.

## 2. Separate prompt logic from application logic

Keep prompts in clear templates and keep Python responsible for input validation, retries, and result handling.

### Prompt templates

Treat them as a layer you can iterate on independently.

### Python logic

Use it for validation, retries, caching, and downstream integration.

## 3. Prefer structured outputs

If the downstream step needs fields, labels, or scores, request structured JSON instead of plain prose.

## 4. Add logging and guardrails early

Record failures, ambiguous inputs, and bad outputs from the start. That makes the system much easier to improve.

## 5. Optimize after the loop works

Get the full request-response loop working first. Then improve prompts, latency, caching, and user experience.`,
    },
    learningPoints: {
      zh: ["理解 AI 应用的最小组成结构", "掌握 Python 连接 Prompt 与 API 的方式", "知道如何从 Demo 走向更稳定的应用形态"],
      en: ["Understand the minimum building blocks of an AI app", "Use Python to connect prompts, APIs, and structured outputs", "Move from prototypes to more reliable application patterns"],
    },
    suitableFor: {
      zh: ["想做 AI 产品原型的开发者", "给内部工具加上 LLM 能力的工程师", "想快速验证创意的独立开发者"],
      en: ["Developers building their first AI-powered product", "Engineers integrating LLM features into internal tools", "Makers validating ideas quickly"],
    },
    seoTitle: {
      zh: "Python + AI 应用实战教程",
      en: "Python AI Application Practice Tutorial",
    },
    seoDescription: {
      zh: "学习如何使用 Python 和 OpenAI API 快速构建实用的 AI 应用。",
      en: "Use Python and the OpenAI API to prototype and structure practical AI applications quickly.",
    },
    promptBlock: {
      title: {
        zh: "结构化抽取 Prompt",
        en: "Structured extraction prompt",
      },
      description: {
        zh: "适合 Python + LLM 流程",
        en: "Useful for Python + LLM pipelines",
      },
      content: {
        zh: "请从以下客户消息中提取姓名、产品、紧急程度和期望动作，只返回合法 JSON。",
        en: "Extract the customer name, product, urgency, and requested action from the message below. Return valid JSON only.",
      },
    },
    tags: [
      { id: "tag-python", slug: "python", name: { zh: "Python", en: "Python" } },
      { id: "tag-ai-api", slug: "ai-api", name: { zh: "AI API", en: "AI API" } },
      { id: "tag-coding", slug: "coding", name: { zh: "编程", en: "Coding" } },
    ],
    related: ["n8n-workflow-automation", "midjourney-guide-complete", "chatgpt-prompt-beginner"],
  },
];

function getTag(locale: Locale, tag: TutorialSeed["tags"][number]): TutorialTag {
  return {
    id: tag.id,
    slug: tag.slug,
    name: tag.name[locale],
  };
}

function getPromptBlock(locale: Locale, tutorial: TutorialSeed): TutorialPromptBlock {
  return {
    id: `${tutorial.slug}-prompt-block`,
    title: tutorial.promptBlock.title[locale],
    description: tutorial.promptBlock.description[locale],
    content: tutorial.promptBlock.content[locale],
    sortOrder: 1,
  };
}

function getPrevNext(locale: Locale, slug: TutorialSlug): {
  prev?: TutorialPrevNextItem | null;
  next?: TutorialPrevNextItem | null;
} {
  const index = tutorialOrder.indexOf(slug);
  const prevSeed = index >= 0 && index + 1 < tutorialOrder.length ? tutorialSeeds.find((item) => item.slug === tutorialOrder[index + 1]) : null;
  const nextSeed = index > 0 ? tutorialSeeds.find((item) => item.slug === tutorialOrder[index - 1]) : null;

  return {
    prev: prevSeed
      ? {
          title: prevSeed.title[locale],
          slug: prevSeed.slug,
        }
      : null,
    next: nextSeed
      ? {
          title: nextSeed.title[locale],
          slug: nextSeed.slug,
        }
      : null,
  };
}

function getRelatedTutorials(locale: Locale, tutorial: TutorialSeed): TutorialRelatedItem[] {
  return tutorial.related
    .map((slug) => tutorialSeeds.find((item) => item.slug === slug))
    .filter((item): item is TutorialSeed => Boolean(item))
    .map((item) => ({
      id: item.id,
      title: item.title[locale],
      slug: item.slug,
      summary: item.summary[locale],
      coverImage: item.coverImage,
      readTimeMinutes: item.readTimeMinutes,
      viewCount: item.viewCount,
    }));
}

function buildTutorialDetail(locale: Locale, tutorial: TutorialSeed): TutorialDetail {
  return {
    id: tutorial.id,
    title: tutorial.title[locale],
    slug: tutorial.slug,
    summary: tutorial.summary[locale],
    contentMarkdown: tutorial.contentMarkdown[locale],
    coverImage: tutorial.coverImage,
    coverIcon: tutorial.coverIcon,
    category: categories[locale][tutorial.categorySlug],
    tags: tutorial.tags.map((tag) => getTag(locale, tag)),
    author: authors[locale],
    difficulty: tutorial.difficulty,
    readTimeMinutes: tutorial.readTimeMinutes,
    viewCount: tutorial.viewCount,
    favoriteCount: tutorial.favoriteCount,
    likeCount: tutorial.likeCount,
    isBeginner: tutorial.isBeginner,
    publishedAt: publishedAtBySlug[tutorial.slug],
    updatedAt: publishedAtBySlug[tutorial.slug],
    learningPoints: tutorial.learningPoints[locale],
    suitableFor: tutorial.suitableFor[locale],
    promptBlocks: [getPromptBlock(locale, tutorial)],
    relatedTutorials: getRelatedTutorials(locale, tutorial),
    prevNext: getPrevNext(locale, tutorial.slug),
    seoTitle: tutorial.seoTitle[locale],
    seoDescription: tutorial.seoDescription[locale],
  };
}

export function getTutorialDetailMockData(slug: string, locale: Locale): TutorialDetail | null {
  const tutorial = tutorialSeeds.find((item) => item.slug === slug);
  if (!tutorial) {
    return null;
  }

  return buildTutorialDetail(locale, tutorial);
}
