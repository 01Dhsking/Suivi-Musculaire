import type { Measurement } from './validation';
// Only application-defined column names are interpolated; all values are bound.
const columns = ['recorded_at', 'weight', 'waist', 'fat', 'muscle', 'chest', 'hips', 'arm', 'thigh', 'calf', 'source', 'note'] as const;
export const measurementSelect = `id, ${columns.join(', ')}`;
export const measurementInsert = `INSERT INTO measurements (id, ${columns.join(', ')}) VALUES (${['id', ...columns].map((_, index) => `$${index+1}`).join(', ')})`;
export const measurementUpdate = `UPDATE measurements SET ${columns.map((column,index) => `${column}=$${index+2}`).join(', ')} WHERE id=$1 RETURNING *`;
export const measurementUpsert = `${measurementInsert} ON CONFLICT (id) DO UPDATE SET ${columns.map(column => `${column}=EXCLUDED.${column}`).join(', ')}`;
export function measurementValues(m: Measurement) { return [m.id, ...columns.map(column => m[column])]; }
