import { expect } from "chai";

const verifier = require("../../../scripts/verify-diff-resolution.cjs");

describe("verify diff resolution", () => {
  const validPackageJson = {
    resolutions: {
      diff: "^8.0.3",
    },
  };

  const validLockfile = [
    '"diff@npm:^8.0.3":',
    "  version: 8.0.3",
    '  resolution: "diff@npm:8.0.3"',
  ].join("\n");

  const validWhyOutput = [
    JSON.stringify({
      children: {
        "diff@npm:8.0.3": {
          descriptor: "diff@npm:^8.0.3",
          locator: "diff@npm:8.0.3",
        },
      },
      value: "mocha@npm:5.2.0",
    }),
    JSON.stringify({
      children: {
        "diff@npm:8.0.3": {
          descriptor: "diff@npm:^8.0.3",
          locator: "diff@npm:8.0.3",
        },
      },
      value: "ts-node@npm:10.9.2",
    }),
  ].join("\n");

  it("should extract diff consumers from yarn why output", () => {
    const parsed = verifier.parseWhyOutput(validWhyOutput);

    expect(parsed).to.deep.equal([
      {
        descriptor: "diff@npm:^8.0.3",
        locator: "diff@npm:8.0.3",
        parent: "mocha@npm:5.2.0",
      },
      {
        descriptor: "diff@npm:^8.0.3",
        locator: "diff@npm:8.0.3",
        parent: "ts-node@npm:10.9.2",
      },
    ]);
  });

  it("should accept the pinned diff mitigation state", () => {
    const result = verifier.inspectState({
      lockfileText: validLockfile,
      packageJson: validPackageJson,
      whyOutput: validWhyOutput,
    });

    expect(result.errors).to.deep.equal([]);
    expect(result.parents).to.deep.equal([
      "mocha@npm:5.2.0",
      "ts-node@npm:10.9.2",
    ]);
  });

  it("should reject extra diff lockfile entries", () => {
    const result = verifier.inspectState({
      lockfileText: `${validLockfile}\n\n"diff@npm:^4.0.0":\n  version: 4.0.2\n  resolution: "diff@npm:4.0.2"`,
      packageJson: validPackageJson,
      whyOutput: validWhyOutput,
    });

    expect(result.errors.join(" ")).to.contain("Expected a single diff lockfile entry");
  });

  it("should ignore packages whose names only contain diff", () => {
    const result = verifier.inspectState({
      lockfileText: `${validLockfile}\n\n"arr-diff@npm:^4.0.0":\n  version: 4.0.0\n  resolution: "arr-diff@npm:4.0.0"`,
      packageJson: validPackageJson,
      whyOutput: validWhyOutput,
    });

    expect(result.errors).to.deep.equal([]);
  });
});
