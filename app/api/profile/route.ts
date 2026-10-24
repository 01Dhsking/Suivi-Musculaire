import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { apiError, checkOrigin, readJson } from '@/lib/api';
import { profileSchema } from '@/lib/validation';
export async function PUT(request: NextRequest) {
  const rejected = checkOrigin(request); if (rejected) return rejected;
  try {
    const p = profileSchema.parse(await readJson(request));
    await (await database()).query('UPDATE profile SET name=$1,reason=$2,target_weight=$3,target_waist=$4 WHERE id=1', [p.name,p.reason,p.target_weight,p.target_waist]);
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
