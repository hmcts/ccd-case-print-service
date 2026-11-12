import { Logger } from "@hmcts/nodejs-logging";
const logger = Logger.getLogger("redis-client");

logger.info("Import config");
// @ts-ignore
import * as config from "config";
logger.info("Import Redis");
// @ts-ignore
import { Redis } from "ioredis";
/*
const PROPERTY_REDIS_ENABLED = "redis.enabled";
const PROPERTY_REDIS_HOST = "redis.host";
const PROPERTY_REDIS_PORT = "redis.port";
*/
logger.info("Before functions");
/*
export function getRedisClient(): Redis | null {
    logger.info("Getting Redis client");

    if (!isRedisEnabled()) {
        logger.info("Redis is not enabled");
        return null;
    }

    logger.info("Initialising Redis client");
    const redisClient: Redis = new Redis({
        host: config.get(PROPERTY_REDIS_HOST),
        port: config.get(PROPERTY_REDIS_PORT),
    });

    redisClient
        .on("error", (err) => logger.error("Redis error: %s", err))
        .on("connect", () => logger.info("Connected to Redis"));

    return redisClient;
}

function isRedisEnabled(): boolean {
    return config.get(PROPERTY_REDIS_ENABLED);
}
*/
export function getRedisClient() {
    logger.info("Returning null");
    return null;
}

logger.info("After functions");
