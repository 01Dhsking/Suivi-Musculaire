import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { apiError } from '@/lib/api';
import { measurementSelect } from '@/lib/measurement-sql';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const db = await database();
    const client = await db.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const measurements = await client.query(`SELECT ${measurementSelect} FROM measurements ORDER BY recorded_at, created_at, id`);
      const profile = await client.query('SELECT name, reason, target_weight, target_waist FROM profile WHERE id = 1');
      const phases = await client.query('SELECT * FROM phases ORDER BY start_date, id');
      const goals = await client.query('SELECT id, title, description, target, current, unit, deadline FROM goals ORDER BY created_at, id');
      await client.query('COMMIT');
      return NextResponse.json({ measurements: measurements.rows, profile: profile.rows[0], phases: phases.rows, goals: goals.rows }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  } catch (error) { return apiError(error); }
}
