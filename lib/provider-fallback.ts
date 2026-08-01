export type Provider<T> = () => Promise<T>

/**
 * Runs providers in order and returns the first successful result,
 * logging and skipping providers that throw. Returns null if all fail.
 */
export async function firstSuccessful<T>(
  providers: Provider<T>[],
  label: string
): Promise<T | null> {
  for (const provider of providers) {
    try {
      const result = await provider()
      if (result) return result
    } catch (err) {
      console.error(`${label} provider failed:`, err)
    }
  }
  return null
}
