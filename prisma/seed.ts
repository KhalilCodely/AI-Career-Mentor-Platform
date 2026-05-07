import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  icon: string;
  imageUrl: string;
  skills: string[];
};

type CareerPathSeed = {
  title: string;
  category: string;
  level: string;
  weeks: number;
  skills: string[];
  summary: string;
  icon: string;
  imageUrl: string;
};

type CourseSeed = {
  title: string;
  provider: string;
  skill: string;
  url: string;
  icon: string;
  imageUrl: string;
};

const skillIcons: Record<string, string> = {
  AWS: "☁️",
  "CI/CD": "🔁",
  Docker: "🐳",
  "Express.js": "🚂",
  Figma: "🟣",
  Flutter: "💙",
  JavaScript: "🟨",
  Kubernetes: "☸️",
  "Machine Learning": "🤖",
  "Next.js": "▲",
  "Node.js": "🟩",
  Python: "🐍",
  React: "⚛️",
  "React Native": "📱",
  SQL: "🗄️",
  TypeScript: "🔷",
  "Data Analysis": "📊",
  "UI Design": "🎨",
  "UX Design": "🧠",
};

const skillImages: Record<string, string> = {
  AWS: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "CI/CD": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  Docker: "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=80",
  "Express.js": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  Figma: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80",
  Flutter: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  JavaScript: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  Kubernetes: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
  "Machine Learning": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  "Next.js": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "Node.js": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  Python: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
  React: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
  "React Native": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  SQL: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
  TypeScript: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  "Data Analysis": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "UI Design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
  "UX Design": "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80",
};

const categories: CategorySeed[] = [
  { name: "Development", icon: "💻", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", skills: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express.js"] },
  { name: "Data", icon: "📊", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", skills: ["Python", "SQL", "Machine Learning", "Data Analysis"] },
  { name: "DevOps", icon: "🚀", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", skills: ["Docker", "Kubernetes", "AWS", "CI/CD"] },
  { name: "Design", icon: "🎨", imageUrl: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80", skills: ["UI Design", "UX Design", "Figma"] },
  { name: "Mobile", icon: "📱", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80", skills: ["React Native", "Flutter"] },
];

const careerPathSeeds: CareerPathSeed[] = [
  { title: "Frontend Developer", category: "Development", level: "Beginner to Intermediate", weeks: 16, skills: ["JavaScript", "TypeScript", "React", "Next.js", "UI Design"], icon: "🧑‍💻", imageUrl: categories[0].imageUrl, summary: "Build responsive, accessible web interfaces and ship production-ready React and Next.js applications." },
  { title: "Backend Developer", category: "Development", level: "Intermediate", weeks: 18, skills: ["Node.js", "Express.js", "SQL", "Docker", "CI/CD"], icon: "🛠️", imageUrl: skillImages["Node.js"], summary: "Design APIs, model data, secure services, and deploy reliable server-side applications." },
  { title: "Full Stack Developer", category: "Development", level: "Intermediate", weeks: 20, skills: ["TypeScript", "React", "Next.js", "Node.js", "SQL"], icon: "🌐", imageUrl: skillImages.TypeScript, summary: "Connect polished user experiences with robust APIs, databases, authentication, and deployments." },
  { title: "Data Analyst", category: "Data", level: "Beginner", weeks: 14, skills: ["SQL", "Python", "Data Analysis"], icon: "📈", imageUrl: skillImages["Data Analysis"], summary: "Turn raw data into clear business insights using SQL, Python, dashboards, and storytelling." },
  { title: "Data Scientist", category: "Data", level: "Intermediate", weeks: 22, skills: ["Python", "SQL", "Machine Learning", "Data Analysis"], icon: "🧪", imageUrl: skillImages["Machine Learning"], summary: "Build statistical models, evaluate machine learning systems, and communicate data-backed recommendations." },
  { title: "Machine Learning Engineer", category: "Data", level: "Advanced", weeks: 24, skills: ["Python", "Machine Learning", "Docker", "AWS", "CI/CD"], icon: "🤖", imageUrl: skillImages["Machine Learning"], summary: "Productionize ML workflows from experimentation through deployment, monitoring, and iteration." },
  { title: "DevOps Engineer", category: "DevOps", level: "Intermediate", weeks: 20, skills: ["Docker", "Kubernetes", "AWS", "CI/CD"], icon: "⚙️", imageUrl: categories[2].imageUrl, summary: "Automate delivery pipelines, cloud infrastructure, containers, observability, and release processes." },
  { title: "Cloud Engineer", category: "DevOps", level: "Intermediate", weeks: 18, skills: ["AWS", "Docker", "Kubernetes", "CI/CD"], icon: "☁️", imageUrl: skillImages.AWS, summary: "Design secure cloud foundations, deploy workloads, and optimize reliability and cost." },
  { title: "UI Designer", category: "Design", level: "Beginner", weeks: 12, skills: ["UI Design", "Figma", "UX Design"], icon: "🎨", imageUrl: skillImages["UI Design"], summary: "Create visual systems, high-fidelity interfaces, and handoff-ready designs for digital products." },
  { title: "UX Designer", category: "Design", level: "Beginner to Intermediate", weeks: 16, skills: ["UX Design", "UI Design", "Figma", "Data Analysis"], icon: "🧠", imageUrl: skillImages["UX Design"], summary: "Research user needs, map flows, prototype experiences, and validate product decisions." },
  { title: "Product Designer", category: "Design", level: "Intermediate", weeks: 18, skills: ["UX Design", "UI Design", "Figma", "React"], icon: "✨", imageUrl: categories[3].imageUrl, summary: "Blend research, interaction design, visual craft, and product thinking into portfolio-ready case studies." },
  { title: "Mobile App Developer", category: "Mobile", level: "Intermediate", weeks: 18, skills: ["React Native", "Flutter", "TypeScript", "UI Design"], icon: "📲", imageUrl: categories[4].imageUrl, summary: "Build performant cross-platform mobile apps with strong UX, state management, and release basics." },
  { title: "React Native Developer", category: "Mobile", level: "Intermediate", weeks: 16, skills: ["React Native", "React", "TypeScript", "Node.js"], icon: "⚛️", imageUrl: skillImages["React Native"], summary: "Specialize in React Native screens, navigation, native integrations, API usage, and app-store readiness." },
  { title: "QA Automation Engineer", category: "Development", level: "Beginner to Intermediate", weeks: 14, skills: ["JavaScript", "TypeScript", "CI/CD", "Docker"], icon: "✅", imageUrl: skillImages["CI/CD"], summary: "Create automated test suites, quality gates, and bug-prevention workflows for web products." },
  { title: "Cybersecurity Analyst", category: "DevOps", level: "Beginner", weeks: 18, skills: ["AWS", "SQL", "Python", "CI/CD"], icon: "🛡️", imageUrl: skillImages.AWS, summary: "Learn security fundamentals, threat detection, cloud safeguards, and practical incident response habits." },
  { title: "Technical Product Manager", category: "Leadership", level: "Intermediate", weeks: 16, skills: ["Data Analysis", "UX Design", "SQL", "React"], icon: "🧭", imageUrl: skillImages["Data Analysis"], summary: "Translate customer problems into prioritized product bets with metrics, discovery, and delivery rituals." },
  { title: "Solutions Architect", category: "DevOps", level: "Advanced", weeks: 24, skills: ["AWS", "Node.js", "SQL", "Docker", "Kubernetes"], icon: "🏗️", imageUrl: skillImages.Kubernetes, summary: "Design scalable system architectures, make tradeoffs, and communicate implementation plans to teams." },
  { title: "AI Application Developer", category: "Data", level: "Intermediate", weeks: 20, skills: ["Python", "Machine Learning", "Next.js", "Node.js", "TypeScript"], icon: "🧠", imageUrl: skillImages["Machine Learning"], summary: "Build AI-powered product features with strong UX, APIs, evaluation loops, and responsible guardrails." },
  { title: "Database Administrator", category: "Data", level: "Intermediate", weeks: 16, skills: ["SQL", "AWS", "Docker", "Data Analysis"], icon: "🗄️", imageUrl: skillImages.SQL, summary: "Manage schema design, performance tuning, backups, access controls, and operational database health." },
  { title: "Engineering Manager", category: "Leadership", level: "Advanced", weeks: 20, skills: ["CI/CD", "UX Design", "Data Analysis", "Node.js"], icon: "👥", imageUrl: skillImages["CI/CD"], summary: "Grow from senior contributor to people leader with delivery systems, coaching, planning, and metrics." },
];

function course(title: string, provider: string, skill: string, url: string): CourseSeed {
  return {
    title,
    provider,
    skill,
    url,
    icon: skillIcons[skill] || "📘",
    imageUrl: skillImages[skill] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  };
}

const courseSeeds: CourseSeed[] = [
  course("JavaScript Algorithms and Data Structures", "freeCodeCamp", "JavaScript", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/"),
  course("Modern JavaScript", "javascript.info", "JavaScript", "https://javascript.info/"),
  course("TypeScript Handbook", "Microsoft", "TypeScript", "https://www.typescriptlang.org/docs/handbook/intro.html"),
  course("TypeScript for JavaScript Programmers", "Microsoft", "TypeScript", "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html"),
  course("React Foundations", "React", "React", "https://react.dev/learn"),
  course("Advanced React Patterns", "Frontend Masters", "React", "https://frontendmasters.com/courses/advanced-react-patterns/"),
  course("Next.js Learn", "Vercel", "Next.js", "https://nextjs.org/learn"),
  course("Next.js App Router Foundations", "Vercel", "Next.js", "https://nextjs.org/docs/app"),
  course("Node.js API Development", "Node.js", "Node.js", "https://nodejs.org/en/learn"),
  course("Node.js and Express Essentials", "OpenJS", "Node.js", "https://openjsf.org/certification/"),
  course("Express.js REST APIs", "MDN", "Express.js", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs"),
  course("GraphQL API Development", "Apollo", "JavaScript", "https://www.apollographql.com/tutorials/"),
  course("Python for Everybody", "University of Michigan", "Python", "https://www.py4e.com/"),
  course("Scientific Computing with Python", "freeCodeCamp", "Python", "https://www.freecodecamp.org/learn/scientific-computing-with-python/"),
  course("Intro to SQL", "Khan Academy", "SQL", "https://www.khanacademy.org/computing/computer-programming/sql"),
  course("SQL for Data Analysis", "Mode", "SQL", "https://mode.com/sql-tutorial/"),
  course("Machine Learning Specialization", "Coursera", "Machine Learning", "https://www.coursera.org/specializations/machine-learning-introduction"),
  course("Intro to Machine Learning", "Kaggle", "Machine Learning", "https://www.kaggle.com/learn/intro-to-machine-learning"),
  course("Data Analysis with Pandas", "Kaggle", "Data Analysis", "https://www.kaggle.com/learn/pandas"),
  course("Data Visualization", "Kaggle", "Data Analysis", "https://www.kaggle.com/learn/data-visualization"),
  course("Docker Get Started", "Docker", "Docker", "https://docs.docker.com/get-started/"),
  course("Docker for Developers", "Docker", "Docker", "https://docs.docker.com/language/"),
  course("Kubernetes Basics", "Kubernetes", "Kubernetes", "https://kubernetes.io/docs/tutorials/kubernetes-basics/"),
  course("Kubernetes Fundamentals", "Linux Foundation", "Kubernetes", "https://training.linuxfoundation.org/training/kubernetes-fundamentals-lfs258/"),
  course("AWS Cloud Practitioner Essentials", "AWS Skill Builder", "AWS", "https://skillbuilder.aws/learn"),
  course("AWS Cloud Quest", "AWS Skill Builder", "AWS", "https://aws.amazon.com/training/digital/aws-cloud-quest/"),
  course("GitHub Actions Fundamentals", "GitHub Skills", "CI/CD", "https://skills.github.com/"),
  course("Continuous Delivery on Kubernetes", "Coursera", "CI/CD", "https://www.coursera.org/courses?query=ci%2Fcd"),
  course("UI Design Fundamentals", "Google", "UI Design", "https://grow.google/certificates/ux-design/"),
  course("Visual Design Basics", "Coursera", "UI Design", "https://www.coursera.org/courses?query=visual%20design"),
  course("UX Research and Strategy", "Interaction Design Foundation", "UX Design", "https://www.interaction-design.org/courses/user-research-methods-and-best-practices"),
  course("Google UX Design Certificate", "Coursera", "UX Design", "https://www.coursera.org/professional-certificates/google-ux-design"),
  course("Figma Learn", "Figma", "Figma", "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design"),
  course("Figma UI Design Tutorial", "freeCodeCamp", "Figma", "https://www.freecodecamp.org/news/figma-crash-course/"),
  course("React Native Fundamentals", "Meta", "React Native", "https://reactnative.dev/docs/getting-started"),
  course("React Native for Web Developers", "Expo", "React Native", "https://docs.expo.dev/tutorial/introduction/"),
  course("Flutter from Scratch", "Google", "Flutter", "https://docs.flutter.dev/get-started/learn-flutter"),
  course("Flutter Codelabs", "Google", "Flutter", "https://docs.flutter.dev/codelabs"),
];

function assertUniqueSeeds<T>(items: T[], getKey: (item: T) => string, label: string) {
  const seen = new Set<string>();
  const duplicates = items.map(getKey).filter((key) => {
    const normalizedKey = key.trim().toLowerCase();
    if (seen.has(normalizedKey)) return true;
    seen.add(normalizedKey);
    return false;
  });

  if (duplicates.length > 0) {
    throw new Error(`Duplicate ${label} seeds found: ${duplicates.join(", ")}`);
  }
}

function buildCareerRoadmap(path: CareerPathSeed) {
  return {
    title: `${path.title} career path`,
    description: path.summary,
    careerGoal: path.title,
    experienceLevel: path.level,
    icon: path.icon,
    imageUrl: path.imageUrl,
    selectedSkills: path.skills.map((name, index) => ({
      id: `seed-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      level: Math.min(index + 1, 5),
      category: path.category,
      icon: skillIcons[name] || "📘",
    })),
    phases: [
      {
        id: "phase-1",
        title: "Phase 1: Foundations",
        description: `Build the baseline concepts for ${path.title} work and refresh the first tools employers expect.`,
        focus: path.skills.slice(0, 2).join(" + "),
        outcome: "Finish fundamentals, document notes, and complete two small practice exercises.",
        courses: [],
        progress: 0,
      },
      {
        id: "phase-2",
        title: "Phase 2: Role practice",
        description: "Apply the core skill stack through guided projects, code reviews, portfolio drafts, or case-study work.",
        focus: path.skills.slice(2, 4).join(" + ") || path.skills[0],
        outcome: "Ship one realistic role-specific project with clear success criteria.",
        courses: [],
        progress: 0,
      },
      {
        id: "phase-3",
        title: "Phase 3: Portfolio and interviews",
        description: "Package proof of skill, fill remaining gaps, and rehearse practical interview or stakeholder scenarios.",
        focus: path.skills.slice(4).join(" + ") || "Portfolio readiness",
        outcome: "Publish a polished portfolio artifact and a 30-day job-search or promotion plan.",
        courses: [],
        progress: 0,
      },
    ],
    overallProgress: 0,
    generatedAt: new Date().toISOString(),
    aiProvider: "local",
    aiModel: "seeded-career-path-v2",
    aiGenerated: false,
    uses: { profile: false, skills: true, courses: true, progress: false, ai: false },
    weeklyCommitment: path.weeks <= 14 ? "5-7 focused hours per week" : path.weeks <= 18 ? "7-9 focused hours per week" : "8-10 focused hours per week",
    successMetrics: [
      `Complete the ${path.skills[0]} foundation milestone`,
      "Publish one portfolio artifact with a short case-study write-up",
      "Track weekly learning progress and blockers",
    ],
    durationWeeks: path.weeks,
    category: path.category,
    coreSkills: path.skills,
  };
}

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "ai_recommendations",
      "ai_chats",
      "resumes",
      "user_progress",
      "user_career_paths",
      "user_skills",
      "profiles",
      "users",
      "courses",
      "career_paths",
      "skills",
      "categories"
    RESTART IDENTITY CASCADE;
  `);
}

async function main() {
  assertUniqueSeeds(categories.flatMap((category) => category.skills), (skill) => skill, "skill");
  assertUniqueSeeds(courseSeeds, (seed) => seed.title, "course title");
  assertUniqueSeeds(courseSeeds, (seed) => seed.url, "course url");
  assertUniqueSeeds(careerPathSeeds, (seed) => seed.title, "career path title");

  await resetDatabase();

  const skillMap: Record<string, string> = {};

  for (const category of categories) {
    const dbCategory = await prisma.category.create({
      data: { name: category.name },
    });

    for (const skillName of category.skills) {
      const skill = await prisma.skill.create({
        data: {
          name: skillName,
          categoryId: dbCategory.id,
        },
      });

      skillMap[skillName] = skill.id;
    }
  }

  for (const seed of courseSeeds) {
    const skillId = skillMap[seed.skill];

    if (!skillId) {
      throw new Error(`Course seed references an unknown skill: ${seed.title} (${seed.skill})`);
    }

    await prisma.course.create({
      data: {
        title: seed.title,
        provider: seed.provider,
        url: seed.url,
        skillId,
        icon: seed.icon,
        imageUrl: seed.imageUrl,
      },
    });
  }

  for (const seed of careerPathSeeds) {
    await prisma.careerPath.create({
      data: {
        title: seed.title,
        description: seed.summary,
        icon: seed.icon,
        imageUrl: seed.imageUrl,
        roadmap: buildCareerRoadmap(seed),
      },
    });
  }

  console.log(`✅ Reset database and seeded ${categories.length} categories, ${Object.keys(skillMap).length} skills, ${courseSeeds.length} unique courses, and ${careerPathSeeds.length} unique career paths.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
