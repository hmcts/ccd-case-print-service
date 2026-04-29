import * as fs from "fs";
import * as path from "path";

const APP_ROOT = path.resolve(__dirname, "..");
const OUTSIDE_ALLOWED_PATH_ERROR = "Resolved path is outside of the allowed application directory";
const SYMBOLIC_LINK_ERROR = "Symbolic links are not allowed in application paths";

export function resolveAppPath(...segments: string[]): string {
  return resolvePathWithin(APP_ROOT, ...segments);
}

export function resolvePathWithin(basePath: string, ...segments: string[]): string {
  const baseRealPath = fs.realpathSync(basePath);
  const candidatePath = path.resolve(baseRealPath, ...segments);

  assertPathInside(baseRealPath, candidatePath);
  assertPathContainsNoSymlinks(baseRealPath, candidatePath);

  const candidateRealPath = fs.realpathSync(candidatePath);
  assertPathInside(baseRealPath, candidateRealPath);

  return candidateRealPath;
}

export function assertNoSymlinksInDirectory(directoryPath: string): void {
  if (fs.lstatSync(directoryPath).isSymbolicLink()) {
    throw new Error(SYMBOLIC_LINK_ERROR);
  }

  const realDirectoryPath = fs.realpathSync(directoryPath);
  assertDirectoryContainsNoSymlinks(realDirectoryPath);
}

function assertPathInside(basePath: string, candidatePath: string): void {
  const relativePath = path.relative(basePath, candidatePath);

  if (relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))) {
    return;
  }

  throw new Error(OUTSIDE_ALLOWED_PATH_ERROR);
}

function assertPathContainsNoSymlinks(basePath: string, candidatePath: string): void {
  const relativePath = path.relative(basePath, candidatePath);
  const pathParts = relativePath.split(path.sep).filter((pathPart) => pathPart !== "");
  let currentPath = basePath;

  pathParts.forEach((pathPart) => {
    currentPath = path.join(currentPath, pathPart);

    if (fs.lstatSync(currentPath).isSymbolicLink()) {
      throw new Error(SYMBOLIC_LINK_ERROR);
    }
  });
}

function assertDirectoryContainsNoSymlinks(directoryPath: string): void {
  fs.readdirSync(directoryPath).forEach((entryName) => {
    const entryPath = path.join(directoryPath, entryName);
    const entryStats = fs.lstatSync(entryPath);

    if (entryStats.isSymbolicLink()) {
      throw new Error(SYMBOLIC_LINK_ERROR);
    }

    if (entryStats.isDirectory()) {
      assertDirectoryContainsNoSymlinks(entryPath);
    }
  });
}
