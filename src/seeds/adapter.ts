import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { parseDbUrl } from 'src/utils/prisma.helper';

export function makeMariaAdapter() {
  const cfg = parseDbUrl(process.env.DATABASE_URL!);
  const host = cfg.host;
  const port = cfg.port;
  const user = cfg.user;
  const password = cfg.password;
  const database = cfg.database;

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
