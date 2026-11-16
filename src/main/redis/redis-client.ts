import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { Redis } from "ioredis";

const PROPERTY_REDIS_ENABLED: string = "redis.enabled";
const PROPERTY_REDIS_HOST: string = "redis.host";
const PROPERTY_REDIS_PORT: string = "redis.port";

const logger = Logger.getLogger("redis-client");

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
    logger.debug("Getting Redis client");

    if (!isRedisEnabled()) {
        logger.debug("Redis is not enabled");
        return null;
    }

    if (redisClient == null) {
        logger.debug("Initialising Redis client");
        redisClient = new Redis({
            host: getRedisHost(),
            port: getRedisPort(),
        });

        redisClient
            .on("error", (err) => logger.error("Redis error: %s", err))
            .on("connect", () => logger.info("Connected to Redis"));
    }

    return redisClient;
}

function isRedisEnabled(): boolean {
    const isEnabled: boolean = config.get<boolean>(PROPERTY_REDIS_ENABLED);
    logger.debug("Redis enabled: %s", isEnabled);
    return isEnabled == null ? false : isEnabled;
}

function getRedisHost(): string {
    const host: string = config.get<string>(PROPERTY_REDIS_HOST);
    logger.debug("Redis host: %s", host);
    return host;
}

function getRedisPort(): number {
    const port: number = config.get<number>(PROPERTY_REDIS_PORT);
    logger.debug("Redis port: %s", port);
    return port;
}
