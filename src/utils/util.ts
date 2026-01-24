import { Prisma } from '@prisma/client';
import { adminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';

export function extractId(q?: string): number | null {
  if (!q) return null;
  const m = q.match(/(\d+)/g);
  if (!m) return null;
  const n = Number(m[m.length - 1]);
  return Number.isFinite(n) ? n : null;
}

export function buildAdminBaseWhere(query: adminListQueryDto) {
  const and: Prisma.PharmacyWhereInput[] = [];
  if (query.status) and.push({ verificationStatus: query.status });
  if (query.userStatus) and.push({ user: { status: query.userStatus } });
  const q = query.q?.trim();
  const extractedId = q ? extractId(q) : null;
  return { and, q, extractedId };
}
