CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY,
  recorded_at timestamptz NOT NULL,
  weight double precision NOT NULL CHECK (weight > 0 AND weight <= 500),
  waist double precision CHECK (waist > 0 AND waist <= 300),
  fat double precision CHECK (fat > 0 AND fat < 100),
  muscle double precision CHECK (muscle > 0 AND muscle <= 300),
  source text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS measurements_recorded_at_idx ON measurements(recorded_at);
-- Additive migration: existing measurements and their history are preserved.
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS chest double precision CHECK (chest > 0 AND chest <= 300);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS hips double precision CHECK (hips > 0 AND hips <= 300);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS arm double precision CHECK (arm > 0 AND arm <= 300);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS thigh double precision CHECK (thigh > 0 AND thigh <= 300);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS calf double precision CHECK (calf > 0 AND calf <= 300);
CREATE TABLE IF NOT EXISTS profile (
  id integer PRIMARY KEY CHECK (id = 1),
  name text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT '',
  target_weight double precision CHECK (target_weight > 0 AND target_weight <= 500),
  target_waist double precision CHECK (target_waist > 0 AND target_waist <= 300)
);
INSERT INTO profile (id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS phases (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('Perte de graisse', 'Maintien', 'Prise de muscle')),
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date >= start_date),
  goal text NOT NULL DEFAULT '',
  review text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  target double precision NOT NULL CHECK (target > 0 AND target <= 1000000000),
  current double precision NOT NULL DEFAULT 0 CHECK (current >= 0 AND current <= 1000000000),
  unit text NOT NULL,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now()
);
