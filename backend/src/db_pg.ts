import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pgUrl = process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5433/unisallround';

export const pgPool = new Pool({
  connectionString: pgUrl,
});

export async function queryPg(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pgPool.query(text, params);
  const duration = Date.now() - start;
  return res;
}
