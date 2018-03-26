import * as healthcheck from "@hmcts/nodejs-healthcheck";
import * as express from "express";
import * as os from "os";

const router = express.Router();

router.get("/health", healthcheck.configure({
  buildInfo: {
    host: os.hostname(),
    name: "expressjs-template",
    uptime: process.uptime(),
  },
  checks: {
    // empty body for now
  },
}));

module.exports = router;
