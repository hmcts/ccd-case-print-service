import { IKeyValueStore } from "./key-value-store-interface";
import { Logger } from "@hmcts/nodejs-logging";
import { Redis } from "ioredis";

const logger = Logger.getLogger("redis-store");

export class RedisStore implements IKeyValueStore {

    private redisClient;

    constructor(redisHost: string, redisPort: number ) {
        logger.debug("Connecting to Redis");

        this.redisClient = new Redis({
            host: redisHost,
            port: redisPort,
        });

        this.redisClient
            .on("error", (err) => logger.error("Redis error: %s", err))
            .on("connect", () => logger.info("Connected to Redis"));
    }

    public get(key: string): Promise<string | null> {
        logger.debug("Getting entry from redis - key: %s", key);
        return this.redisClient.get(key);
    }

    public set(key: string, value: number, ttl: number | null): Promise<string> {
        if (ttl == null) {
            logger.debug("Adding/updating redis entry - key: %s, value: %s", key, value);
            return this.redisClient.set(key, value)
                .catch((error) => {
                    logger.error("Unable to set entry in Redis", error);
                    throw error;
                });
        }

        logger.debug("Adding/updating redis entry - key: %s, value: %s, ttl: %s", key, value, ttl);
        return this.redisClient.set(key, value, "EX", ttl)
            .catch((error) => {
                logger.error("Unable to set entry in Redis", error);
                throw error;
            });
    }
}
