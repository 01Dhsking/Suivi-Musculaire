import { Pool, types } from 'pg';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
// Preserve calendar dates independently of the server's time zone.
types.setTypeParser(1082, value => value);
const globalDb = globalThis as unknown as { pool?: Pool; schemaReady?: Promise<void> };
export const pool = globalDb.pool ??= new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000,
});
pool.on('error', error => console.error('PostgreSQL pool:', error.message));
export async function database() {
  globalDb.schemaReady ??= (async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(749201)');
      await client.query(await readFile(path.join(process.cwd(), 'db/schema.sql'), 'utf8'));
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  })().catch(error => { globalDb.schemaReady = undefined; throw error; });
  await globalDb.schemaReady;
  return pool;
}
