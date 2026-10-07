// Runs before each test file, before any app module is imported.
import 'dotenv/config';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL must be set to run tests (see backend/.env.example)');
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://allowed.example';
// Tests make many auth calls; the rate-limit test uses its own app with a low limit.
process.env.AUTH_RATE_LIMIT_MAX = '10000';
