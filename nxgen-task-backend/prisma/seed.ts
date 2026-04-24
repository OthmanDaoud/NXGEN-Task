import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/utils/prisma";


async function main() {
  const seedDir = path.dirname(fileURLToPath(import.meta.url));
  const seedFilePath = path.join(seedDir, "seed.sql");
  const sql = fs.readFileSync(seedFilePath, "utf-8");
  await prisma.$executeRawUnsafe(sql);
}

main()
  .then(() => {
    console.log("🌱 Seed completed");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });