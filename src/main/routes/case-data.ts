import * as express from "express";
import { getCase } from "../service/case-service";
import { Logger } from "@hmcts/nodejs-logging";

const router = express.Router();
const logger = Logger.getLogger("case-data");

router.post("/case-data", (req: any, res) => {
  const jurisdiction = req.body.jurisdiction;
  const caseType = req.body.caseType;
  const caseId = req.body.caseId;
  const formatted = req.body.formatted;

  if (jurisdiction && caseType && caseId) {
    res.redirect(303, `/jurisdictions/${jurisdiction}/case-types/${caseType}/cases/${caseId}${formatted ? "?formatted=true" : ""}`);
    return;
  }
  res.redirect(303, "/");
});

router.get("/jurisdictions/:jid/case-types/:ctid/cases/:cid", (req: any, res) => {
  getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then((caseData) => {
      if (req?.query?.formatted === "true") {
        res.render("case-data-formatted", {
          caseData,
          generatedDateTime: generateDateTime(),
          title: "Formatted Case Details",
          user: req?.authentication?.user
        });
        return;
      }
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
