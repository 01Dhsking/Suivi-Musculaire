import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metricSummary, series, targetProgress, personalGoalProgress } from '../lib/progress';
import { backupSchema, measurementSchema, phaseSchema, goalSchema } from '../lib/validation';
import type { Measurement } from '../lib/validation';
const base: Measurement = { id:'39d696bd-a188-4e7c-80a1-d1d622b1d777', recorded_at:'2026-10-20T12:00:00Z', weight:80, waist:90, chest:null, hips:null, arm:null, thigh:null, calf:null, fat:null, muscle:null, source:'Balance', note:'' };
test('summaries respect chronology and ignore missing optional measurements', () => {
  const entries = [{...base, recorded_at:'2026-10-21T12:00:00Z',weight:79,waist:null},base];
  assert.equal(metricSummary(entries,'weight').delta,-1);
  assert.equal(metricSummary(entries,'waist').last,90);
  assert.equal(metricSummary(entries,'waist').delta,null);
  assert.equal(metricSummary(entries,'fat').last,null);
});
test('additional body measurements are optional, validated and plotted independently', () => {
  for (const key of ['chest','hips','arm','thigh','calf']) {
    assert.equal(measurementSchema.safeParse({...base,[key]:-1}).success,false);
    assert.equal(measurementSchema.safeParse({...base,[key]:301}).success,false);
    assert.equal(measurementSchema.safeParse({...base,[key]:null}).success,true);
  }
  const entries = [{...base,arm:32},{...base,recorded_at:'2026-10-21T12:00:00Z',arm:32.5}];
  assert.equal(metricSummary(entries,'arm').delta,0.5);
  assert.equal(series(entries,'arm',0,'day',Date.parse('2026-10-24T12:00:00Z')).length,2);
  assert.equal(series(entries,'chest',0,'day',Date.parse('2026-10-24T12:00:00Z')).length,0);
});
test('legacy backups without new measurements or personal goals remain importable', () => {
  const { chest,hips,arm,thigh,calf,...legacy } = base;
  void [chest,hips,arm,thigh,calf];
  const restored = backupSchema.parse({version:1,profile:{name:'',reason:'',target_weight:null,target_waist:null},measurements:[legacy],phases:[]});
  assert.equal(restored.measurements[0].arm,null);
  assert.deepEqual(restored.goals,[]);
});
test('personal goals validate targets, progression, deadlines and backup identifiers', () => {
  const goal = { id:base.id,title:'Trois séances',description:'Rester régulier',target:3,current:1,unit:'séances',deadline:null };
  assert.equal(goalSchema.safeParse(goal).success,true);
  for (const change of [{target:0},{current:-1},{title:'  '},{deadline:'2026-02-30'},{unit:''}]) assert.equal(goalSchema.safeParse({...goal,...change}).success,false);
  assert.equal(personalGoalProgress(1,4),25);
  assert.equal(personalGoalProgress(5,4),100);
  assert.equal(personalGoalProgress(0,1),0);
  const backup = {version:2,profile:{name:'',reason:'',target_weight:null,target_waist:null},measurements:[base],phases:[],goals:[goal]};
  assert.equal(backupSchema.safeParse(backup).success,true);
  assert.equal(backupSchema.safeParse({...backup,goals:[goal,goal]}).success,false);
});
test('chart uses last actual measurement in a bucket without filling gaps', () => {
  const entries = [base,{...base,recorded_at:'2026-10-20T12:45:00Z',weight:79},{...base,recorded_at:'2026-10-22T12:00:00Z',weight:78}];
  const now = Date.parse('2026-10-24T12:00:00Z');
  assert.equal(series(entries,'weight',7,'hour',now).length,2);
  assert.equal(series(entries,'weight',7,'hour',now)[0].value,79);
  assert.equal(series(entries,'weight',7,'minute',now).length,3);
  assert.equal(series(entries,'fat',7,'day',now).length,0);
  assert.equal(series(entries,'weight',1,'day',now).length,0);
});
test('goal progress works for both loss and gain, clamped to 0–100', () => {
  assert.equal(targetProgress(80,75,70),50);
  assert.equal(targetProgress(70,75,80),50);
  assert.equal(targetProgress(80,85,70),0);
  assert.equal(targetProgress(80,65,70),100);
  assert.equal(targetProgress(null,75,70),null);
});
test('reject invalid measurements and reversed phase dates', () => {
  assert.equal(measurementSchema.safeParse({...base,weight:-1}).success,false);
  assert.equal(measurementSchema.safeParse({...base,fat:100}).success,false);
  assert.equal(measurementSchema.safeParse({...base,recorded_at:'not a date'}).success,false);
  assert.equal(phaseSchema.safeParse({title:'Phase',kind:'Maintien',start_date:'2026-10-25',end_date:'2026-10-20',goal:'',review:''}).success,false);
});
test('backup rejects duplicate UUIDs before any write', () => {
  const value = {version:1,profile:{name:'',reason:'',target_weight:null,target_waist:null},measurements:[base,base],phases:[]};
  assert.equal(backupSchema.safeParse(value).success,false);
  assert.equal(backupSchema.safeParse({...value,measurements:[base]}).success,true);
});
