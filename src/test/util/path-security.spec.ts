import { expect } from "chai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { createStaticPathGuard, resolvePathInside } from "../../main/util/path-security";

describe("path security", () => {
  let rootPath: string;
  let outsidePath: string;

  beforeEach(() => {
    rootPath = fs.mkdtempSync(path.join(os.tmpdir(), "static-root-"));
    outsidePath = fs.mkdtempSync(path.join(os.tmpdir(), "outside-root-"));
  });

  afterEach(() => {
    removeEntry(rootPath);
    removeEntry(outsidePath);
  });

  it("allows files that resolve inside the configured root", async () => {
    fs.writeFileSync(path.join(rootPath, "safe.txt"), "safe");

    const result = await runStaticGuard(rootPath, "/safe.txt");

    expect(result.nextCalled).to.equal(true);
    expect(result.statusCode).to.equal(undefined);
  });

  it("rejects encoded traversal outside the configured root", async () => {
    const result = await runStaticGuard(rootPath, "/%2e%2e/secret.txt");

    expect(result.nextCalled).to.equal(false);
    expect(result.statusCode).to.equal(403);
    expect(result.body).to.equal("Forbidden");
  });

  it("rejects static files that escape through a symbolic link", async () => {
    const secretPath = path.join(outsidePath, "secret.txt");
    fs.writeFileSync(secretPath, "secret");
    fs.symlinkSync(secretPath, path.join(rootPath, "secret-link.txt"));

    const result = await runStaticGuard(rootPath, "/secret-link.txt");

    expect(result.nextCalled).to.equal(false);
    expect(result.statusCode).to.equal(403);
    expect(result.body).to.equal("Forbidden");
  });

  it("rejects symlink escapes when resolving fixed application paths", () => {
    const secretPath = path.join(outsidePath, "secret.txt");
    fs.writeFileSync(secretPath, "secret");
    fs.symlinkSync(secretPath, path.join(rootPath, "secret-link.txt"));

    expect(() => resolvePathInside(rootPath, "secret-link.txt")).to.throw(
      "Resolved path escapes the configured root directory through a symbolic link",
    );
  });
});

function runStaticGuard(rootPath: string, requestPath: string): Promise<any> {
  const result: any = {
    nextCalled: false,
  };

  const response: any = {
    send: (body) => {
      result.body = body;
      return Promise.resolve(result);
    },
    status: (statusCode) => {
      result.statusCode = statusCode;
      return response;
    },
  };

  return new Promise((resolve) => {
    response.send = (body) => {
      result.body = body;
      resolve(result);
      return response;
    };

    createStaticPathGuard(rootPath)(
      {path: requestPath} as any,
      response,
      (err) => {
        result.error = err;
        result.nextCalled = true;
        resolve(result);
      },
    );
  });
}

function removeEntry(entryPath: string) {
  try {
    const stats = fs.lstatSync(entryPath);

    if (stats.isDirectory() && !stats.isSymbolicLink()) {
      fs.readdirSync(entryPath).forEach((child) => removeEntry(path.join(entryPath, child)));
      fs.rmdirSync(entryPath);
      return;
    }

    fs.unlinkSync(entryPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
