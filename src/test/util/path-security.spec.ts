import { expect } from "chai";
import * as path from "path";
import { isPathInside, resolvePathInside } from "../../main/util/path-security";

describe("path security", () => {
  const rootPath = path.resolve("/app/src/main");

  it("detects paths inside a configured root", () => {
    expect(isPathInside(rootPath, path.join(rootPath, "public", "favicon.ico"))).to.equal(true);
  });

  it("detects paths outside a configured root", () => {
    expect(isPathInside(rootPath, path.resolve(rootPath, "..", "secret.txt"))).to.equal(false);
  });

  it("resolves fixed application paths inside a configured root", () => {
    expect(resolvePathInside(rootPath, "public", "img", "favicon.ico"))
      .to.equal(path.join(rootPath, "public", "img", "favicon.ico"));
  });

  it("rejects fixed application paths outside a configured root", () => {
    expect(() => resolvePathInside(rootPath, "..", "secret.txt")).to.throw(
      "Resolved path escapes the configured root directory",
    );
  });
});
