import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import * as argon2 from 'argon2';

export async function seedAdmin(prisma: PrismaClient) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');

    return;
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log('Admin already exists');
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
}
