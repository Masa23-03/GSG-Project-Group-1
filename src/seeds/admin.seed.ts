import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as argon2 from 'argon2';
import { parseDbUrl } from 'src/utils/prisma.helper';
import { env } from 'process';

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

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    await prisma.$disconnect();
    return;
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log('Admin already exists');
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await argon2.hash(password);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Admin',
      phoneNumber: '0000000000',
    },
  });

  console.log('Admin user created successfully.');
  await prisma.$disconnect();
}
