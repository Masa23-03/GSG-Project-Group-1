import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './admin.seed';
import { makeMariaAdapter } from './adapter';

async function main() {
  const prisma = new PrismaClient({ adapter: makeMariaAdapter() });

  //seed admin user
  try {
    console.log('Seeding admin user...');
    await seedAdmin(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
