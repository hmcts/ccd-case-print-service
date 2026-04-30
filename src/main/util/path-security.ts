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

  return resolvedTargetPath;
}
