import config from "config";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("config");
  
export function getOrThrow<T>(key: string): T {
  try {
    if (config.has(key)) {
      return config.get<T>(key);
    }
  } catch (error: any) {
    logger.error(`Error retrieving config for ${key}: ${error.message}`, error?.status, error?.statusText);
  }
  throw new Error(`${key} is not set in config`);
}

export function getOrDefault<T>(key: string, defaultValue: T): T {
  try {
    if (config.has(key)) {
      return config.get<T>(key);
    }
  } catch (error: any) {
    logger.warn(`Error retrieving config for ${key} - using default value: ${defaultValue}`);
  }
  return defaultValue;
}
