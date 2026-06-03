interface QueryResult {
  data: unknown
  error: { code?: string; message?: string } | null
}

/**
 * Postgres "column does not exist" hatasına dayanıklı select wrapper'ı.
 * Primary sorgu 42703 koduyla başarısız olursa fallback sorgusunu dener.
 *
 * Migration henüz çalıştırılmamış bir kolona (ör. weight_unit) referans
 * veren sorguların uygulamayı boş veri ile çökertmesini önler.
 *
 * Generic `T`: caller belirler (her iki sorgudan beklenen yapı). İçeride
 * `any` taşımak yerine sonucu T[] olarak cast ederiz — caller zaten her
 * iki sorgunun da seçtiği alanları biliyor.
 */
export async function tryWithFallback<T>(
  primary: () => PromiseLike<QueryResult>,
  fallback: () => PromiseLike<QueryResult>
): Promise<T[] | null> {
  const r1 = await primary()
  if (r1.error && isMissingColumn(r1.error)) {
    const r2 = await fallback()
    return (r2.data as T[] | null) ?? null
  }
  return (r1.data as T[] | null) ?? null
}

function isMissingColumn(err: { code?: string; message?: string }): boolean {
  return err.code === '42703' || /does not exist/i.test(err.message ?? '')
}
