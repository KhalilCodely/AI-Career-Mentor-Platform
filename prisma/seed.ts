import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const data = [
    {
      name: "Development",
      skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "Express.js",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "REST API",
        "GraphQL",
        "Redux",
      ],
    },
    {
      name: "Data",
      skills: [
        "Python",
        "SQL",
        "PostgreSQL",
        "MongoDB",
        "Machine Learning",
        "Data Analysis",
        "Pandas",
        "NumPy",
        "Data Visualization",
        "Power BI",
      ],
    },
    {
      name: "DevOps",
      skills: [
        "Docker",
        "Kubernetes",
        "CI/CD",
        "GitHub Actions",
        "AWS",
        "Linux",
        "Nginx",
        "Terraform",
      ],
    },
    {
      name: "Design",
      skills: [
        "UI Design",
        "UX Design",
        "Figma",
        "Adobe XD",
        "Wireframing",
        "Prototyping",
      ],
    },
    {
      name: "Mobile",
      skills: [
        "React Native",
        "Flutter",
        "Swift",
        "Kotlin",
      ],
    },
  ];

  for (const category of data) {
    // ✅ create or get category
    const dbCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });

    // ✅ create skills
    for (const skillName of category.skills) {
      await prisma.skill.upsert({
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
    }
  }

  console.log("✅ 40+ skills seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ SEED ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
