import { Pool } from "pg";
import { env } from "../config/env";

/**
 * PostgreSQL connection pool.
 * The schema will be defined in a later phase via migrations.
 */
export const pool = new Pool(
  env.db.url
    ? { connectionString: env.db.url }
    : {
        host: env.db.host,
        port: env.db.port,
        database: env.db.name,
        user: env.db.user,
        password: env.db.password,
      }
);

/** Verify DB connectivity — called on server startup. */
export const connectDb = async (): Promise<void> => {
  const client = await pool.connect();
  client.release();
  console.log("✅ PostgreSQL connected");
};
