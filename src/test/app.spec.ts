import { expect } from "chai";
import * as config from "config";
import * as proxyquire from "proxyquire";

describe("app", () => {
  it("should initialize when CSRF protection is disabled", () => {
    const configStub = {
      get: <T>(key: string): T => key === "useCSRFProtection" ? false as any : config.get<T>(key),
    };

    const appModule = proxyquire.noPreserveCache()("../main/app", {
      "./app-insights/app-insights": () => undefined,
      "config": configStub,
    });

    expect(appModule.app).to.exist;
  }).timeout(10000);
});
