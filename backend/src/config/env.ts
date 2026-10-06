import dotenv from "dotenv";

dotenv.config();

/**
 * Centralised environment config — all process.env access goes through here.
 * Throw early if required variables are missing so the service fails fast.
 */
export const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.BACKEND_PORT ?? "4000", 10),
  host: process.env.BACKEND_HOST ?? "0.0.0.0",

  db: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: parseInt(process.env.POSTGRES_PORT ?? "5432", 10),
    name: process.env.POSTGRES_DB ?? "vertexlearn",
    user: process.env.POSTGRES_USER ?? "vertexlearn_user",
    password: process.env.POSTGRES_PASSWORD ?? "",
    url: process.env.DATABASE_URL ?? "",
  },

  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  },

  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",

  jwtSecret:        process.env.JWT_SECRET         ?? "dev_access_secret_change_me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret_change_me",
};
