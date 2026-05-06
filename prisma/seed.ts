import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  console.log(`✅ Skills + ${courses.length} courses seeded`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());