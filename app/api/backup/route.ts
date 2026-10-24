import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { apiError, checkOrigin, readJson } from '@/lib/api';
import { backupSchema } from '@/lib/validation';
import { measurementUpsert, measurementValues } from '@/lib/measurement-sql';
// Import merges by UUID, in one transaction. Existing unrelated entries are preserved.
export async function POST(request: NextRequest) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const backup = backupSchema.parse(await readJson(request));
    const client = await (await database()).connect();
    try {
      await client.query('BEGIN');
      const p = backup.profile;
      await client.query('UPDATE profile SET name=$1,reason=$2,target_weight=$3,target_waist=$4 WHERE id=1', [p.name,p.reason,p.target_weight,p.target_waist]);
      for (const m of backup.measurements) await client.query(measurementUpsert, measurementValues(m));
      for (const f of backup.phases) await client.query('INSERT INTO phases (id,title,kind,start_date,end_date,goal,review) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,kind=EXCLUDED.kind,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,goal=EXCLUDED.goal,review=EXCLUDED.review', [f.id,f.title,f.kind,f.start_date,f.end_date,f.goal,f.review]);
      for (const g of backup.goals) await client.query('INSERT INTO goals (id,title,description,target,current,unit,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,target=EXCLUDED.target,current=EXCLUDED.current,unit=EXCLUDED.unit,deadline=EXCLUDED.deadline', [g.id,g.title,g.description,g.target,g.current,g.unit,g.deadline]);
      await client.query('COMMIT');
      return NextResponse.json({ ok: true });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  } catch (error) { return apiError(error); }
}
