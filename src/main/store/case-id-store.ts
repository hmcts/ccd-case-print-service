import { IKeyValueStore } from "./key-value-store-interface";
import { getRedisClient } from "redis/redis-client";
import { Logger } from "@hmcts/nodejs-logging";
import { MemoryStore } from "./memory-store";
import { Redis } from "ioredis";
import { RedisStore } from "./redis-store";

const logger = Logger.getLogger("case-id-store");

let store: IKeyValueStore | null = null;

function getStore(): IKeyValueStore {

    if (store == null) {
        logger.debug("Initialising store");
        const redisClient: Redis | null = getRedisClient();

        if (redisClient == null) {
            logger.debug("Using memory store");
            store = new MemoryStore();
        } else {
            logger.debug("Using Redis store");
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
