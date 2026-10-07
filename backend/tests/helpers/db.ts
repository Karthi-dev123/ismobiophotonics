import { prisma } from '../../src/lib/prisma';

/** Removes all rows. Order-independent thanks to CASCADE. */
export async function resetDb() {
  await prisma.$executeRaw`TRUNCATE TABLE "tasks", "projects", "users", "revoked_tokens" RESTART IDENTITY CASCADE`;
}

export { prisma };
