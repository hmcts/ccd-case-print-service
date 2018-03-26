import * as healthcheck from "@hmcts/nodejs-healthcheck";
import * as express from "express";

const router = express.Router();

router.get("/health", healthcheck.configure({
  checks: {
    // empty body for now
  },
}));

module.exports = router;
