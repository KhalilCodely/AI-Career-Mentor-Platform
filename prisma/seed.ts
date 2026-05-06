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

  // ✅ COURSES (20)
  const courses = [
    // Development
    { title: "JavaScript Mastery", provider: "Udemy", skill: "JavaScript", icon: "🟨", url: "#" },
    { title: "TypeScript Bootcamp", provider: "Udemy", skill: "TypeScript", icon: "🔷", url: "#" },
    { title: "React Complete Guide", provider: "Coursera", skill: "React", icon: "⚛️", url: "#" },
    { title: "Next.js Fullstack", provider: "Udemy", skill: "Next.js", icon: "▲", url: "#" },
    { title: "Node.js API Dev", provider: "Coursera", skill: "Node.js", icon: "🟩", url: "#" },

    // Data
    { title: "Python for Data Science", provider: "Coursera", skill: "Python", icon: "🐍", url: "#" },
    { title: "SQL Zero to Hero", provider: "Udemy", skill: "SQL", icon: "🗄️", url: "#" },
    { title: "Machine Learning A-Z", provider: "Udemy", skill: "Machine Learning", icon: "🤖", url: "#" },
    { title: "Data Analysis with Pandas", provider: "Coursera", skill: "Data Analysis", icon: "📊", url: "#" },

    // DevOps
    { title: "Docker Essentials", provider: "Udemy", skill: "Docker", icon: "🐳", url: "#" },
    { title: "Kubernetes Basics", provider: "Coursera", skill: "Kubernetes", icon: "☸️", url: "#" },
    { title: "AWS Cloud Practitioner", provider: "AWS", skill: "AWS", icon: "☁️", url: "#" },
    { title: "CI/CD Pipeline", provider: "Udemy", skill: "CI/CD", icon: "🔄", url: "#" },

    // Design
    { title: "UI Design Fundamentals", provider: "Coursera", skill: "UI Design", icon: "🎨", url: "#" },
    { title: "UX Research", provider: "Udemy", skill: "UX Design", icon: "🧠", url: "#" },
    { title: "Figma Masterclass", provider: "Udemy", skill: "Figma", icon: "🟣", url: "#" },

    // Mobile
    { title: "React Native Basics", provider: "Udemy", skill: "React Native", icon: "📱", url: "#" },
    { title: "Flutter from Scratch", provider: "Coursera", skill: "Flutter", icon: "💙", url: "#" },

    // Extra
    { title: "GraphQL API Dev", provider: "Udemy", skill: "JavaScript", icon: "🔺", url: "#" },
    { title: "Advanced React Patterns", provider: "Frontend Masters", skill: "React", icon: "⚛️", url: "#" },
  ];

  for (const course of courses) {
    await prisma.course.create({
      data: {
        title: course.title,
        provider: course.provider,
        url: course.url,
        icon: course.icon,
        skillId: skillMap[course.skill],
      },
    });
  }

  console.log("✅ Skills + 20 courses seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());