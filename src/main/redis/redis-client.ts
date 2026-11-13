import { Logger } from "@hmcts/nodejs-logging";
const logger = Logger.getLogger("redis-client");

logger.info("Import config");
import * as config from "config";
logger.info("Import Redis");
import { Redis } from "ioredis";

const PROPERTY_REDIS_ENABLED: string = "redis.enabled";
const PROPERTY_REDIS_HOST: string = "redis.host";
const PROPERTY_REDIS_PORT: string = "redis.port";

logger.info("Before functions");

export function getRedisClient(): Redis | null {
    logger.info("Getting Redis client");

    if (!isRedisEnabled()) {
        logger.info("Redis is not enabled");
        return null;
    } else {
        logger.info("Initialising Redis client");
        // @ts-ignore
        const redisHost: string = getRedisHost();
        // @ts-ignore
        const redisPort: number = getRedisPort();

        /*
        const redisClient: RedisClient = new RedisClient(redisHost, redisPort);

        return redisClient.getRedis();
        */

        return null;
    }

    /*
    logger.info("Initialising Redis client");
    const redisClient: Redis = new Redis({
        host: config.get(PROPERTY_REDIS_HOST),
        port: config.get(PROPERTY_REDIS_PORT),
    });

    redisClient
        .on("error", (err) => logger.error("Redis error: %s", err))
        .on("connect", () => logger.info("Connected to Redis"));

    return redisClient;
    */
}

function isRedisEnabled(): boolean {
    const isEnabled: boolean = config.get<boolean>(PROPERTY_REDIS_ENABLED);
    logger.info("Redis enabled: %s", isEnabled);
    return isEnabled;
}

function getRedisHost(): string {
    const host: string = config.get<string>(PROPERTY_REDIS_HOST);
    logger.info("Redis host: %s", host);
    return host;
}

function getRedisPort(): number {
    const port: number = config.get<number>(PROPERTY_REDIS_PORT);
    logger.info("Redis port: %s", port);
    return port;
}

logger.info("After functions");

// @ts-ignore
class RedisClient {

    private readonly redisConnection: Redis;

    constructor(redisHost: string, redisPort: number) {
        logger.info("constructor");

        this.redisConnection = new Redis({
            host: redisHost,
            port: redisPort,
        });

        this.redisConnection
            .on("error", (err) => logger.error("Redis error: %s", err))
            .on("connect", () => logger.info("Connected to Redis"));
    }

    public getRedis(): Redis {
        return this.redisConnection;
    }
}

logger.info("After class");
