export function normalizeCategoryName(input: string): string {
  const cleaned = input.trim().replace(/\s+/g, ' ');
  const lower = cleaned.toLowerCase();
  return lower.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}
