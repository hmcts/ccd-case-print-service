import { getOrDefault, getOrThrow } from "../util/config";
import { ConnectionOptions } from "node:tls";
import { Logger } from "@hmcts/nodejs-logging";
import { Redis } from "ioredis";

const PROPERTY_REDIS_ENABLED: string = "redis.enabled";
const PROPERTY_REDIS_HOST: string = "secrets.ccd.case-print-service-managed-redis-host";
const PROPERTY_REDIS_PORT: string = "secrets.ccd.case-print-service-managed-redis-port";
const PROPERTY_REDIS_KEY: string = "secrets.ccd.case-print-service-managed-redis-primary-access-key";
const PROPERTY_REDIS_TLS_ENABLED: string = "redis.tlsEnabled";

const logger = Logger.getLogger("redis-client");

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
    logger.debug("Getting Redis client");

    if (!isRedisEnabled()) {
        logger.debug("Redis is not enabled");
        return null;
    }

    if (redisClient === null) {
        logger.debug("Initialising Redis client");

        redisClient = new Redis({
            host: getRedisHost(),
            password: getRedisKey(),
            port: getRedisPort(),
            tls: getRedisTlsSettings()
        });

        redisClient
            .on("error", (err) => logger.error("Redis error: %s", err))
            .on("connect", () => logger.info("Connected to Redis"));
    }

    return redisClient;
}

function isRedisEnabled(): boolean {
    let isEnabled: boolean | null = getOrDefault<boolean | null>(PROPERTY_REDIS_ENABLED, false);

    if (isEnabled === null) {
        logger.debug("Redis enabled property has no value, defaulting to false");
        isEnabled = false;
    }

    logger.debug("Redis enabled: %s", isEnabled);
    return isEnabled;
}

function getRedisHost(): string {
    const host: string = getOrThrow<string>(PROPERTY_REDIS_HOST);
    logger.debug("Redis host: %s", host);
    return host;
}

function getRedisPort(): number {
    const port: number = getOrThrow<number>(PROPERTY_REDIS_PORT);
    logger.debug("Redis port: %s", port);
    return port;
}

function getRedisKey(): string | undefined {
    const key: string | null = getOrThrow<string | null>(PROPERTY_REDIS_KEY);
    logger.debug("Redis key: %s", key === null ? "<null>" : "<redacted>");
    return key ?? undefined;
}

function isRedisTlsEnabled(): boolean {
    let isTlsEnabled: boolean | null = getOrDefault<boolean | null>(PROPERTY_REDIS_TLS_ENABLED, false);

    if (isTlsEnabled === null) {
        logger.debug("Redis TLS enabled property has no value, defaulting to false");
        isTlsEnabled = false;
    }

    logger.debug("Redis TLS enabled: %s", isTlsEnabled);
    return isTlsEnabled;
}

function getRedisTlsSettings(): ConnectionOptions | undefined {
    logger.debug("Getting Redis TLS settings");
    if (isRedisTlsEnabled()) {
        return {};
    } else {
        return undefined;
    }
}
