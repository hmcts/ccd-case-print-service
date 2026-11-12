import { Router } from "express";
import * as requireDirectory from "require-directory";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("routerFinder");

const options: object = {
  extensions: ["ts", "js"],
  recurse: true,
  visit: (obj: any) => {
    logger.info("Visit: " + obj);
    return (typeof obj === "object" && obj.default !== undefined) ? obj.default : obj;
  },
};

export class RouterFinder {

  public static findAll(path: string): Router[] {
    logger.info("findAll: %s", path);
    return Object.values(requireDirectory(module, path, options));
  }

}
