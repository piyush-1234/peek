import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  matchIntervalMs: Number(process.env.MATCH_INTERVAL_MS || 150),
  matchTimeoutMs: Number(process.env.MATCH_TIMEOUT_MS || 30000),
  env: process.env.NODE_ENV || 'development',
};