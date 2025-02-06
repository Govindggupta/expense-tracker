//    node --loader ts-node/esm prisma/seed.ts for making this categories.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const predefinedCategories = [
    { name: 'Food' },
    { name: 'Transport' },
    { name: 'Utilities' },
    { name: 'Entertainment' },
    { name: 'Healthcare' },
    // Add more predefined categories as needed
  ];

  for (const category of predefinedCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Predefined categories have been added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
