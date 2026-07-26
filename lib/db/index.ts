import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  'postgres://postgres:postgres@localhost:5432/auminds';

const configuredPoolMax = Number.parseInt(process.env.DATABASE_POOL_MAX || '5', 10);
const poolMax = Number.isFinite(configuredPoolMax) && configuredPoolMax > 0 ? configuredPoolMax : 5;

// Railway PostgreSQL connection setup with production SSL & pool management
export const client = postgres(connectionString, { 
  max: poolMax,
  connect_timeout: 10,
  idle_timeout: 30,
  max_lifetime: 1800,
  ssl: process.env.DATABASE_SSL === 'true' ? 'require' : false,
});
export const db = drizzle(client, { schema });

let dbAvailabilityState: { available: boolean; lastChecked: number } = {
  available: true,
  lastChecked: 0,
};

export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (now - dbAvailabilityState.lastChecked < 15000) {
    return dbAvailabilityState.available;
  }

  dbAvailabilityState.lastChecked = now;
  try {
    const result = await Promise.race([
      client`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 5000)),
    ]);
    dbAvailabilityState.available = Array.isArray(result) && result.length > 0;
  } catch (err) {
    console.warn('[DB Check] Database connection check failed or timed out:', err);
    dbAvailabilityState.available = false;
  }

  return dbAvailabilityState.available;
}

