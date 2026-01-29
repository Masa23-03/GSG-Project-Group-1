import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { seedAdmin } from './admin.seed';

const adapter = new PrismaMariaDb({
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  connectionLimit: 5,
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
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
