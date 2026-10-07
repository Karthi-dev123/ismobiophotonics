import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../lib/errors';
import { verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

/** Requires a valid, unexpired, non-revoked Bearer token for an existing user; sets req.user. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const match = header?.match(/^Bearer ([^\s]+)$/);
    if (!match) throw new UnauthorizedError('Authentication required');

    const payload = verifyToken(match[1]);

    const [revoked, user] = await Promise.all([
      prisma.revokedToken.findUnique({ where: { jti: payload.jti }, select: { jti: true } }),
      prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true } }),
    ]);
    if (revoked || !user) throw new UnauthorizedError('Invalid token');

    req.user = { id: user.id, jti: payload.jti, exp: payload.exp };
    next();
  } catch (err) {
    next(err);
  }
};
