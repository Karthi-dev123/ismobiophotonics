import { Prisma, type User } from '@prisma/client';
import { AppError, ConflictError, NotFoundError } from '../../lib/errors';
import { signToken } from '../../lib/jwt';
import { fakePasswordCheck, hashPassword, verifyPassword } from '../../lib/password';
import { prisma } from '../../lib/prisma';
import type { LoginInput, RegisterInput } from './auth.schemas';

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
}

/** The only shape in which a user ever leaves the API (never the password hash). */
export function toPublicUser(user: Pick<User, 'id' | 'fullName' | 'email' | 'createdAt'>): PublicUser {
  return { id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt };
}

const emailTaken = () => new ConflictError('EMAIL_TAKEN', 'An account with this email already exists');

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw emailTaken();

  const passwordHash = await hashPassword(input.password);
  try {
    const user = await prisma.user.create({
      data: { fullName: input.fullName, email: input.email, passwordHash },
    });
    return { user: toPublicUser(user), token: signToken(user.id) };
  } catch (err) {
    // Two concurrent registrations with the same email.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') throw emailTaken();
    throw err;
  }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    await fakePasswordCheck(input.password);
    throw invalidCredentials();
  }
  if (!(await verifyPassword(input.password, user.passwordHash))) throw invalidCredentials();
  return { user: toPublicUser(user), token: signToken(user.id) };
}

export async function logout(jti: string, exp: number) {
  const now = new Date();
  await prisma.$transaction([
    prisma.revokedToken.upsert({
      where: { jti },
      create: { jti, expiresAt: new Date(exp * 1000) },
      update: {},
    }),
    // Housekeeping: entries for tokens that have expired anyway are no longer needed.
    prisma.revokedToken.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  return toPublicUser(user);
}

function invalidCredentials() {
  return new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
}
