import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { await (await database()).query('SELECT 1'); return NextResponse.json({ status: 'ok' }); }
  catch { return NextResponse.json({ status: 'unavailable' }, { status: 503 }); }
}
