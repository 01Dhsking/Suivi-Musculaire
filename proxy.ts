import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
export function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (password) {
    const header = request.headers.get('authorization') ?? '';
    const provided = header.startsWith('Basic ') ? Buffer.from(header.slice(6), 'base64').toString() : '';
    const expected = Buffer.from(`admin:${password}`);
    const actual = Buffer.from(provided);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return new NextResponse('Connexion requise — identifiant : admin', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Suivi musculaire", charset="UTF-8"', 'Cache-Control': 'no-store' } });
  }
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'same-origin');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
