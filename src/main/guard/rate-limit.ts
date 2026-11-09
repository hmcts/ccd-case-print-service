import * as config from "config";
import { AppRequest, RequestHandler } from "express";
import { Logger } from "@hmcts/nodejs-logging";
import { getRedisClient } from "redis/redis-client";
import { rateLimit } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";

const PROPERTY_RATE_LIMIT_WINDOW_PERIOD: string = "guard.rateLimit.windowPeriod";
const PROPERTY_RATE_LIMIT_REQUEST_LIMIT: string = "guard.rateLimit.requestLimit";

const KEY_PREFIX: string = "rate-limit:";

const logger = Logger.getLogger("rate-limit");

export const createRateLimiter = (): RequestHandler => {
    return rateLimit({
        keyGenerator: (req) => createKey(req),
        limit: getRequestLimit(),
        logger: {
            error: (error, message?: string) => logger.error(message || "Rate limit error", error),
            warn: (error, message?: string) => logger.warn(message || error),
        },
        store: getStore(),
        windowMs: getWindowPeriod(),
    });
};

function getWindowPeriod(): number {
    const windowPeriodSeconds: number = config.get(PROPERTY_RATE_LIMIT_WINDOW_PERIOD);
    logger.debug("Rate limit window period: %s seconds", windowPeriodSeconds);

    return convertToMilliseconds(windowPeriodSeconds);
}

function convertToMilliseconds(seconds: number): number {
    return seconds * 1000;
}

function getRequestLimit(): number {
    const requestLimit: number = config.get(PROPERTY_RATE_LIMIT_REQUEST_LIMIT);
    logger.debug("Rate limit request limit: %s request(s)", requestLimit);

    return requestLimit;
}

function createKey(request: AppRequest): string {
    return KEY_PREFIX + request.authentication.user.uid;
}

function getStore(): RedisStore | undefined {
    const redisClient = getRedisClient();

    if (redisClient == null) {
        logger.debug("Rate limit using memory store");
        return undefined;
    }

    logger.debug("Rate limit using Redis store");
    return new RedisStore({
        prefix: "",
        sendCommand: (command: string, ...args: string[]) => redisClient.call(command, ...args) as Promise<RedisReply>,
    });
}
