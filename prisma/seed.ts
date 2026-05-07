import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const careerPathSeeds = [
  { title: "Frontend Developer", category: "Development", level: "Beginner to Intermediate", weeks: 16, skills: ["JavaScript", "TypeScript", "React", "Next.js", "UI Design"], summary: "Build responsive, accessible web interfaces and ship production-ready React and Next.js applications." },
  { title: "Backend Developer", category: "Development", level: "Intermediate", weeks: 18, skills: ["Node.js", "Express.js", "SQL", "Docker", "CI/CD"], summary: "Design APIs, model data, secure services, and deploy reliable server-side applications." },
  { title: "Full Stack Developer", category: "Development", level: "Intermediate", weeks: 20, skills: ["TypeScript", "React", "Next.js", "Node.js", "SQL"], summary: "Connect polished user experiences with robust APIs, databases, authentication, and deployments." },
  { title: "Data Analyst", category: "Data", level: "Beginner", weeks: 14, skills: ["SQL", "Python", "Data Analysis"], summary: "Turn raw data into clear business insights using SQL, Python, dashboards, and storytelling." },
  { title: "Data Scientist", category: "Data", level: "Intermediate", weeks: 22, skills: ["Python", "SQL", "Machine Learning", "Data Analysis"], summary: "Build statistical models, evaluate machine learning systems, and communicate data-backed recommendations." },
  { title: "Machine Learning Engineer", category: "Data", level: "Advanced", weeks: 24, skills: ["Python", "Machine Learning", "Docker", "AWS", "CI/CD"], summary: "Productionize ML workflows from experimentation through deployment, monitoring, and iteration." },
  { title: "DevOps Engineer", category: "DevOps", level: "Intermediate", weeks: 20, skills: ["Docker", "Kubernetes", "AWS", "CI/CD"], summary: "Automate delivery pipelines, cloud infrastructure, containers, observability, and release processes." },
  { title: "Cloud Engineer", category: "DevOps", level: "Intermediate", weeks: 18, skills: ["AWS", "Docker", "Kubernetes", "CI/CD"], summary: "Design secure cloud foundations, deploy workloads, and optimize reliability and cost." },
  { title: "UI Designer", category: "Design", level: "Beginner", weeks: 12, skills: ["UI Design", "Figma", "UX Design"], summary: "Create visual systems, high-fidelity interfaces, and handoff-ready designs for digital products." },
  { title: "UX Designer", category: "Design", level: "Beginner to Intermediate", weeks: 16, skills: ["UX Design", "UI Design", "Figma", "Data Analysis"], summary: "Research user needs, map flows, prototype experiences, and validate product decisions." },
  { title: "Product Designer", category: "Design", level: "Intermediate", weeks: 18, skills: ["UX Design", "UI Design", "Figma", "React"], summary: "Blend research, interaction design, visual craft, and product thinking into portfolio-ready case studies." },
  { title: "Mobile App Developer", category: "Mobile", level: "Intermediate", weeks: 18, skills: ["React Native", "Flutter", "TypeScript", "UI Design"], summary: "Build performant cross-platform mobile apps with strong UX, state management, and release basics." },
  { title: "React Native Developer", category: "Mobile", level: "Intermediate", weeks: 16, skills: ["React Native", "React", "TypeScript", "Node.js"], summary: "Specialize in React Native screens, navigation, native integrations, API usage, and app-store readiness." },
  { title: "QA Automation Engineer", category: "Development", level: "Beginner to Intermediate", weeks: 14, skills: ["JavaScript", "TypeScript", "CI/CD", "Docker"], summary: "Create automated test suites, quality gates, and bug-prevention workflows for web products." },
  { title: "Cybersecurity Analyst", category: "DevOps", level: "Beginner", weeks: 18, skills: ["AWS", "SQL", "Python", "CI/CD"], summary: "Learn security fundamentals, threat detection, cloud safeguards, and practical incident response habits." },
  { title: "Technical Product Manager", category: "Leadership", level: "Intermediate", weeks: 16, skills: ["Data Analysis", "UX Design", "SQL", "React"], summary: "Translate customer problems into prioritized product bets with metrics, discovery, and delivery rituals." },
  { title: "Solutions Architect", category: "DevOps", level: "Advanced", weeks: 24, skills: ["AWS", "Node.js", "SQL", "Docker", "Kubernetes"], summary: "Design scalable system architectures, make tradeoffs, and communicate implementation plans to teams." },
  { title: "AI Application Developer", category: "Data", level: "Intermediate", weeks: 20, skills: ["Python", "Machine Learning", "Next.js", "Node.js", "TypeScript"], summary: "Build AI-powered product features with strong UX, APIs, evaluation loops, and responsible guardrails." },
  { title: "Database Administrator", category: "Data", level: "Intermediate", weeks: 16, skills: ["SQL", "AWS", "Docker", "Data Analysis"], summary: "Manage schema design, performance tuning, backups, access controls, and operational database health." },
  { title: "Engineering Manager", category: "Leadership", level: "Advanced", weeks: 20, skills: ["CI/CD", "UX Design", "Data Analysis", "Node.js"], summary: "Grow from senior contributor to people leader with delivery systems, coaching, planning, and metrics." },
];

function buildCareerRoadmap(path: typeof careerPathSeeds[number]) {
  return {
    title: `${path.title} career path`,
    description: path.summary,
    careerGoal: path.title,
    experienceLevel: path.level,
    selectedSkills: path.skills.map((name, index) => ({ id: `seed-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, level: Math.min(index + 1, 5), category: path.category })),
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
    aiModel: "seeded-career-path-v1",
    aiGenerated: false,
    uses: { profile: false, skills: true, courses: false, progress: false, ai: false },
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


async function main() {
  const data = [
    {
      name: "Development",
      skills: ["JavaScript","TypeScript","React","Next.js","Node.js","Express.js"],
    },
    {
      name: "Data",
      skills: ["Python","SQL","Machine Learning","Data Analysis"],
    },
    {
      name: "DevOps",
      skills: ["Docker","Kubernetes","AWS","CI/CD"],
    },
    {
      name: "Design",
      skills: ["UI Design","UX Design","Figma"],
    },
    {
      name: "Mobile",
      skills: ["React Native","Flutter"],
    },
  ];

  const skillMap: Record<string, string> = {};

  // ✅ Categories + Skills
  for (const category of data) {
    const dbCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });

    for (const skillName of category.skills) {
      const skill = await prisma.skill.upsert({
        where: {
          name_categoryId: {
            name: skillName,
            categoryId: dbCategory.id,
          },
        },
        update: {},
        create: {
          name: skillName,
          categoryId: dbCategory.id,
        },
      });

      skillMap[skillName] = skill.id;
    }
  }

  // ✅ COURSES
  const courses = [
    // Development
    { title: "JavaScript Mastery", provider: "Udemy", skill: "JavaScript", url: "https://www.udemy.com/topic/javascript/" },
    { title: "Modern JavaScript Fundamentals", provider: "freeCodeCamp", skill: "JavaScript", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/" },
    { title: "TypeScript Bootcamp", provider: "Udemy", skill: "TypeScript", url: "https://www.udemy.com/topic/typescript/" },
    { title: "TypeScript for Beginners", provider: "Microsoft Learn", skill: "TypeScript", url: "https://learn.microsoft.com/en-us/training/paths/build-javascript-applications-typescript/" },
    { title: "React Complete Guide", provider: "Coursera", skill: "React", url: "https://www.coursera.org/courses?query=react" },
    { title: "Advanced React Patterns", provider: "Frontend Masters", skill: "React", url: "https://frontendmasters.com/courses/advanced-react-patterns/" },
    { title: "Next.js Fullstack", provider: "Vercel", skill: "Next.js", url: "https://nextjs.org/learn" },
    { title: "Next.js App Router Foundations", provider: "Vercel", skill: "Next.js", url: "https://nextjs.org/docs/app" },
    { title: "Node.js API Development", provider: "Coursera", skill: "Node.js", url: "https://www.coursera.org/courses?query=node%20js" },
    { title: "Node.js and Express Essentials", provider: "OpenJS", skill: "Node.js", url: "https://openjsf.org/certification/" },
    { title: "Express.js REST APIs", provider: "MDN", skill: "Express.js", url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs" },
    { title: "GraphQL API Development", provider: "Apollo", skill: "JavaScript", url: "https://www.apollographql.com/tutorials/" },

    // Data
    { title: "Python for Data Science", provider: "Coursera", skill: "Python", url: "https://www.coursera.org/courses?query=python%20data%20science" },
    { title: "Python Fundamentals", provider: "freeCodeCamp", skill: "Python", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/" },
    { title: "SQL Zero to Hero", provider: "Khan Academy", skill: "SQL", url: "https://www.khanacademy.org/computing/computer-programming/sql" },
    { title: "SQL for Data Analysis", provider: "Mode", skill: "SQL", url: "https://mode.com/sql-tutorial/" },
    { title: "Machine Learning A-Z", provider: "Coursera", skill: "Machine Learning", url: "https://www.coursera.org/learn/machine-learning" },
    { title: "Intro to Machine Learning", provider: "Kaggle", skill: "Machine Learning", url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
    { title: "Data Analysis with Pandas", provider: "Kaggle", skill: "Data Analysis", url: "https://www.kaggle.com/learn/pandas" },
    { title: "Data Visualization Basics", provider: "Coursera", skill: "Data Analysis", url: "https://www.coursera.org/courses?query=data%20visualization" },

    // DevOps
    { title: "Docker Essentials", provider: "Docker", skill: "Docker", url: "https://docs.docker.com/get-started/" },
    { title: "Docker for Developers", provider: "Udemy", skill: "Docker", url: "https://www.udemy.com/topic/docker/" },
    { title: "Kubernetes Basics", provider: "Kubernetes", skill: "Kubernetes", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
    { title: "Kubernetes Application Developer", provider: "Linux Foundation", skill: "Kubernetes", url: "https://training.linuxfoundation.org/training/kubernetes-fundamentals-lfs258/" },
    { title: "AWS Cloud Practitioner Essentials", provider: "AWS Skill Builder", skill: "AWS", url: "https://skillbuilder.aws/learn" },
    { title: "AWS Cloud Quest", provider: "AWS Skill Builder", skill: "AWS", url: "https://aws.amazon.com/training/digital/aws-cloud-quest/" },
    { title: "CI/CD Pipeline Fundamentals", provider: "GitHub Skills", skill: "CI/CD", url: "https://skills.github.com/" },
    { title: "Continuous Delivery on Kubernetes", provider: "Coursera", skill: "CI/CD", url: "https://www.coursera.org/courses?query=ci%2Fcd" },

    // Design
    { title: "UI Design Fundamentals", provider: "Coursera", skill: "UI Design", url: "https://www.coursera.org/courses?query=ui%20design" },
    { title: "Visual Design Basics", provider: "Google", skill: "UI Design", url: "https://grow.google/certificates/ux-design/" },
    { title: "UX Research and Strategy", provider: "Udemy", skill: "UX Design", url: "https://www.udemy.com/topic/user-experience-design/" },
    { title: "Google UX Design Certificate", provider: "Coursera", skill: "UX Design", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
    { title: "Figma Masterclass", provider: "Figma Learn", skill: "Figma", url: "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design" },
    { title: "Figma for Beginners", provider: "freeCodeCamp", skill: "Figma", url: "https://www.freecodecamp.org/news/figma-crash-course/" },

    // Mobile
    { title: "React Native Basics", provider: "Meta", skill: "React Native", url: "https://reactnative.dev/docs/getting-started" },
    { title: "React Native Mobile Apps", provider: "Coursera", skill: "React Native", url: "https://www.coursera.org/courses?query=react%20native" },
    { title: "Flutter from Scratch", provider: "Google", skill: "Flutter", url: "https://docs.flutter.dev/get-started/learn-flutter" },
    { title: "Flutter & Dart Complete Guide", provider: "Udemy", skill: "Flutter", url: "https://www.udemy.com/topic/flutter/" },
  ];

  for (const course of courses) {
    if (!skillMap[course.skill]) {
      console.warn(`Skipping course because skill was not found: ${course.title} (${course.skill})`);
      continue;
    }

    const existingCourse = await prisma.course.findFirst({
      where: { title: course.title },
      select: { id: true },
    });

    if (existingCourse) {
      await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          provider: course.provider,
          url: course.url,
          skillId: skillMap[course.skill],
        },
      });
    } else {
      await prisma.course.create({
        data: {
          title: course.title,
          provider: course.provider,
          url: course.url,
          skillId: skillMap[course.skill],
        },
      });
    }
  }

  // ✅ CAREER PATHS
  for (const careerPath of careerPathSeeds) {
    const roadmap = buildCareerRoadmap(careerPath);

    await prisma.careerPath.upsert({
      where: { title: careerPath.title },
      update: {
        description: careerPath.summary,
        roadmap,
      },
      create: {
        title: careerPath.title,
        description: careerPath.summary,
        roadmap,
      },
    });
  }

  console.log(`✅ Skills + ${courses.length} courses + ${careerPathSeeds.length} career paths seeded`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());