import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const redisUri = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;

/**
 * Creates a dedicated, fresh Redis client instance for BullMQ Queues and Workers.
 * Dedicated connections prevent command collisions and blocking socket locks.
 */
export const createRedisClient = (): Redis => {
  if (redisUri) {
    const client = new Redis(redisUri, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
    return client;
  }

  return new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: process.env.REDIS_TLS === 'true' ? { rejectUnauthorized: false } : undefined,
  });
};
