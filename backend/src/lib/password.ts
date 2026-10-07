import bcrypt from 'bcrypt';
import { env } from '../config/env';

// Cost 12 in real use; minimal cost in tests to keep the suite fast.
const ROUNDS = env.NODE_ENV === 'test' ? 4 : 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

let dummyHash: Promise<string> | undefined;

/** Burns the same bcrypt work as a real check, so unknown emails can't be detected by timing. */
export async function fakePasswordCheck(plain: string): Promise<void> {
  dummyHash ??= bcrypt.hash('timing-equalizer', ROUNDS);
  await bcrypt.compare(plain, await dummyHash);
}
