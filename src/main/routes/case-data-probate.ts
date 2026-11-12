import { Logger } from "@hmcts/nodejs-logging";
const logger = Logger.getLogger("case-data-probate");

logger.info("case-data-probate: importing express");
import * as express from "express";
logger.info("case-data-probate: importing dateFilter");
import * as dateFilter from "nunjucks-date-filter";
logger.info("case-data-probate: importing numeralFilter");
import * as numeralFilter from "nunjucks-numeral-filter";
logger.info("case-data-probate: importing validate");
import * as validate from "../util/validate";
logger.info("case-data-probate: importing checkForEnumerationAttempt");
import { checkForEnumerationAttempt } from "../guard/enumeration-check-probate-man-type";
logger.info("case-data-probate: importing getCase");
import { getCase } from "../service/case-service";
logger.info("case-data-probate: importing getProbateCaseDetailsTemplate");
import { getProbateCaseDetailsTemplate } from "../service/template-service";
logger.info("case-data-probate: importing getProbateManLegacyCase");
import { getProbateManLegacyCase } from "../service/probate-man-service";
logger.info("case-data-probate: importing getProbateManLegacyCaseTemplate");
import { getProbateManLegacyCaseTemplate } from "../service/probate-man-template-service";

logger.info("case-data-probate: Setup nunjucks");
const nunjucks = require("nunjucks");

logger.info("case-data-probate: Setup router");
const router = express.Router();

logger.info("Before filters");

dateFilter.setDefaultFormat("YYYY-MM-DD");
const env = nunjucks.configure({ autoescape: true });
env.addFilter("date", dateFilter);
env.addFilter("money", numeralFilter);

logger.info("Before jurisdictions");

router.get("/jurisdictions/:jid/case-types/:ctid/cases/:cid/probate/:tid", (req, res) => {
  logger.warn("GETTING CASE");
  getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then((caseData) => {
        logger.warn("GETTING CASE DETAILS TEMPLATE");
        getProbateCaseDetailsTemplate(req, req.params.jid, req.params.ctid, req.params.cid, req.params.tid)
        .then((template) => {
          nunjucks.compile(template, env);
          const response = nunjucks.renderString(template, caseData);
          res.set("charset", "utf-8");
          res.send(response);
        })
        .catch((error) => {
          logger.error("Case data response failed", error);
          res.status(error.status).send(error);
        });

      })
    .catch((error) => {
      logger.error("Case data retrieval failed", error);
      res.status(error.status).send(error);
    });
});

logger.info("After jurisdictions");
logger.info("Before probateManTypes");

router.get("/probateManTypes/:probateManType/cases/:caseId", (req, res) => {
  const probateManCaseType = req.params.probateManType;
  const probateManCaseId = req.params.caseId;

  try {
    validate.checkCaseId(probateManCaseId);

    checkForEnumerationAttempt(req.authentication.user.uid, probateManCaseType, probateManCaseId)
      .then(() => {
        getProbateManLegacyCase(req, probateManCaseType, probateManCaseId)
          .then((probateManCase) => {
            getProbateManLegacyCaseTemplate(req)
              .then((template) => {
                nunjucks.compile(template, env);
                const response = nunjucks.renderString(template, probateManCase);
                res.set("charset", "utf-8");
                res.send(response);
              })
              .catch((error) => {
                res.status(error.status).send(error);
              });
          })
          .catch((error) => {
            res.status(error.status).send(error);
          });
      })
      .catch((error) => {
        if (error?.code && error.code === "ENUMERATION_ATTEMPT") {
          res.status(error.status).send();
        } else {
          logger.error("Unexpected error occurred", error);
          res.status(error.status).send(error);
        }
      });
    } catch (error) {
      res.status(error.status).send(error);
    }
});

logger.info("After probateManTypes");

module.exports = router;
