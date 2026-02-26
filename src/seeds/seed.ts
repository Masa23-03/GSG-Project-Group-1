import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './admin.seed';
import { makeMariaAdapter } from './adapter';
import { seedInventory } from './inventory.seed';
import { seedCities } from './city.seed';

async function main() {
  const prisma = new PrismaClient({ adapter: makeMariaAdapter() });

  //seed admin user
  try {
    console.log('Seeding admin user...');
    await seedAdmin(prisma);
    console.log('Seeding cities...');
    await seedCities(prisma);
    console.log('Seeding categories...');
    await prisma.category.createMany({
      data: [
        { name: 'Pain Relief' },
        { name: 'Antibiotics' },
        { name: 'Vitamins' },

        { name: 'Allergy & Cold' },
        { name: 'Cough & Flu' },
        { name: 'Gastrointestinal' },
        { name: 'Diabetes' },
        { name: 'Cardiovascular' },
        { name: 'Dermatology' },
        { name: 'Eye Care' },
        { name: 'Respiratory' },
        { name: 'Hormones' },
        { name: 'Antifungal' },
        { name: 'Antacid & Ulcer' },
        { name: 'Supplements & Minerals' },
      ],
      skipDuplicates: true,
    });

    console.log('Seeding inventory...');
    await seedInventory(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
