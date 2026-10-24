import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Forma — Suivi musculaire', description: 'Tes efforts prennent forme. Suivi personnel des mesures, des objectifs et des phases.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" style={{ colorScheme: 'dark' }}><body>{children}</body></html>;
}
