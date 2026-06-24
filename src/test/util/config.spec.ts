import { expect } from "chai";
import { getOrThrow, getOrDefault } from "../../main/util/config";

describe("test config", () => {
  it("should load the configuration correctly", () => {
    const configValue = getOrThrow<string>("session.cookieName");
    expect(configValue).to.equal("SESSION_ID");
  });

  it("should throw an error if a required configuration value is missing", () => {
    expect(() => getOrThrow<string>("nonExistentConfigKey")).to.throw("nonExistentConfigKey is not set in config");
  });

  it("should return the default value if a configuration value is missing and a default is provided", () => {
    const defaultValue = "default";
    const configValue = getOrDefault<string>("nonExistentConfigKey", defaultValue);
    expect(configValue).to.equal(defaultValue);
  });
});
