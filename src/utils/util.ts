import { Prisma } from '@prisma/client';
import { AdminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';

export function extractId(q?: string): number | null {
  if (!q) return null;
  const m = q.match(/(\d+)/g);
  if (!m) return null;
  const n = Number(m[m.length - 1]);
  return Number.isFinite(n) ? n : null;
}

export function buildAdminBaseWhere(query: AdminListQueryDto) {
  const and: Prisma.PharmacyWhereInput[] = [];

  and.push({ verificationStatus: query.verificationStatus });
  if (query.userStatus) and.push({ user: { status: query.userStatus } });
  const q = query.q?.trim();
  const extractedId = q ? extractId(q) : null;
  return { and, q, extractedId };
}
