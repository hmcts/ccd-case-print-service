import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { Redis } from "ioredis";

const PROPERTY_REDIS_ENABLED = "redis.enabled";
const PROPERTY_REDIS_HOST = "redis.host";
const PROPERTY_REDIS_PORT = "redis.port";

const logger = Logger.getLogger("case-id-store");

let store : KeyValueStore | null = null;

interface KeyValueStore {
    get(key : string) : Promise<string | null>;
    set(key : string, value : number, ttl : number | null) : Promise<string>;
}

class RedisStore implements KeyValueStore {

    private redisClient;

    constructor(redisHost : string, redisPort : number ) {
        logger.debug("Connecting to Redis");

        this.redisClient = new Redis({
            host: redisHost,
            port: redisPort
        });

        this.redisClient
            .on("error", (err) => console.error("Redis error: %s", err))
            .on("connect", () => console.info("Connected to Redis"));
    }

    get(key : string) : Promise<string | null> {
        logger.debug("Getting entry from redis - key: %s", key);
        return this.redisClient.get(key);
    }

    set(key : string, value : number, ttl : number | null) : Promise<string> {
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

class MemoryStore implements KeyValueStore {

    private caseIdData = new Map<string, { value : string, expiresAt : number | null }>();

    get(key : string) : Promise<string | null> {
        logger.debug("Getting entry from memory store - key: %s", key);
        let result = this.caseIdData.get(key);

        if (result == undefined) {
            logger.debug("No entry found in memory store - key: %s", key);
            return Promise.resolve(null);
        }

        logger.debug("Entry found in memory store - key: %s", key);
        if (result.expiresAt != null && result.expiresAt < Date.now()) {
            logger.debug("Entry in memory store has expired - key: %s", key);
            this.caseIdData.delete(key);
            return Promise.resolve(null);
        }

        return Promise.resolve(result.value);
    }

    set(key : string, value : number, ttl : number | null) : Promise<string> {
        let valueStr : string = value.toString();
        let expiresDateTime : number | null = ttl == null ? null : Date.now() + ttl * 1000;

        logger.debug("Adding/updating entry in memory store - key: %s, value: %s, ttl: %s",
            key, valueStr, expiresDateTime == null ? "null" : expiresDateTime);
        this.caseIdData.set(key, { value: valueStr, expiresAt: expiresDateTime});

        return Promise.resolve("OK");
    }
}

function getStore() : KeyValueStore {

    if (store == null) {
        if (!config.get(PROPERTY_REDIS_ENABLED)) {
            logger.debug("Using memory store");
            store = new MemoryStore();
        } else {
            logger.debug("Using Redis store");
            store = new RedisStore(config.get(PROPERTY_REDIS_HOST), config.get(PROPERTY_REDIS_PORT));
        }
    }

    return store;
}

export function get(key : string) : Promise<string | null> {
    return getStore().get(key);
}

export function set(key : string, value : number, ttl : number | null) : Promise<string> {
    return getStore().set(key, value, ttl);
}
