import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { Redis } from "ioredis";

const PROPERTY_REDIS_ENABLED = "redis.enabled";
const PROPERTY_REDIS_HOST = "redis.host";
const PROPERTY_REDIS_PORT = "redis.port";

const logger = Logger.getLogger("redis-client");

let redisClient: Redis;

export function getRedisClient(): Redis | null {
    logger.debug("Getting Redis client");

    if (!isRedisEnabled()) {
        logger.debug("Redis is not enabled");
        return null;
    }

    if (redisClient == null) {
        logger.debug("Initialising Redis client");
        redisClient = new Redis({
            host: config.get(PROPERTY_REDIS_HOST),
            port: config.get(PROPERTY_REDIS_PORT),
        });

        redisClient
            .on("error", (err) => logger.error("Redis error: %s", err))
            .on("connect", () => logger.info("Connected to Redis"));
    }

    return redisClient;
}

function isRedisEnabled(): boolean {
    return config.get(PROPERTY_REDIS_ENABLED);
}
