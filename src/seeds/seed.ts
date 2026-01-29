import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { seedAdmin } from './admin.seed';
import { env } from 'process';
import { parseDbUrl } from 'src/utils/prisma.helper';

const cfg = parseDbUrl(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: cfg.host,
  port: cfg.port,
  user: cfg.user,
  password: cfg.password,
  database: cfg.database,
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
