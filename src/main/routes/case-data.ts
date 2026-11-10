import * as express from "express";
import { getCase } from "../service/case-service";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("case-data");

logger.info("Before router");

const router = express.Router();

logger.info("Before jurisdictions");

router.get("/jurisdictions/:jid/case-types/:ctid/cases/:cid", (req, res) => {
  getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then((caseData) => {
      res.render("case-data", {
        caseData,
        generatedDateTime: generateDateTime(),
        title: "Simple Case Details output template",
        user: req.authentication.user,
      });
    })
    .catch((error) => {
      // console.error('Case data retrieval failed', error);
      res.status(error.status).send(error);
    });
});

function generateDateTime() {
  const dateTime = new Date(Date.now());
  return dateTime.toLocaleString();
}

logger.info("After jurisdictions");

module.exports = router;
