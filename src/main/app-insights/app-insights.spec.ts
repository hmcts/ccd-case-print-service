import { expect } from "chai";

const enableAppInsights = require("./app-insights");

describe("Application insights", () => {
  it("should initialize properly", () => {
    expect(enableAppInsights).to.not.throw();
  });
});
