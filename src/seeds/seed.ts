import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { seedAdmin } from './admin.seed';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true
});
const prisma = new PrismaClient({ adapter });
async function main() {
  //seed admin user
  console.log('Seeding admin user...');
  await seedAdmin();
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }).finally(async () => {
    await prisma.$disconnect();
  });

