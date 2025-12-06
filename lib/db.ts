import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Prefer env var, fallback to local.db
const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') || 'local.db');
export const db = drizzle(sqlite, { schema });
