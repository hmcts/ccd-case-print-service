import { getOrDefault } from "../util/config";
import * as store from "../store/case-id-store";
import { EnumerationAttemptError } from "./enumeration-attempt-error";
import { Logger } from "@hmcts/nodejs-logging";

const KEY_PREFIX: string = "probate-man-type";

const PROPERTY_ENUMERATION_CHECK_ENABLED: string = "guard.enumerationCheck.enabled";
const PROPERTY_ENUMERATION_LIMIT: string = "guard.enumerationCheck.limit";
const PROPERTY_ENUMERATION_TTL: string = "guard.enumerationCheck.ttl";

const DEFAULT_ENUMERATION_LIMIT: number = 1;

const logger = Logger.getLogger("enumeration-check-probate-man-type");

export function checkForEnumerationAttempt(userId: string, caseType: string, caseId: number): Promise<string> {
    if (isEnumerationCheckEnabled()) {
        return getPreviousCaseId(userId, caseType)
        .then((previousCaseId) => {
            logger.debug("Checking for enumeration attempt - userId: %s, caseType: %s, caseId: %s",
                userId, caseType, caseId);

            if (previousCaseId === null) {
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
    let isCheckEnabled: boolean | null = getOrDefault<boolean | null>(PROPERTY_ENUMERATION_CHECK_ENABLED, false);

    if (isCheckEnabled === null) {
        logger.debug("Enumeration check enabled property has no value, defaulting to false");
        isCheckEnabled = false;
    }

    logger.debug("Enumeration check enabled: %s", isCheckEnabled);
    return isCheckEnabled;
}

function getEnumerationLimit(): number {
    let enumerationLimit: number | null =
        getOrDefault<number | null>(PROPERTY_ENUMERATION_LIMIT, DEFAULT_ENUMERATION_LIMIT);

    if (enumerationLimit === null) {
        logger.debug("Enumeration limit property has no value, setting to default");
        enumerationLimit = DEFAULT_ENUMERATION_LIMIT;
    }

    logger.debug("Enumeration limit value: %s", enumerationLimit);
    return enumerationLimit;
}

function getEnumerationTTL(): number | null {
    const enumerationTtl: number | null = getOrDefault<number | null>(PROPERTY_ENUMERATION_TTL, null);

    logger.debug("Enumeration TTL value: %s", enumerationTtl ?? "<null>");
    return enumerationTtl;
}

function logEnumerationAttempt(userId: string, caseType: string, caseId: number, previousCaseId: string, diff: number) {
    logger.error("ENUMERATION ATTEMPT DETECTED - userId: %s, caseType: %s, caseId: %s, previousCaseId: %s, diff: %s",
        userId, caseType, caseId, previousCaseId, diff);
}
