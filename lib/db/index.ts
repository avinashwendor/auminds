import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const explicitConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.DATABASE_PUBLIC_URL;

const connectionString =
  explicitConnectionString || 'postgres://postgres:postgres@localhost:5432/auminds';

const configuredPoolMax = Number.parseInt(process.env.DATABASE_POOL_MAX || '5', 10);
const poolMax = Number.isFinite(configuredPoolMax) && configuredPoolMax > 0 ? configuredPoolMax : 5;

export const client = postgres(connectionString, {
  max: poolMax,
  connect_timeout: 3,
  idle_timeout: 30,
  max_lifetime: 1800,
  ssl: process.env.DATABASE_SSL === 'true' ? 'require' : false,
  onnotice: () => {}, // Silences harmless PostgreSQL NOTICE messages (e.g. 42701 column exists, 42P07 table exists)
});

export const db = drizzle(client, { schema });
export const hasConfiguredDatabase = Boolean(explicitConnectionString);

type DatabaseStatus = 'unknown' | 'available' | 'unavailable';

const AVAILABLE_CACHE_MS = 15_000;
const UNAVAILABLE_RETRY_MS = 30_000;

let status: DatabaseStatus = 'unknown';
let lastChecked = 0;
let availabilityProbe: Promise<boolean> | null = null;

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  if ('code' in error && typeof error.code === 'string') return error.code;
  if ('errors' in error && Array.isArray(error.errors)) {
    for (const nested of error.errors) {
      const code = errorCode(nested);
      if (code) return code;
    }
  }
  return undefined;
}

function setStatus(nextStatus: DatabaseStatus, error?: unknown) {
  if (nextStatus === status) return;

  const previousStatus = status;
  status = nextStatus;

  if (nextStatus === 'unavailable') {
    const target = explicitConnectionString ? 'the configured database' : 'localhost:5432';
    const code = errorCode(error);
    console.warn(
      `[Database] PostgreSQL is unavailable at ${target}${code ? ` (${code})` : ''}. ` +
      'Running in degraded mode; connection checks will retry automatically.',
    );
  } else if (nextStatus === 'available' && previousStatus === 'unavailable') {
    console.info('[Database] PostgreSQL connection restored. Live data is available again.');
  }
}

export function getDatabaseStatus(): DatabaseStatus {
  return status;
}

export async function isDatabaseAvailable(options: { force?: boolean } = {}): Promise<boolean> {
  const now = Date.now();
  const cacheDuration = status === 'unavailable' ? UNAVAILABLE_RETRY_MS : AVAILABLE_CACHE_MS;

  if (!options.force && status !== 'unknown' && now - lastChecked < cacheDuration) {
    return status === 'available';
  }

  if (availabilityProbe) return availabilityProbe;

  availabilityProbe = (async () => {
    try {
      const result = await Promise.race([
        client`SELECT 1`,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(Object.assign(new Error('Database availability check timed out'), { code: 'ETIMEDOUT' })), 3_500),
        ),
      ]);
      const available = Array.isArray(result) && result.length > 0;
      setStatus(available ? 'available' : 'unavailable');
      return available;
    } catch (error) {
      setStatus('unavailable', error);
      return false;
    } finally {
      lastChecked = Date.now();
      availabilityProbe = null;
    }
  })();

  return availabilityProbe;
}

export async function withDatabaseFallback<T>(
  operation: string,
  task: () => Promise<T>,
  fallback: T | (() => T),
): Promise<T> {
  if (!(await isDatabaseAvailable())) {
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }

  try {
    return await task();
  } catch (error) {
    const code = errorCode(error);
    if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND' || code === 'ECONNRESET') {
      setStatus('unavailable', error);
    } else {
      console.error(`[Database] ${operation} failed${code ? ` (${code})` : ''}.`);
    }
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}
