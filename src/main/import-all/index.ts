import fs from "fs";
import path from "node:path";

export const importAll = (importPath) => {
  return fs.readdirSync(importPath)
    .filter((fileName) => {
      const regex = /\.(js|ts)$/;
      return regex.exec(fileName);
    })
    .map((fileName) => {
      return require(path.join(importPath, fileName)); // eslint-disable-line @typescript-eslint/no-require-imports
    })
    .map((module) => {
      return module.default || module;
    })
    .filter((module) => {
      return Boolean(module);
    });
};
