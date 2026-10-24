import { z } from 'zod';
const optionalNumber = (max: number) => z.number().finite().positive().max(max).nullable();
export const measurementSchema = z.object({
  recorded_at: z.iso.datetime({ offset: true }),
  weight: z.number().finite().positive().max(500),
  waist: optionalNumber(300),
  chest: optionalNumber(300).default(null),
  hips: optionalNumber(300).default(null),
  arm: optionalNumber(300).default(null),
  thigh: optionalNumber(300).default(null),
  calf: optionalNumber(300).default(null),
  fat: z.number().finite().positive().lt(100).nullable(),
  muscle: optionalNumber(300),
  source: z.string().trim().max(200),
  note: z.string().trim().max(2000),
});
export const profileSchema = z.object({
  name: z.string().trim().max(80), reason: z.string().trim().max(2000),
  target_weight: optionalNumber(500), target_waist: optionalNumber(300),
});
export const phaseSchema = z.object({
  title: z.string().trim().min(1).max(100),
  kind: z.enum(['Perte de graisse', 'Maintien', 'Prise de muscle']),
  start_date: z.iso.date(), end_date: z.iso.date(),
  goal: z.string().trim().max(1000), review: z.string().trim().max(2000),
}).refine(value => value.end_date >= value.start_date, { message: 'La fin doit suivre le début.', path: ['end_date'] });
export const goalSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000),
  target: z.number().finite().positive().max(1000000000),
  current: z.number().finite().min(0).max(1000000000),
  unit: z.string().trim().min(1).max(30),
  deadline: z.iso.date().nullable(),
});
export const backupSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]), profile: profileSchema,
  measurements: z.array(measurementSchema.extend({ id: z.uuid() })).max(50000),
  phases: z.array(phaseSchema.safeExtend({ id: z.uuid() })).max(1000),
  goals: z.array(goalSchema.extend({ id: z.uuid() })).max(1000).default([]),
}).refine(value => [value.measurements, value.phases, value.goals].every(rows => new Set(rows.map(row => row.id)).size === rows.length), { message: 'Identifiants dupliqués dans la sauvegarde.' });
export type Measurement = z.infer<typeof measurementSchema> & { id: string };
export type Profile = z.infer<typeof profileSchema>;
export type Phase = z.infer<typeof phaseSchema> & { id: string };
export type Goal = z.infer<typeof goalSchema> & { id: string };
export type Tracker = { measurements: Measurement[]; profile: Profile; phases: Phase[]; goals: Goal[] };
