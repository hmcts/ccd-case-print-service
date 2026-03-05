#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

const REQUIRED_RANGE = "^8.0.3";
const REQUIRED_VERSION = "8.0.3";
const REQUIRED_DESCRIPTOR = `diff@npm:${REQUIRED_RANGE}`;
const REQUIRED_LOCATOR = `diff@npm:${REQUIRED_VERSION}`;
const CVE_ID = "CVE-2026-24001";

function parseWhyOutput(output) {
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      const parsedLine = JSON.parse(line);
      return Object.values(parsedLine.children || {})
        .filter((child) => child.locator && child.locator.startsWith("diff@npm:"))
        .map((child) => ({
          parent: parsedLine.value,
          locator: child.locator,
          descriptor: child.descriptor,
        }));
    });
}

function getDiffLockEntries(lockfileText) {
  const entries = [];
  const lockEntryPattern = /^"?(diff@npm:[^"\n]*)"?:\n  version: ([^\n]+)\n  resolution: "([^"]+)"/gm;
  let match;

  while ((match = lockEntryPattern.exec(lockfileText)) !== null) {
    entries.push({
      keys: match[1].split(/,\s*/).filter(Boolean),
      version: match[2].trim(),
      resolution: match[3].trim(),
    });
  }

  return entries;
}

function inspectState({ packageJson, lockfileText, whyOutput }) {
  const errors = [];
  const resolution = packageJson.resolutions && packageJson.resolutions.diff;
  const lockEntries = getDiffLockEntries(lockfileText);
  const whyEntries = parseWhyOutput(whyOutput);
  const parents = [...new Set(whyEntries.map((entry) => entry.parent))].sort();

  if (resolution !== REQUIRED_RANGE) {
    errors.push(`Expected package.json resolutions.diff to be ${REQUIRED_RANGE}, found ${resolution || "missing"}.`);
  }

  if (lockEntries.length !== 1) {
    errors.push(`Expected a single diff lockfile entry, found ${lockEntries.length}.`);
  }

  lockEntries.forEach((entry) => {
    if (entry.keys.length !== 1 || entry.keys[0] !== REQUIRED_DESCRIPTOR) {
      errors.push(`Unexpected diff lockfile keys: ${entry.keys.join(", ")}.`);
    }

    if (entry.version !== REQUIRED_VERSION) {
      errors.push(`Expected diff lockfile version ${REQUIRED_VERSION}, found ${entry.version}.`);
    }

    if (entry.resolution !== REQUIRED_LOCATOR) {
      errors.push(`Expected diff lockfile resolution ${REQUIRED_LOCATOR}, found ${entry.resolution}.`);
    }
  });

  if (whyEntries.length === 0) {
    errors.push("Expected yarn why diff to report at least one consumer.");
  }

  whyEntries.forEach((entry) => {
    if (entry.locator !== REQUIRED_LOCATOR) {
      errors.push(`Unexpected diff locator for ${entry.parent}: ${entry.locator}.`);
    }

    if (entry.descriptor !== REQUIRED_DESCRIPTOR) {
      errors.push(`Unexpected diff descriptor for ${entry.parent}: ${entry.descriptor}.`);
    }
  });

  return {
    errors,
    parents,
    resolution,
    lockEntries,
    whyEntries,
  };
}

function formatSuccess(result) {
  return [
    `Verified ${CVE_ID} mitigation: resolutions.diff=${result.resolution}.`,
    `yarn.lock resolves diff only as ${REQUIRED_LOCATOR}.`,
    `yarn why diff consumers: ${result.parents.join(", ")}.`,
  ].join(" ");
}

function verifyState(input) {
  const result = inspectState(input);

  if (result.errors.length > 0) {
    throw new Error(`${CVE_ID} mitigation check failed\n- ${result.errors.join("\n- ")}`);
  }

  return result;
}

function readRepositoryState() {
  return {
    packageJson: JSON.parse(fs.readFileSync("package.json", "utf8")),
    lockfileText: fs.readFileSync("yarn.lock", "utf8"),
    whyOutput: execSync("yarn why diff --json", { encoding: "utf8" }),
  };
}

if (require.main === module) {
  try {
    const result = verifyState(readRepositoryState());
    console.log(formatSuccess(result));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  REQUIRED_DESCRIPTOR,
  REQUIRED_LOCATOR,
  REQUIRED_RANGE,
  REQUIRED_VERSION,
  formatSuccess,
  getDiffLockEntries,
  inspectState,
  parseWhyOutput,
  verifyState,
};
