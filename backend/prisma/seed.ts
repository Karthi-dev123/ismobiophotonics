/* Seeds fake demo data. Idempotent: re-running resets the two demo users' data. */
import { PrismaClient, ProjectStatus, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Password123!';

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function seedUser(fullName: string, email: string, projects: Array<{
  name: string; description: string; status: ProjectStatus; startDate?: string; endDate?: string;
  tasks: Array<{ name: string; priority: TaskPriority; status: TaskStatus; dueDate?: string }>;
}>) {
  await prisma.user.deleteMany({ where: { email } }); // cascades projects & tasks
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      projects: {
        create: projects.map((p) => ({
          name: p.name,
          description: p.description,
          status: p.status,
          startDate: p.startDate ? d(p.startDate) : null,
          endDate: p.endDate ? d(p.endDate) : null,
          tasks: {
            create: p.tasks.map((t) => ({ ...t, dueDate: t.dueDate ? d(t.dueDate) : null })),
          },
        })),
      },
    },
  });
}

async function main() {
  await seedUser('Alice Example', 'alice@example.com', [
    {
      name: 'Website Redesign', description: 'Refresh the marketing site.', status: 'IN_PROGRESS',
      startDate: '2026-09-01', endDate: '2026-12-15',
      tasks: [
        { name: 'Collect requirements', priority: 'HIGH', status: 'COMPLETED', dueDate: '2026-09-10' },
        { name: 'Create wireframes', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '2026-10-20' },
        { name: 'Build landing page', priority: 'HIGH', status: 'PENDING', dueDate: '2026-11-15' },
      ],
    },
    {
      name: 'Mobile Launch', description: 'Ship the first Android release.', status: 'NOT_STARTED',
      tasks: [{ name: 'Set up store listing', priority: 'LOW', status: 'PENDING' }],
    },
    {
      name: 'Q3 Report', description: 'Quarterly summary.', status: 'COMPLETED',
      startDate: '2026-07-01', endDate: '2026-09-30',
      tasks: [{ name: 'Draft report', priority: 'MEDIUM', status: 'COMPLETED', dueDate: '2026-09-25' }],
    },
  ]);
  await seedUser('Bob Example', 'bob@example.com', [
    {
      name: 'Inventory Audit', description: 'Count warehouse stock.', status: 'IN_PROGRESS',
      tasks: [
        { name: 'Print count sheets', priority: 'LOW', status: 'COMPLETED' },
        { name: 'Reconcile totals', priority: 'HIGH', status: 'PENDING', dueDate: '2026-10-31' },
      ],
    },
  ]);
  console.log(`Seeded alice@example.com and bob@example.com (password: ${DEMO_PASSWORD})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
