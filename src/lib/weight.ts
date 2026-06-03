import type { WeightUnit } from '@/types'

export const KG_PER_LBS = 0.45359237

/**
 * Bir set'in hacme katkısını her zaman kanonik kg cinsinden döndürür.
 * Hacim toplamları (dashboard, history, detail) bunu kullanır.
 */
export function setVolumeKg(value: number, reps: number, unit: WeightUnit): number {
  const kgValue = unit === 'lbs' ? value * KG_PER_LBS : value
  return kgValue * reps
}

/** Ham değeri kg olarak normalize et — hacim toplamlarında kullanılır. */
export function toCanonicalKg(value: number, unit: WeightUnit): number {
  return unit === 'lbs' ? value * KG_PER_LBS : value
}

/** "80 kg" / "176 lbs" gibi UI metni. */
export function formatWeight(value: number, unit: WeightUnit): string {
  return `${value} ${unit}`
}
