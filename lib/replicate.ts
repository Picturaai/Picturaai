const REPLICATE_API = 'https://api.replicate.com/v1/predictions'

type ReplicateOptions = {
  /** Number of one-second polls before giving up. */
  maxAttempts?: number
  /** Prefix used in the thrown error messages, e.g. "Replicate". */
  label?: string
}

/**
 * Creates a Replicate prediction and polls it to completion, returning the
 * first output URL. Throws when Replicate is unconfigured, fails, or times out.
 */
export async function runReplicatePrediction(
  version: string,
  input: Record<string, unknown>,
  { maxAttempts = 60, label = 'Replicate' }: ReplicateOptions = {}
): Promise<string> {
  const apiKey = process.env.REPLICATE_API_TOKEN
  if (!apiKey) throw new Error(`${label} not configured`)

  const response = await fetch(REPLICATE_API, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ version, input }),
  })

  if (!response.ok) throw new Error(`${label} creation failed`)
  const prediction = await response.json()

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    const statusRes = await fetch(`${REPLICATE_API}/${prediction.id}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    })
    const status = await statusRes.json()
    if (status.status === 'succeeded' && status.output) {
      return Array.isArray(status.output) ? status.output[0] : status.output
    }
    if (status.status === 'failed') throw new Error(`${label} failed`)
  }

  throw new Error(`${label} timed out`)
}
