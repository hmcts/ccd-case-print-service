import { default as config } from "config";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("config");
  
export function getOrThrow<T>(key: string): T {
  try {
    if (config.has(key)) {
      return config.get<T>(key);
    }
  } catch (err: any) {
    logger.error(`Error retrieving config for ${key}: ${err.message}`, err);
  }
  throw new Error(`${key} is not set in config`);
}

export function getOrDefault<T>(key: string, defaultValue: T): T {
  try {
    if (config.has(key)) {
      return config.get<T>(key);
    }
  } catch (err: any) {
    logger.warn(`Error retrieving config for ${key} - using default value: ${defaultValue}`);
  }
  return defaultValue;
}
