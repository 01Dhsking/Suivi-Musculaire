import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/db';
import { apiError, checkOrigin, readJson } from '@/lib/api';
import { measurementSchema } from '@/lib/validation';
import { measurementInsert, measurementUpdate, measurementValues } from '@/lib/measurement-sql';
export async function POST(request: NextRequest) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const m = measurementSchema.parse(await readJson(request));
    const db = await database();
    const result = await db.query(`${measurementInsert} RETURNING *`, measurementValues({ ...m, id: randomUUID() }));
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) { return apiError(error); }
}
export async function PUT(request: NextRequest) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const m = measurementSchema.extend({ id: z.uuid() }).parse(await readJson(request));
    const result = await (await database()).query(measurementUpdate, measurementValues(m));
    return result.rowCount ? NextResponse.json(result.rows[0]) : NextResponse.json({ error: 'Mesure introuvable.' }, { status: 404 });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: NextRequest) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const { id } = z.object({ id: z.uuid() }).parse(await readJson(request));
    const result = await (await database()).query('DELETE FROM measurements WHERE id=$1', [id]);
    return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Mesure introuvable.' }, { status: 404 });
  } catch (error) { return apiError(error); }
}
