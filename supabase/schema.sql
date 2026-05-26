-- ============================================================
-- WORKOUT TRACKER — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MUSCLE GROUPS
-- ============================================================
CREATE TABLE muscle_groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE,
  name       text NOT NULL,
  icon       text NOT NULL DEFAULT '💪',
  color      text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ============================================================
-- EXERCISES
-- ============================================================
CREATE TABLE exercises (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users ON DELETE CASCADE,
  name                 text NOT NULL,
  muscle_group_id      uuid REFERENCES muscle_groups ON DELETE SET NULL,
  secondary_muscle_ids uuid[] DEFAULT '{}',
  equipment            text DEFAULT 'barbell'
                         CHECK (equipment IN ('barbell','dumbbell','machine','cable','bodyweight','other')),
  icon                 text DEFAULT '🏋️',
  is_favorite          boolean DEFAULT false,
  instructions         text,
  created_at           timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ============================================================
-- WORKOUTS (antrenman seansı)
-- ============================================================
CREATE TABLE workouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name        text,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  notes       text,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- WORKOUT SETS (ana veri tablosu)
-- ============================================================
CREATE TABLE workout_sets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id     uuid REFERENCES workouts ON DELETE CASCADE NOT NULL,
  exercise_id    uuid REFERENCES exercises NOT NULL,
  exercise_order smallint NOT NULL,
  set_number     smallint NOT NULL,
  weight_kg      numeric(6,2) DEFAULT 0,
  reps           smallint,
  rir            smallint CHECK (rir BETWEEN 0 AND 5),
  set_type       text DEFAULT 'working'
                   CHECK (set_type IN ('warmup','working','dropset')),
  completed_at   timestamptz DEFAULT now(),
  notes          text,
  UNIQUE (workout_id, exercise_order, set_number)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE muscle_groups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets   ENABLE ROW LEVEL SECURITY;

-- muscle_groups: kendi kayıtlar + sistem kayıtları (user_id IS NULL)
CREATE POLICY "muscle_groups_select" ON muscle_groups FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "muscle_groups_insert" ON muscle_groups FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "muscle_groups_update" ON muscle_groups FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "muscle_groups_delete" ON muscle_groups FOR DELETE
  USING (user_id = auth.uid());

-- exercises: kendi kayıtlar + sistem kayıtları
CREATE POLICY "exercises_select" ON exercises FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "exercises_insert" ON exercises FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "exercises_update" ON exercises FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "exercises_delete" ON exercises FOR DELETE
  USING (user_id = auth.uid());

-- workouts: sadece kendi
CREATE POLICY "workouts_all" ON workouts FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- workout_sets: workout sahibi ise erişebilir
CREATE POLICY "workout_sets_all" ON workout_sets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workouts w
    WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM workouts w
    WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()
  ));

-- ============================================================
-- SEED DATA — Sistem kas grupları ve egzersizler
-- ============================================================
INSERT INTO muscle_groups (user_id, name, icon, color) VALUES
  (NULL, 'Göğüs',     '🫁', '#ef4444'),
  (NULL, 'Sırt',      '🔙', '#3b82f6'),
  (NULL, 'Omuz',      '💪', '#8b5cf6'),
  (NULL, 'Biceps',    '💪', '#f59e0b'),
  (NULL, 'Triceps',   '💪', '#10b981'),
  (NULL, 'Bacak',     '🦵', '#f97316'),
  (NULL, 'Karın',     '🫃', '#06b6d4'),
  (NULL, 'Kalça',     '🍑', '#ec4899');

-- Göğüs egzersizleri
WITH mg AS (SELECT id FROM muscle_groups WHERE name = 'Göğüs' AND user_id IS NULL)
INSERT INTO exercises (user_id, name, muscle_group_id, equipment, icon) VALUES
  (NULL, 'Flat Bench Press',    (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Incline Bench Press', (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Decline Bench Press', (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'DB Flat Press',       (SELECT id FROM mg), 'dumbbell', '💪'),
  (NULL, 'DB Incline Press',    (SELECT id FROM mg), 'dumbbell', '💪'),
  (NULL, 'Cable Fly',           (SELECT id FROM mg), 'cable',    '🔄'),
  (NULL, 'Pec Dec',             (SELECT id FROM mg), 'machine',  '⚙️'),
  (NULL, 'Dip (Göğüs)',        (SELECT id FROM mg), 'bodyweight','⬇️');

-- Sırt egzersizleri
WITH mg AS (SELECT id FROM muscle_groups WHERE name = 'Sırt' AND user_id IS NULL)
INSERT INTO exercises (user_id, name, muscle_group_id, equipment, icon) VALUES
  (NULL, 'Deadlift',            (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Barbell Row',         (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Pull-up',             (SELECT id FROM mg), 'bodyweight','⬆️'),
  (NULL, 'Lat Pulldown',        (SELECT id FROM mg), 'cable',    '⬇️'),
  (NULL, 'Seated Cable Row',    (SELECT id FROM mg), 'cable',    '🔄'),
  (NULL, 'DB Row',              (SELECT id FROM mg), 'dumbbell', '💪'),
  (NULL, 'T-Bar Row',           (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Face Pull',           (SELECT id FROM mg), 'cable',    '🔄');

-- Omuz egzersizleri
WITH mg AS (SELECT id FROM muscle_groups WHERE name = 'Omuz' AND user_id IS NULL)
INSERT INTO exercises (user_id, name, muscle_group_id, equipment, icon) VALUES
  (NULL, 'OHP (Barbell)',       (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'DB Shoulder Press',   (SELECT id FROM mg), 'dumbbell', '💪'),
  (NULL, 'DB Lateral Raise',    (SELECT id FROM mg), 'dumbbell', '↔️'),
  (NULL, 'Cable Lateral Raise', (SELECT id FROM mg), 'cable',    '🔄'),
  (NULL, 'Rear Delt Fly',       (SELECT id FROM mg), 'dumbbell', '↔️'),
  (NULL, 'Arnold Press',        (SELECT id FROM mg), 'dumbbell', '💪');

-- Biceps
WITH mg AS (SELECT id FROM muscle_groups WHERE name = 'Biceps' AND user_id IS NULL)
INSERT INTO exercises (user_id, name, muscle_group_id, equipment, icon) VALUES
  (NULL, 'Barbell Curl',        (SELECT id FROM mg), 'barbell',  '💪'),
  (NULL, 'DB Curl',             (SELECT id FROM mg), 'dumbbell', '💪'),
  (NULL, 'Hammer Curl',         (SELECT id FROM mg), 'dumbbell', '🔨'),
  (NULL, 'Preacher Curl',       (SELECT id FROM mg), 'barbell',  '💪'),
  (NULL, 'Cable Curl',          (SELECT id FROM mg), 'cable',    '🔄'),
  (NULL, 'Incline DB Curl',     (SELECT id FROM mg), 'dumbbell', '💪');

-- Triceps
WITH mg AS (SELECT id FROM muscle_groups WHERE name = 'Triceps' AND user_id IS NULL)
INSERT INTO exercises (user_id, name, muscle_group_id, equipment, icon) VALUES
  (NULL, 'Close Grip Bench',    (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Tricep Pushdown',     (SELECT id FROM mg), 'cable',    '⬇️'),
  (NULL, 'Overhead Tri Ext.',   (SELECT id FROM mg), 'cable',    '🔄'),
  (NULL, 'Skull Crusher',       (SELECT id FROM mg), 'barbell',  '💀'),
  (NULL, 'Dip (Triceps)',       (SELECT id FROM mg), 'bodyweight','⬇️'),
  (NULL, 'DB Kickback',         (SELECT id FROM mg), 'dumbbell', '💪');

-- Bacak
WITH mg AS (SELECT id FROM muscle_groups WHERE name = 'Bacak' AND user_id IS NULL)
INSERT INTO exercises (user_id, name, muscle_group_id, equipment, icon) VALUES
  (NULL, 'Squat',               (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Leg Press',           (SELECT id FROM mg), 'machine',  '⚙️'),
  (NULL, 'Romanian Deadlift',   (SELECT id FROM mg), 'barbell',  '🏋️'),
  (NULL, 'Leg Curl',            (SELECT id FROM mg), 'machine',  '⚙️'),
  (NULL, 'Leg Extension',       (SELECT id FROM mg), 'machine',  '⚙️'),
  (NULL, 'Hack Squat',          (SELECT id FROM mg), 'machine',  '⚙️'),
  (NULL, 'Lunges',              (SELECT id FROM mg), 'dumbbell', '🦵'),
  (NULL, 'Calf Raise',          (SELECT id FROM mg), 'machine',  '⚙️');
