import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // create categories
  const dev = await prisma.category.upsert({
    where: { name: "Development" },
    update: {},
    create: { name: "Development" },
  });

  const data = await prisma.category.upsert({
    where: { name: "Data" },
    update: {},
    create: { name: "Data" },
  });

  // create skills
  await prisma.skill.createMany({
    data: [
      { name: "JavaScript", categoryId: dev.id },
      { name: "React", categoryId: dev.id },
      { name: "Node.js", categoryId: dev.id },
      { name: "Next.js", categoryId: dev.id },
      { name: "TypeScript", categoryId: dev.id },
      { name: "Python", categoryId: data.id },
      { name: "SQL", categoryId: data.id },
      { name: "Machine Learning", categoryId: data.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Skills seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());