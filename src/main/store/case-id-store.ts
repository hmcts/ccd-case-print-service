import * as config from "config";
import { IKeyValueStore } from "./key-value-store-interface";
import { Logger } from "@hmcts/nodejs-logging";
import { MemoryStore } from "./memory-store";
import { RedisStore } from "./redis-store";

const PROPERTY_REDIS_ENABLED = "redis.enabled";
const PROPERTY_REDIS_HOST = "redis.host";
const PROPERTY_REDIS_PORT = "redis.port";

const logger = Logger.getLogger("case-id-store");

let store: IKeyValueStore | null = null;

function getStore(): IKeyValueStore {

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

export function get(key: string): Promise<string | null> {
    return getStore().get(key);
}

export function set(key: string, value: number, ttl: number | null): Promise<string> {
    return getStore().set(key, value, ttl);
}
