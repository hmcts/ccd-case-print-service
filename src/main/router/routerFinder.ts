import { Router } from "express";
import * as path from "path";
import * as requireDirectory from "require-directory";
import { assertNoSymlinksInDirectory, resolveAppPath, resolvePathWithin } from "../util/secure-path";

const ROUTES_PATH = resolveAppPath("routes");

const options: object = {
  extensions: ["ts", "js"],
  recurse: true,
  visit: (obj: any) => {
    return (typeof obj === "object" && obj.default !== undefined) ? obj.default : obj;
  },
};

export class RouterFinder {

  public static findAll(routesPath: string = ROUTES_PATH): Router[] {
    const safeRoutesPath = RouterFinder.resolveRoutesPath(routesPath);
    assertNoSymlinksInDirectory(safeRoutesPath);

    return Object.values(requireDirectory(module, safeRoutesPath, options));
  }

  private static resolveRoutesPath(routesPath: string): string {
    const normalizedRoutesPath = path.resolve(routesPath);
    const relativePath = path.relative(ROUTES_PATH, normalizedRoutesPath);

    if (relativePath === "") {
      return ROUTES_PATH;
    }

    return resolvePathWithin(ROUTES_PATH, relativePath);
  }

}
