import * as express from "express";
import { getCase } from "../service/case-service";
import { Logger } from "@hmcts/nodejs-logging";

const router = express.Router();
const logger = Logger.getLogger("case-data");

router.get("/jurisdictions/:jid/case-types/:ctid/cases/:cid", (req: any, res) => {
  getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then((caseData) => {
      res.render("case-data", {
        caseData,
        generatedDateTime: generateDateTime(),
        title: "Simple Case Details output template",
        user: req?.authentication?.user
      });
    })
    .catch((error) => {
      logger.error("Case data retrieval failed", error);
      res.status(error.status).send(error);
    });
});

function generateDateTime() {
  const dateTime = new Date(Date.now());
  return dateTime.toLocaleString();
}

module.exports = router;
