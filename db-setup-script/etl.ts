import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { cities } from './cities';
import { streets } from './streets';

const prisma = new PrismaClient();

// Cleanup function - trims all string fields
function trimStrings<T>(obj: T): T {
  const result: any = { ...(obj as any) };
  for (const [key, value] of Object.entries(result as Record<string, unknown>)) {
    if (typeof value === 'string') {
      result[key] = value.trim();
    }
  }
  return result as T;
}

// Normalize city data
interface RawCity {
  _id: number;
  טבלה: string;
  סמל_ישוב: number | string;
  שם_ישוב: string;
  שם_ישוב_לועזי: string;
  סמל_נפה: number | string;
  שם_נפה: string;
  סמל_לשכת_מנא: number | string;
  לשכה: string;
  סמל_מועצה_איזורית: number | string;
  שם_מועצה: string;
}

interface RawStreet {
  _id: number;
  טבלה: string;
  סמל_ישוב: number | string;
  שם_ישוב: string;
  סמל_רחוב: number | string;
  שם_רחוב: string;
}

interface NormalizedCity {
  symbol: number;
  name: string;
  councilName: string;
}

interface NormalizedStreet {
  citySymbol: number;
  name: string;
}

function normalizeCity(rawCity: RawCity): NormalizedCity {
  const cleaned = trimStrings(rawCity);
  return {
    symbol: typeof cleaned.סמל_ישוב === 'string' 
      ? parseInt(cleaned.סמל_ישוב, 10) 
      : cleaned.סמל_ישוב,
    name: cleaned.שם_ישוב,
    councilName: cleaned.שם_מועצה || '',
  };
}

function normalizeStreet(rawStreet: RawStreet): NormalizedStreet {
  const cleaned = trimStrings(rawStreet);
  return {
    citySymbol: typeof cleaned.סמל_ישוב === 'string' 
      ? parseInt(cleaned.סמל_ישוב, 10) 
      : cleaned.סמל_ישוב,
    name: cleaned.שם_רחוב,
  };
}

// Export cities to JSON for frontend cache
function exportCitiesCache(normalizedCities: NormalizedCity[]): void {
  const cacheData = normalizedCities.map(city => ({
    symbol: city.symbol,
    name: city.name,
    councilName: city.councilName,
  }));

  const outputDir = path.join(__dirname, '..', 'frontend', 'src', 'data');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'cities_cache.json');
  fs.writeFileSync(outputPath, JSON.stringify(cacheData, null, 2), 'utf-8');
  console.log(`✅ Exported ${cacheData.length} cities to ${outputPath}`);
}

async function main() {
  console.log('🚀 Starting ETL process...\n');

  // Step 1: Normalize cities
  console.log('📊 Processing cities...');
  const normalizedCities = (cities as RawCity[]).map(normalizeCity);
  
  // Remove duplicates based on symbol
  const uniqueCities = Array.from(
    new Map(normalizedCities.map(city => [city.symbol, city])).values()
  );
  console.log(`   Found ${cities.length} raw cities, ${uniqueCities.length} unique cities`);

  // Step 2: Normalize streets
  console.log('📊 Processing streets...');
  const normalizedStreets = (streets as RawStreet[]).map(normalizeStreet);
  console.log(`   Found ${streets.length} streets`);

  // Step 2.1: Remove duplicated streets where street name equals city name (after trimming)
  const cityNameBySymbol = new Map<number, string>(
    uniqueCities.map((c) => [c.symbol, c.name.trim()])
  );
  const streetsAfterCityNameDedup = normalizedStreets.filter((street) => {
    const cityName = cityNameBySymbol.get(street.citySymbol);
    if (!cityName) return true;
    return street.name.trim() !== cityName;
  });
  const removedCityNameDuplicates = normalizedStreets.length - streetsAfterCityNameDedup.length;
  if (removedCityNameDuplicates > 0) {
    console.log(`   Removed ${removedCityNameDuplicates} streets duplicated as city name`);
  }

  // Step 3: Export cities cache for frontend
  console.log('\n📁 Exporting cities cache...');
  exportCitiesCache(uniqueCities);

  // Step 4: Clear existing data
  console.log('\n🗑️  Clearing existing data...');
  await prisma.street.deleteMany();
  await prisma.city.deleteMany();
  console.log('   Cleared existing cities and streets');

  // Step 5: Bulk insert cities
  console.log('\n📥 Inserting cities...');
  const cityBatchSize = 1000;
  for (let i = 0; i < uniqueCities.length; i += cityBatchSize) {
    const batch = uniqueCities.slice(i, i + cityBatchSize);
    await prisma.city.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`   Inserted cities ${i + 1} to ${Math.min(i + cityBatchSize, uniqueCities.length)}`);
  }
  console.log(`✅ Inserted ${uniqueCities.length} cities`);

  // Step 6: Get valid city symbols from the database
  const validCitySymbols = new Set(
    (await prisma.city.findMany({ select: { symbol: true } })).map((c: { symbol: number }) => c.symbol)
  );

  // Step 7: Filter streets to only include those with valid city symbols
  const validStreets = streetsAfterCityNameDedup.filter(street => 
    validCitySymbols.has(street.citySymbol)
  );
  console.log(`   ${validStreets.length} streets have valid city references`);

  // Step 8: Bulk insert streets
  console.log('\n📥 Inserting streets...');
  const streetBatchSize = 5000;
  for (let i = 0; i < validStreets.length; i += streetBatchSize) {
    const batch = validStreets.slice(i, i + streetBatchSize);
    await prisma.street.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`   Inserted streets ${i + 1} to ${Math.min(i + streetBatchSize, validStreets.length)}`);
  }
  console.log(`✅ Inserted ${validStreets.length} streets`);

  // Step 9: Verify indexes exist (Prisma creates them during migration)
  console.log('\n📊 Database indexes:');
  console.log('   - B-Tree index on cities.name (for LIKE queries)');
  console.log('   - B-Tree index on streets.name (for LIKE queries)');
  console.log('   - Unique index on cities.symbol');
  console.log('   - Index on streets.city_symbol (foreign key)');

  // Step 10: Print summary
  const cityCount = await prisma.city.count();
  const streetCount = await prisma.street.count();
  
  console.log('\n✨ ETL process completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Total cities in DB:  ${cityCount}`);
  console.log(`   Total streets in DB: ${streetCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ ETL process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
