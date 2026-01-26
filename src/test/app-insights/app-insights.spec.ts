import { expect } from "chai";

const enableAppInsights = require("../../main/app-insights/app-insights");

describe("Application insights", () => {
  it("should initialize properly", () => {
    expect(enableAppInsights).to.not.throw();
  });
});
