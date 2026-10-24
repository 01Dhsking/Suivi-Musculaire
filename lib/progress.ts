import type { Measurement } from './validation';
import type { Metric } from './metrics';
export type { Metric } from './metrics';
export function series(measurements: Measurement[], metric: Metric, days: number, granularity: string, now = Date.now()) {
  const buckets = new Map<number, { time: number; value: number }>();
  for (const m of [...measurements].sort((a,b) => Date.parse(a.recorded_at) - Date.parse(b.recorded_at))) {
    const timestamp = Date.parse(m.recorded_at);
    if (m[metric] === null || (days && timestamp < now - days * 86400000) || timestamp > now) continue;
    const date = new Date(timestamp);
    const time = granularity === 'day' ? new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime() : Math.floor(timestamp / (granularity === 'hour' ? 3600000 : 60000)) * (granularity === 'hour' ? 3600000 : 60000);
    buckets.set(time, { time, value: m[metric]! });
  }
  return [...buckets.values()];
}
export function personalGoalProgress(current: number, target: number) {
  return Math.max(0, Math.min(100, current / target * 100));
}
export function metricSummary(measurements: Measurement[], metric: Metric) {
  const values = [...measurements].sort((a,b) => Date.parse(a.recorded_at) - Date.parse(b.recorded_at)).filter(m => m[metric] !== null);
  const first = values[0]?.[metric] ?? null;
  const last = values.at(-1)?.[metric] ?? null;
  return { first, last, delta: first === null || last === null || values.length < 2 ? null : last - first, date: values.at(-1)?.recorded_at };
}
export function targetProgress(first: number | null, current: number | null, target: number | null) {
  if (first === null || current === null || target === null) return null;
  if (first === target) return current === target ? 100 : 0;
  return Math.max(0, Math.min(100, (current - first) / (target - first) * 100));
}
