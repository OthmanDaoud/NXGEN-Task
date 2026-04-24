import { prisma } from "../src/utils/prisma.js";

export async function resetDatabase() {
  await prisma.data.deleteMany();
  await prisma.device.deleteMany();
}

export async function closeDatabase() {
  await prisma.$disconnect();
}
