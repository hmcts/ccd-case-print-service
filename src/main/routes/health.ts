import * as healthcheck from "@hmcts/nodejs-healthcheck";
import * as express from "express";
import * as os from "os";

const router = express.Router();

let healthCheckConfig = {
  buildInfo: {
    host: os.hostname(),
    name: "ccd-case-print-service",
    uptime: process.uptime(),
  },
  checks: {
    // empty body for now
  },
};

healthcheck.addTo(router, healthCheckConfig)

module.exports = router;
