import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database } from '@/lib/db';
import { apiError, checkOrigin, readJson } from '@/lib/api';
import { goalSchema } from '@/lib/validation';

async function save(request: NextRequest, edit: boolean) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const body = await readJson(request);
    const g = goalSchema.parse(body);
    const id = edit ? z.uuid().parse(body.id) : randomUUID();
    const result = await (await database()).query(edit
      ? 'UPDATE goals SET title=$2,description=$3,target=$4,current=$5,unit=$6,deadline=$7 WHERE id=$1 RETURNING *'
      : 'INSERT INTO goals (id,title,description,target,current,unit,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [id,g.title,g.description,g.target,g.current,g.unit,g.deadline]);
    return result.rowCount ? NextResponse.json(result.rows[0], { status: edit ? 200 : 201 }) : NextResponse.json({ error: 'Objectif introuvable.' }, { status: 404 });
  } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) { return save(request, false); }
export async function PUT(request: NextRequest) { return save(request, true); }
export async function DELETE(request: NextRequest) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const { id } = z.object({ id: z.uuid() }).parse(await readJson(request));
    const result = await (await database()).query('DELETE FROM goals WHERE id=$1', [id]);
    return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Objectif introuvable.' }, { status: 404 });
  } catch (error) { return apiError(error); }
}
