#!/usr/bin/env node
require("@hmcts/properties-volume").addTo(require("config"));

require("./app-insights/app-insights")();

const { Logger } = require("@hmcts/nodejs-logging");
const { app } = require("./app");

const logger = Logger.getLogger("server");

// TODO: set the right port for your application
const port = process.env.PORT || "3100";

app.listen(port, () => {
  logger.info(`Application started: http://localhost:${port}`);
});
