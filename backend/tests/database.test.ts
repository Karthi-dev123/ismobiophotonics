import { Prisma } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma, resetDb } from './helpers/db';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

async function createUser(email = 'alice@example.com') {
  return prisma.user.create({ data: { fullName: 'Alice Example', email, passwordHash: 'hash' } });
}

function prismaCode(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined;
}

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('database schema', () => {
  it('applies defaults for project and task', async () => {
    const user = await createUser();
    const project = await prisma.project.create({ data: { userId: user.id, name: 'P' } });
    const task = await prisma.task.create({ data: { projectId: project.id, name: 'T' } });
    expect(project.status).toBe('NOT_STARTED');
    expect(project.createdAt).toBeInstanceOf(Date);
    expect(task.status).toBe('PENDING');
    expect(task.priority).toBe('MEDIUM');
    expect(project.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('enforces unique email', async () => {
    await createUser();
    const err = await createUser().catch((e) => e);
    expect(prismaCode(err)).toBe('P2002');
  });

  it('rejects a task for a nonexistent project (FK)', async () => {
    const err = await prisma.task.create({ data: { projectId: MISSING_ID, name: 'T' } }).catch((e) => e);
    expect(prismaCode(err)).toBe('P2003');
  });

  it('rejects a project for a nonexistent user (FK)', async () => {
    const err = await prisma.project.create({ data: { userId: MISSING_ID, name: 'P' } }).catch((e) => e);
    expect(prismaCode(err)).toBe('P2003');
  });

  it('rejects end date before start date (CHECK)', async () => {
    const user = await createUser();
    const err = await prisma.project
      .create({
        data: { userId: user.id, name: 'P', startDate: new Date('2026-05-10'), endDate: new Date('2026-05-01') },
      })
      .catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(String(err.message)).toMatch(/projects_end_after_start_chk|check constraint/i);
  });

  it('allows equal start and end dates', async () => {
    const user = await createUser();
    const p = await prisma.project.create({
      data: { userId: user.id, name: 'P', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-01') },
    });
    expect(p.endDate).toEqual(p.startDate);
  });

  it('rejects names longer than 150 chars', async () => {
    const user = await createUser();
    const err = await prisma.project.create({ data: { userId: user.id, name: 'x'.repeat(151) } }).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    await expect(prisma.project.create({ data: { userId: user.id, name: 'x'.repeat(150) } })).resolves.toBeTruthy();
  });

  it('rejects invalid enum values at DB level (parameterized raw insert)', async () => {
    const user = await createUser();
    const bogus = 'DONE';
    await expect(
      prisma.$executeRaw`INSERT INTO projects (id, user_id, name, status, updated_at)
        VALUES (gen_random_uuid(), ${user.id}::uuid, 'P', ${bogus}::project_status, now())`,
    ).rejects.toThrow();
  });

  it('cascades project delete to its tasks', async () => {
    const user = await createUser();
    const project = await prisma.project.create({
      data: { userId: user.id, name: 'P', tasks: { create: [{ name: 'T1' }, { name: 'T2' }] } },
    });
    await prisma.project.delete({ where: { id: project.id } });
    expect(await prisma.task.count()).toBe(0);
  });

  it('cascades user delete to projects and tasks', async () => {
    const user = await createUser();
    await prisma.project.create({ data: { userId: user.id, name: 'P', tasks: { create: [{ name: 'T' }] } } });
    await prisma.user.delete({ where: { id: user.id } });
    expect(await prisma.project.count()).toBe(0);
    expect(await prisma.task.count()).toBe(0);
  });

  it('keeps users\' data separate in owner-scoped queries', async () => {
    const alice = await createUser('alice@example.com');
    const bob = await createUser('bob@example.com');
    await prisma.project.create({ data: { userId: alice.id, name: 'Alice P', tasks: { create: [{ name: 'A' }] } } });
    expect(await prisma.project.count({ where: { userId: bob.id } })).toBe(0);
    expect(await prisma.task.count({ where: { project: { userId: bob.id } } })).toBe(0);
  });

  it('round-trips unicode text and date-only values', async () => {
    const user = await createUser();
    const project = await prisma.project.create({ data: { userId: user.id, name: 'Projet — 日本語 🚀' } });
    const task = await prisma.task.create({
      data: { projectId: project.id, name: 'Tâche ✓', dueDate: new Date('2026-02-28') },
    });
    const reloaded = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(project.name).toBe('Projet — 日本語 🚀');
    expect(reloaded.name).toBe('Tâche ✓');
    expect(reloaded.dueDate?.toISOString().slice(0, 10)).toBe('2026-02-28');
  });

  it('handles batch inserts', async () => {
    const user = await createUser();
    const project = await prisma.project.create({ data: { userId: user.id, name: 'Big' } });
    await prisma.task.createMany({
      data: Array.from({ length: 500 }, (_, i) => ({
        projectId: project.id,
        name: `Task ${i}`,
        status: i % 2 === 0 ? ('COMPLETED' as const) : ('PENDING' as const),
      })),
    });
    expect(await prisma.task.count({ where: { project: { userId: user.id }, status: 'COMPLETED' } })).toBe(250);
  });
});
