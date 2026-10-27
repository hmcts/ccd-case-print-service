import * as config from "config";
import * as store from "../store/case-id-store";
import { EnumerationAttemptError } from "./enumeration-attempt-error";
import { Logger } from "@hmcts/nodejs-logging";

const KEY_PREFIX: string = "probate-man-type";

const PROPERTY_ENUMERATION_CHECK_ENABLED: string = "enumerationCheck.enabled";
const PROPERTY_ENUMERATION_LIMIT: string = "enumerationCheck.limit";
const PROPERTY_ENUMERATION_TTL: string = "enumerationCheck.ttl";

const DEFAULT_ENUMERATION_LIMIT: number = 1;

const logger = Logger.getLogger("enumeration-check-probate-man-type");

export function checkForEnumerationAttempt(userId: string, caseType: string, caseId: number): Promise<string> {
    if (isEnumerationCheckEnabled()) {
        return getPreviousCaseId(userId, caseType)
        .then((previousCaseId) => {
            logger.debug("Checking for enumeration attempt - userId: %s, caseType: %s, caseId: %s",
                userId, caseType, caseId);

            if (previousCaseId == null) {
                logger.debug("No previous caseId found, store current caseId - userId: %s, caseType: %s, caseId: %s",
                    userId, caseType, caseId);
                return updatePreviousCaseId(userId, caseType, caseId);
            }

            const numPreviousCaseId = Number.parseInt(previousCaseId, 10);
            const diff = Math.abs(caseId - numPreviousCaseId);

            logger.debug("Comparing caseId with previous caseId - userId: %s, caseType: %s, caseId: %s, previousCaseId: %s",
                userId, caseType, caseId, numPreviousCaseId);
            if (diff > 0 && diff <= getEnumerationLimit()) {
                logEnumerationAttempt(userId, caseType, caseId, previousCaseId, diff);
                throw new EnumerationAttemptError("ENUMERATION ATTEMPT", "Not Found", 404);
            }

            if (diff !== 0) {
                logger.debug("Replace previous caseId with current caseId - userId: %s, caseType: %s, caseId: %s, previousCaseId: %s",
                    userId, caseType, caseId, previousCaseId);
                return updatePreviousCaseId(userId, caseType, caseId);
            }

            logger.debug("Current caseId matches previous caseId - userId: %s, caseType: %s, caseId: %s, previousCaseId: %s",
                userId, caseType, caseId, previousCaseId);
            return "OK";
        });
    }
    logger.debug("Enumeration check not enabled");
    return Promise.resolve("OK");
}

function createStoreKey(userId: string, caseType: string): string {
    return KEY_PREFIX + ":" + userId + ":" + caseType;
}

function getPreviousCaseId(userId: string, caseType: string): Promise<string | null> {
    const key = createStoreKey(userId, caseType);
    return store.get(key);
}

function updatePreviousCaseId(userId: string, caseType: string, caseId: number): Promise<string> {
    const key = createStoreKey(userId, caseType);
    return store.set(key, caseId, getEnumerationTTL());
}

function isEnumerationCheckEnabled(): boolean {
    if (config.has(PROPERTY_ENUMERATION_CHECK_ENABLED)) {
        logger.debug("Enumeration check enabled property exists in config");

        const checkEnabled: boolean = config.get(PROPERTY_ENUMERATION_CHECK_ENABLED) || false;
        logger.debug("Enumeration check enabled: %s", checkEnabled);

        return checkEnabled;
    }

    logger.debug("Enumeration check enabled property does not exist in config, defaulting to false");
    return false;
}

function getEnumerationLimit(): number {
    if (config.has(PROPERTY_ENUMERATION_LIMIT)) {
        logger.debug("Enumeration limit property exists in config");

        const enumerationLimit: number = config.get(PROPERTY_ENUMERATION_LIMIT) || DEFAULT_ENUMERATION_LIMIT;
        logger.debug("Enumeration limit value: %s", enumerationLimit);

        return enumerationLimit;
    }

    logger.debug("Enumeration limit property does not exist in config, using default value");
    return DEFAULT_ENUMERATION_LIMIT;
}

function getEnumerationTTL(): number | null {
    if (config.has(PROPERTY_ENUMERATION_TTL)) {
        logger.debug("Enumeration TTL property exists in config");

        return config.get(PROPERTY_ENUMERATION_TTL);
    }

    logger.debug("Enumeration TTL property does not exist in config");
    return null;
}

function logEnumerationAttempt(userId: string, caseType: string, caseId: number, previousCaseId: string, diff: number) {
    logger.error("ENUMERATION ATTEMPT DETECTED - userId: %s, caseType: %s, caseId: %s, previousCaseId: %s, diff: %s",
        userId, caseType, caseId, previousCaseId, diff);
}
