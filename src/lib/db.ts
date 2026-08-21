import { Pool, type QueryResultRow } from "pg";

let pool: Pool | undefined;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({ connectionString });
  }

  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS random_strings (
      id SERIAL PRIMARY KEY,
      value TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
