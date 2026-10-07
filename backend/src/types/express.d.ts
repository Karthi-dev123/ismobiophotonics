export interface AuthUser {
  id: string;
  jti: string;
  /** Token expiry (seconds since epoch). */
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth. */
      user?: AuthUser;
    }
  }
}
