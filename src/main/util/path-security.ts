import * as express from "express";
import * as fs from "fs";
import * as path from "path";

export function isPathInside(rootPath: string, targetPath: string): boolean {
  const relativePath = path.relative(rootPath, targetPath);
  return relativePath === "" || (relativePath.indexOf("..") !== 0 && !path.isAbsolute(relativePath));
}

export function resolvePathInside(rootPath: string, ...segments: string[]): string {
  const resolvedRootPath = path.resolve(rootPath);
  const resolvedTargetPath = path.resolve(resolvedRootPath, ...segments);

  if (!isPathInside(resolvedRootPath, resolvedTargetPath)) {
    throw new Error("Resolved path escapes the configured root directory");
  }

  const realRootPath = fs.realpathSync(resolvedRootPath);
  const realTargetPath = fs.realpathSync(resolvedTargetPath);

  if (!isPathInside(realRootPath, realTargetPath)) {
    throw new Error("Resolved path escapes the configured root directory through a symbolic link");
  }

  return realTargetPath;
}

export function createStaticPathGuard(rootPath: string): express.RequestHandler {
  const resolvedRootPath = path.resolve(rootPath);
  const realRootPath = fs.realpathSync(resolvedRootPath);

  return (req, res, next) => {
    let requestedPath: string;

    try {
      requestedPath = decodeURIComponent(req.path);
    } catch (error) {
      res.status(400).send("Bad Request");
      return;
    }

    if (requestedPath.indexOf("\0") !== -1 || requestedPath.indexOf("\\") !== -1) {
      res.status(400).send("Bad Request");
      return;
    }

    const resolvedRequestedPath = path.resolve(resolvedRootPath, "." + requestedPath);

    if (!isPathInside(resolvedRootPath, resolvedRequestedPath)) {
      res.status(403).send("Forbidden");
      return;
    }

    fs.realpath(resolvedRequestedPath, (err: NodeJS.ErrnoException, realRequestedPath: string) => {
      if (err) {
        if (err.code === "ENOENT" || err.code === "ENOTDIR") {
          next();
          return;
        }

        next(err);
        return;
      }

      if (!isPathInside(realRootPath, realRequestedPath)) {
        res.status(403).send("Forbidden");
        return;
      }

      next();
    });
  };
}
