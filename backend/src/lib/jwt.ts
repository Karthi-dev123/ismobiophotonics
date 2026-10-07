import { randomUUID } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

const ALGORITHM = 'HS256';

export interface TokenPayload {
  sub: string;
  jti: string;
  exp: number;
}

export function signToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject: userId,
    jwtid: randomUUID(),
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

/** Verifies signature (HS256 only) and expiry. Throws 401 UNAUTHORIZED or TOKEN_EXPIRED. */
export function verifyToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
    if (
      typeof payload !== 'object' ||
      typeof payload.sub !== 'string' ||
      typeof payload.jti !== 'string' ||
      typeof payload.exp !== 'number'
    ) {
      throw new UnauthorizedError('Invalid token');
    }
    return { sub: payload.sub, jti: payload.jti, exp: payload.exp };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
    }
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Invalid token');
  }
}
