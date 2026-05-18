import { getOrThrow, getOrDefault } from "../util/config";
import appInsights from "applicationinsights";

const enabled = getOrDefault<boolean>("appInsights.enabled", false);

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
  if (enabled) {
    const appInsightsKey: string = getOrThrow<string>("secrets.ccd.AppInsightsInstrumentationKey");
    const appInsightsRoleName: string = getOrThrow<string>("appInsights.roleName");
    appInsights.setup(appInsightsKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectConsole(true, true);
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = appInsightsRoleName;
    appInsights.defaultClient.addTelemetryProcessor(fineGrainedSampling);
    appInsights.start();
  }
};

module.exports = { enableAppInsights };