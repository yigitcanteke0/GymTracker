/**
 * Exponential backoff with jitter. Industry-standard retry helper.
 *
 * Defaults: 5 toplam deneme (1 + 4 retry), 300ms → 4.8s arası gecikme +
 * 150ms'e kadar jitter (thundering-herd önler).
 */
export interface RetryOptions {
  retries?: number
  baseMs?: number
  maxMs?: number
  /** Hata öyle bir şey ki retry'a değmiyorsa true dön (ör. 4xx auth). */
  shouldRetry?: (err: unknown, attempt: number) => boolean
  onAttempt?: (attempt: number, err: unknown) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const {
    retries = 4,
    baseMs = 300,
    maxMs = 4800,
    shouldRetry,
    onAttempt,
  } = opts

  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      onAttempt?.(attempt, err)
      if (attempt === retries) break
      if (shouldRetry && !shouldRetry(err, attempt)) break
      const delay =
        Math.min(maxMs, baseMs * Math.pow(2, attempt)) + Math.random() * 150
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

/**
 * Supabase query helper'ı. Promise<{ data, error }> dönen sorguları
 * error varsa throw eden, normal Promise<T | null> haline getirir.
 * Böylece `withRetry` ile sarılabilirler.
 */
export async function unwrap<T>(
  promise: PromiseLike<{ data: T | null; error: { message: string; code?: string } | null }>
): Promise<T | null> {
  const { data, error } = await promise
  if (error) {
    const e = new Error(error.message) as Error & { code?: string }
    e.code = error.code
    throw e
  }
  return data
}
