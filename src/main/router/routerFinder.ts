import { Router } from "express";
import * as path from "path";
import * as requireDirectory from "require-directory";
import { resolvePathInside } from "../util/path-security";

const options: object = {
  extensions: ["ts", "js"],
  recurse: true,
  visit: (obj: any) => {
    return (typeof obj === "object" && obj.default !== undefined) ? obj.default : obj;
  },
};

export class RouterFinder {

  public static findAll(): Router[] {
    const routesDirectory = resolvePathInside(path.resolve(__dirname, ".."), "routes");
    return Object.values(requireDirectory(module, routesDirectory, options));
  }

}
