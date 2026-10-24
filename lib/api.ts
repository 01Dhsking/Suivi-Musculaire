import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
export function apiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: 'Vérifie les champs : ' + error.issues.map(i => `${i.path.join('.')} — ${i.message}`).join('; ') }, { status: 400 });
  if (error instanceof SyntaxError) return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  console.error(error);
  return NextResponse.json({ error: 'La base de données est indisponible. Vérifie PostgreSQL, puis réessaie.' }, { status: 503 });
}
export function checkOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  // Browser writes must be same-origin, including when accessed over the LAN.
  let allowed = false;
  try { allowed = !!origin && new URL(origin).host === request.headers.get('host'); } catch { /* Invalid origins are rejected too. */ }
  if (!allowed) {
    return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  }
}
export async function readJson(request: NextRequest) {
  const body = await request.text();
  if (Buffer.byteLength(body) > 10 * 1024 * 1024) throw new SyntaxError('Requête trop volumineuse.');
  return JSON.parse(body);
}
