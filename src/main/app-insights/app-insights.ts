import { getOrThrow, getOrDefault } from "../util/config";
import { setup, defaultClient, start } from "applicationinsights";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("app-insights");

function fineGrainedSampling(envelope) {
  if (
    ["RequestData", "RemoteDependencyData"].includes(envelope.data.baseType) &&
    envelope.data.baseData.name.includes("/health")
  ) {
    envelope.sampleRate = 1;
  }

  return true;
}

export function enableAppInsights(): void {
  if (getOrDefault<boolean>("appInsights.enabled", false) === true) {
    const appInsightsKey: string = getOrThrow<string>("secrets.ccd.AppInsightsInstrumentationKey");
    const appInsightsRoleName: string = getOrThrow<string>("appInsights.roleName");
    setup(appInsightsKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectConsole(true, true);
    defaultClient.context.tags[defaultClient.context.keys.cloudRole] = appInsightsRoleName;
    defaultClient.addTelemetryProcessor(fineGrainedSampling);
    start();
  } else {
    logger.warn("Application insights is disabled");
  }
};

module.exports = { enableAppInsights };