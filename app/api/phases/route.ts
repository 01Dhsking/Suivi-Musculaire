import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/db';
import { apiError, checkOrigin, readJson } from '@/lib/api';
import { phaseSchema } from '@/lib/validation';
async function save(request: NextRequest, edit: boolean) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const body = await readJson(request);
    const p = phaseSchema.parse(body);
    const id = edit ? z.uuid().parse(body.id) : randomUUID();
    const args = [id,p.title,p.kind,p.start_date,p.end_date,p.goal,p.review];
    const db = await database();
    const result = await db.query(edit ? 'UPDATE phases SET title=$2,kind=$3,start_date=$4,end_date=$5,goal=$6,review=$7 WHERE id=$1 RETURNING *' : 'INSERT INTO phases (id,title,kind,start_date,end_date,goal,review) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', args);
    return result.rowCount ? NextResponse.json(result.rows[0], { status: edit ? 200 : 201 }) : NextResponse.json({ error: 'Phase introuvable.' }, { status: 404 });
  } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) { return save(request, false); }
export async function PUT(request: NextRequest) { return save(request, true); }
export async function DELETE(request: NextRequest) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const { id } = z.object({ id: z.uuid() }).parse(await readJson(request));
    const result = await (await database()).query('DELETE FROM phases WHERE id=$1', [id]);
    return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Phase introuvable.' }, { status: 404 });
  } catch (error) { return apiError(error); }
}
