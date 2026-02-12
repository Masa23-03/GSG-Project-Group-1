import { Medicine } from '@prisma/client';

export function buildMedicineDisplayNameHelper(
  m: Pick<
    Medicine,
    | 'brandName'
    | 'strengthUnit'
    | 'genericName'
    | 'strengthValue'
    | 'dosageForm'
  >,
) {
  const name = m.brandName?.trim() || m.genericName?.trim() || 'Medicine';
  const parts: string[] = [name];
  if (m.strengthValue != null && m.strengthUnit)
    parts.push(`${m.strengthValue.toString()}${m.strengthUnit}`);
  if (m.dosageForm) parts.push(m.dosageForm);

  return parts.join(' ');
}

export function buildMedicinePackInfoHelper(
  q: number,
  packSize?: number | null,
  packUnit?: string | null,
): string | null {
  const quantity = Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
  if (packSize == null || !packUnit?.trim()) return null;
  return `${quantity} Pack (${packSize.toString()} ${packUnit.trim()})`;
}
