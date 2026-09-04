import { expect } from "chai";
import proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("Application insights", () => {

  let appInsightsInstance;
  let config;
  let appInsights;

  beforeEach(() => {

    config = {
      getOrDefault: sinon.stub(),
      getOrThrow: sinon.stub()
    };

    config.getOrDefault.withArgs("appInsights.enabled", false).returns(true);
    config.getOrThrow.withArgs("secrets.ccd.AppInsightsInstrumentationKey").returns("AAAA");
    config.getOrThrow.withArgs("appInsights.roleName").returns("test-role");

    const addTelemetryProcessor = sinon.stub();

    appInsights = {
      setup: sinon.stub(),
      defaultClient: {
        context: {
          tags: {},
          keys: { cloudRole: "cloudRole" }
        },
        addTelemetryProcessor
      },
      start: sinon.stub(),
      setAutoDependencyCorrelation: sinon.stub(),
      setAutoCollectConsole: sinon.stub()
    };

    appInsights.setup.returns(appInsights);
    appInsights.setAutoDependencyCorrelation.returns(appInsights);
    appInsights.start.returns(appInsights);

    appInsightsInstance = proxyquire("../../main/app-insights/app-insights", {
      "../util/config": config,
      "applicationinsights": appInsights
    });
  });

  it("should initialize properly", () => {
    try {
      appInsightsInstance.enableAppInsights();
    } catch (e) {
      expect.fail("enableAppInsights threw an error: " + e);
    }
    expect(config.getOrDefault.calledWith("appInsights.enabled"), "expected appInsights.enabled").to.be.true;
    expect(config.getOrThrow.calledWith("secrets.ccd.AppInsightsInstrumentationKey"), "expected secrets.ccd.AppInsightsInstrumentationKey").to.be.true;
    expect(config.getOrThrow.calledWith("appInsights.roleName"), "expected appInsights.roleName").to.be.true;
    expect(appInsights.setup.calledWith("AAAA"), "expected setup to be called with instrumentation key").to.be.true;
    expect(appInsights.start.calledOnce, "expected start to be called once").to.be.true;
    expect(appInsights.defaultClient.addTelemetryProcessor.calledOnce, "expected telemetry processor to be set").to.be.true;
    expect(appInsights.defaultClient.context.tags.cloudRole, "expected cloud role to be set").to.equal("test-role");
  });
});
