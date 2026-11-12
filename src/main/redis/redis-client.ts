import { Logger } from "@hmcts/nodejs-logging";
const logger = Logger.getLogger("redis-client");

logger.info("Import conifg");
import * as config from "config";
logger.info("Import Redis");
import { Redis } from "ioredis";

const PROPERTY_REDIS_ENABLED = "redis.enabled";
const PROPERTY_REDIS_HOST = "redis.host";
const PROPERTY_REDIS_PORT = "redis.port";

let redisClient: Redis;

logger.info("Before functions");
export function getRedisClient(): Redis | null {
    logger.info("Getting Redis client");

    if (!isRedisEnabled()) {
        logger.info("Redis is not enabled");
        return null;
    }

    if (redisClient == null) {
        logger.info("Initialising Redis client");
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
    logger.info("Redis enabled: %s", config.get(PROPERTY_REDIS_ENABLED));
    return config.get(PROPERTY_REDIS_ENABLED);
}

logger.info("After functions");
