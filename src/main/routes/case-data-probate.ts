import * as express from "express";
// Default imports: under tsx, `import * as` of these CommonJS modules yields a non-callable namespace object.
import dateFilter from "nunjucks-date-filter";
import numeralFilter from "nunjucks-numeral-filter";
import { getCase } from "../service/case-service";
import { getProbateCaseDetailsTemplate } from "../service/template-service";
import { getProbateManLegacyCase } from "../service/probate-man-service";
import { getProbateManLegacyCaseTemplate } from "../service/probate-man-template-service";
import { Logger } from "@hmcts/nodejs-logging";
import nunjucks from "nunjucks";

const router = express.Router();

const logger = Logger.getLogger("app");

dateFilter.setDefaultFormat("YYYY-MM-DD");
const env = nunjucks.configure({ autoescape: true });
env.addFilter("date", dateFilter);
env.addFilter("money", numeralFilter);

router.get("/jurisdictions/:jid/case-types/:ctid/cases/:cid/probate/:tid", (req, res) => {
  logger.warn("GETTING CASE");
  return getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then((caseData) => {
        logger.warn("GETTING CASE DETAILS TEMPLATE");
        return getProbateCaseDetailsTemplate(req, req.params.jid, req.params.ctid, req.params.cid, req.params.tid)
        .then((template) => {
          nunjucks.compile(template, env);
          const response = nunjucks.renderString(template, caseData);
          res.set("charset", "utf-8");
          res.send(response);
        })
        .catch((error) => {
          logger.error("Case data response failed", error);
          res.status(error?.status || 500).send(error);
        });

      })
    .catch((error) => {
      logger.error("Case data retrieval failed", error);
      res.status(error?.status || 500).send(error);
    });
});

router.get("/probateManTypes/:probateManType/cases/:caseId", (req, res) => {
  return getProbateManLegacyCase(req, req.params.probateManType, req.params.caseId)
    .then((probateManCase) => {
      return getProbateManLegacyCaseTemplate(req)
        .then((template) => {
          nunjucks.compile(template, env);
          const response = nunjucks.renderString(template, probateManCase);
          res.set("charset", "utf-8");
          res.send(response);
        })
        .catch((error) => {
          logger.error("Probate man legacy case template response failed", error);
          res.status(error?.status || 500).send(error);
        });

    })
    .catch((error) => {
      logger.error("Probate man legacy case retrieval failed", error);
      res.status(error?.status || 500).send(error);
    });
});

module.exports = router;
