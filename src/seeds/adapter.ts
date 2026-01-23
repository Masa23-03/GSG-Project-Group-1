import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export function makeMariaAdapter() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;
  if (!host || !user || !password || !database) {
    throw new Error(
      'Missing DB env vars for adapter (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME)',
    );
  }
  return new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
  });
}
