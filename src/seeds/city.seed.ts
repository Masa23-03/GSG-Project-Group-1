import { PrismaClient } from '@prisma/client';
import { normalizeCategoryOrCityName } from 'src/modules/category/util/category-normalize.util';

const CITY_NAMES = [
  'Al Nusirat',
  'Deir al-Balah',
  'Gaza',
  'Khan Yunis',
  'Middle',
  'Abu Dis',
  "Bani Na'im",
  'Beit Hanoun',
  'Beit Jala',
  'Beit Lahia',
  'Beit Sahour',
  'Beitunia',
  'Bethlehem',
  'al Bireh',
  'Dura',
  'Halhul',
  'Hebron',
  'Jabalia',
  'Jenin',
  'Jericho',
  'Jerusalem',
  'Nablus',
  'Qabatiya',
  'Qalqilya',
  'Rafah',
  'Ramallah',
  'Tubas',
  'Tulkarm',
  'Yatta',
];
export async function seedCities(prisma: PrismaClient) {
  const unique = Array.from(new Set(CITY_NAMES));
  await prisma.city.createMany({
    data: unique.map((name) => ({
      name: normalizeCategoryOrCityName(name),
    })),
    skipDuplicates: true,
  });
}
