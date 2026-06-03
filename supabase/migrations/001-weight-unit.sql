-- =============================================================================
-- 001 — Add LBS support: weight_unit on exercises (preferred) + workout_sets
--      (historical record of the unit each set was entered in).
--
-- workout_sets.weight_kg artık "kullanıcının girdiği ham sayı" demek.
-- Birim weight_unit kolonunda. Volume hesabı yaparken lbs → kg dönüşümü
-- gerekiyor (app tarafında).
-- =============================================================================

ALTER TABLE exercises
  ADD COLUMN weight_unit text NOT NULL DEFAULT 'kg'
  CHECK (weight_unit IN ('kg', 'lbs'));

ALTER TABLE workout_sets
  ADD COLUMN weight_unit text NOT NULL DEFAULT 'kg'
  CHECK (weight_unit IN ('kg', 'lbs'));
