/**
 * AppSumo Unified Code Generator & Exporter
 *
 * Requirements for AppSumo CSV Upload:
 * - 1 single CSV file (1,000 to 10,000 purchase-ready codes)
 * - Plain text CSV (.csv)
 * - Exactly 1 column, NO header
 * - Zero duplicates, cryptographically randomized
 * - Between 3-200 characters long
 */

import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getPrisma } from "../packages/db/src";

function generateCode(prefix = "SUMO"): string {
  const p1 = randomBytes(2).toString("hex").toUpperCase();
  const p2 = randomBytes(2).toString("hex").toUpperCase();
  const p3 = randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}-${p1}-${p2}-${p3}`;
}

async function main() {
  const args = process.argv.slice(2);
  const requestedCount = Number.parseInt(args[0], 10) || 3000;
  const dbUrl = process.env.DATABASE_URL;

  console.log(`\n🎟️  Preparing single unified AppSumo CSV file (${requestedCount} codes)...\n`);

  const codeSet = new Set<string>();

  // 1. If database exists, fetch existing active codes first to ensure complete consistency
  if (dbUrl) {
    const prisma = getPrisma(dbUrl);
    try {
      const existing = await prisma.appSumoLicense.findMany({
        where: { status: "ACTIVE" },
        select: { code: true },
      });
      for (const row of existing) {
        codeSet.add(row.code.trim().toUpperCase());
      }
      console.log(`   Found ${codeSet.size} existing active codes in database.`);
    } catch (err) {
      console.warn("   Could not fetch existing DB codes, will generate fresh set.", err);
    } finally {
      await prisma.$disconnect();
    }
  }

  // 2. Generate remaining codes until requestedCount is reached
  while (codeSet.size < requestedCount) {
    codeSet.add(generateCode());
  }

  const allCodes = Array.from(codeSet);

  // 3. Write to single consolidated CSV file: appsumo-codes.csv
  const csvContent = allCodes.join("\n") + "\n";
  const outputFileName = "appsumo-codes.csv";
  const outputPath = resolve(process.cwd(), outputFileName);

  writeFileSync(outputPath, csvContent, "utf-8");

  console.log(`\n✅ SINGLE CSV GENERATED:`);
  console.log(`   📁 File path: ${outputPath}`);
  console.log(`   📊 Total Codes: ${allCodes.length}`);
  console.log(`   📄 Format: Plain text, 1 column, NO header`);
  console.log(`   🔑 First code: ${allCodes[0]}`);
  console.log(`   🔑 Last code:  ${allCodes[allCodes.length - 1]}`);

  // 4. Sync any new codes into the database
  if (dbUrl) {
    console.log("\n📡 Syncing codes to Neon Database (AppSumoLicense table)...");
    const prisma = getPrisma(dbUrl);
    try {
      const batchSize = 250;
      let inserted = 0;

      for (let i = 0; i < allCodes.length; i += batchSize) {
        const batch = allCodes.slice(i, i + batchSize);
        await prisma.appSumoLicense.createMany({
          data: batch.map((c) => ({
            code: c,
            tier: 1, // Base universal code; stacks automatically to Tier 2 and Tier 3 upon redemption
            plan: "NETRUNNER",
            status: "ACTIVE",
          })),
          skipDuplicates: true,
        });
        inserted += batch.length;
        process.stdout.write(
          `   Synced ${Math.min(inserted, allCodes.length)}/${allCodes.length} codes...\r`,
        );
      }
      console.log(
        `\n🎉 All ${allCodes.length} codes in appsumo-codes.csv are active & ready in the database!`,
      );
    } catch (err) {
      console.error("❌ Database sync error:", err);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch(console.error);
