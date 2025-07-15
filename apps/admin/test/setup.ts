import { beforeAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(() => {
  // Set up global test environment
  process.env.VITE_API_URL = 'http://localhost:3000/api/v1';
  process.env.VITE_ADMIN_URL = 'http://localhost:5173';
});
