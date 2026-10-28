import { IKeyValueStore } from "./key-value-store-interface";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("memory-store");

export class MemoryStore implements IKeyValueStore {

    private readonly caseIdData = new Map<string, { value: string, expiresAt: number | null }>();

    public get(key: string): Promise<string | null> {
        logger.debug("Getting entry from memory store - key: %s", key);
        const result = this.caseIdData.get(key);

        if (result === undefined) {
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

    public set(key: string, value: number, ttl: number | null): Promise<string> {
        const valueStr: string = value.toString();
        const expiresDateTime: number | null = ttl == null ? null : Date.now() + ttl * 1000;

        logger.debug("Adding/updating entry in memory store - key: %s, value: %s, ttl: %s",
            key, valueStr, expiresDateTime == null ? "null" : expiresDateTime);
        this.caseIdData.set(key, { value: valueStr, expiresAt: expiresDateTime});

        return Promise.resolve("OK");
    }
}
