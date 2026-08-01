import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

type Db = NeonQueryFunction<false, false>

let client: Db | null = null

/**
 * Shared Neon client. Created lazily so that importing a module does not
 * require DATABASE_URL at build time, and cached so the same connection
 * config is reused across route handlers in a runtime.
 */
export function getDb(): Db {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not configured')
    client = neon(url)
  }
  return client
}

/**
 * Shorthand for {@link getDb} that keeps the client's own call signatures, so
 * call sites can write `sql`SELECT ...`` directly. `sql.query(text, params)`
 * and `sql.transaction(...)` are forwarded too; the driver only accepts the
 * tagged-template form for a plain call.
 */
export const sql: Db = Object.assign(
  (...args: unknown[]) => (getDb() as unknown as (...a: unknown[]) => unknown)(...args),
  {
    query: (...args: unknown[]) =>
      (getDb().query as unknown as (...a: unknown[]) => unknown)(...args),
    transaction: (...args: unknown[]) =>
      (getDb().transaction as unknown as (...a: unknown[]) => unknown)(...args),
  },
) as unknown as Db
