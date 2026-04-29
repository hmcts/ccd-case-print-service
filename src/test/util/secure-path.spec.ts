import { expect } from "chai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { assertNoSymlinksInDirectory, resolvePathWithin } from "../../main/util/secure-path";

describe("secure path", () => {
  let tempRoot: string;
  let allowedPath: string;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "secure-path-"));
    allowedPath = path.join(tempRoot, "allowed");

    fs.mkdirSync(allowedPath);
    fs.writeFileSync(path.join(allowedPath, "file.txt"), "safe");
  });

  afterEach(() => {
    removePath(tempRoot);
  });

  it("resolves an existing path inside the base directory", () => {
    const resolvedPath = resolvePathWithin(tempRoot, "allowed", "file.txt");

    expect(resolvedPath).to.equal(fs.realpathSync(path.join(allowedPath, "file.txt")));
  });

  it("rejects path traversal outside the base directory", () => {
    expect(() => resolvePathWithin(tempRoot, "..")).to.throw("outside of the allowed application directory");
  });

  it("rejects a symbolic link path component", () => {
    fs.symlinkSync(os.tmpdir(), path.join(allowedPath, "linked-temp"), "dir");

    expect(() => resolvePathWithin(tempRoot, "allowed", "linked-temp")).to.throw("Symbolic links are not allowed");
  });

  it("rejects symbolic links contained in a directory tree", () => {
    fs.symlinkSync(os.tmpdir(), path.join(allowedPath, "linked-temp"), "dir");

    expect(() => assertNoSymlinksInDirectory(allowedPath)).to.throw("Symbolic links are not allowed");
  });
});

function removePath(targetPath: string): void {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const targetStats = fs.lstatSync(targetPath);

  if (!targetStats.isDirectory() || targetStats.isSymbolicLink()) {
    fs.unlinkSync(targetPath);
    return;
  }

  fs.readdirSync(targetPath).forEach((entryName) => {
    removePath(path.join(targetPath, entryName));
  });
  fs.rmdirSync(targetPath);
}
