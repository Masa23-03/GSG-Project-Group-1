import { Prisma } from '@prisma/client';
import { UpdateMyUserBaseDto } from 'src/modules/user/dto/request.dto/profile.dto';
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
  if (query.verificationStatus) {
    and.push({ verificationStatus: query.verificationStatus });
  }
  if (query.userStatus) and.push({ user: { status: query.userStatus } });
  const q = query.q?.trim();
  const extractedId = q ? extractId(q) : null;
  return { and, q, extractedId };
}

export function mapBaseUserForProfileUpdate(payload: UpdateMyUserBaseDto) {
  const userData: any = {};
  if (payload.name !== undefined) userData.name = payload.name;
  if (payload.phoneNumber !== undefined)
    userData.phoneNumber = payload.phoneNumber;
  if (payload.profileImageUrl !== undefined)
    userData.profileImageUrl = payload.profileImageUrl;
  if (Object.keys(userData).length > 0) return userData;
}
