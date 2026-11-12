import { Logger } from "@hmcts/nodejs-logging";
const logger = Logger.getLogger("case-id-store");

logger.info("Import IKeyValueStore");
import { IKeyValueStore } from "./key-value-store-interface";
logger.info("Import getRedisClient");
import { getRedisClient } from "../redis/redis-client";
logger.info("Import MemoryStore");
import { MemoryStore } from "./memory-store";
logger.info("Import Redis");
import { Redis } from "ioredis";
logger.info("Import RedisStore");
import { RedisStore } from "./redis-store";

let store: IKeyValueStore | null = null;

logger.info("Before functions");
function getStore(): IKeyValueStore {
    logger.info("Getting store");

    if (store == null) {
        logger.info("Initialising store");
        const redisClient: Redis | null = getRedisClient();

        if (redisClient == null) {
            logger.info("Using memory store");
            store = new MemoryStore();
        } else {
            logger.info("Using Redis store");
            store = new RedisStore(redisClient);
        }
    }

    return store;
}

export function get(key: string): Promise<string | null> {
    return getStore().get(key);
}

export function set(key: string, value: number, ttl: number | null): Promise<string> {
    return getStore().set(key, value, ttl);
}

logger.info("After functions");
