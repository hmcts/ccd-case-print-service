import { IKeyValueStore } from "./key-value-store-interface";
import { Logger } from "@hmcts/nodejs-logging";
import { Redis } from "ioredis";

const logger = Logger.getLogger("redis-store");

export class RedisStore implements IKeyValueStore {

    private readonly redisClient: Redis;

    constructor(redisClient: Redis) {
        this.redisClient = redisClient;
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
