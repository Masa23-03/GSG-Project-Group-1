export function normalizeCategoryName(input: string): string {
  const cleaned = input
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
  return cleaned.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());
}
