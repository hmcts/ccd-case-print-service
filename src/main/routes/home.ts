import * as express from "express";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("home");

logger.info("Before router");

const router = express.Router();

logger.info("Before home");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("home");
});

logger.info("After home");

module.exports = router;
