import * as express from "express";
import * as dateFilter from "nunjucks-date-filter";
import * as numeralFilter from "nunjucks-numeral-filter";
import * as validate from "../util/validate";
import { checkForEnumerationAttempt } from "../security/enumeration-check-probate-man-type";
import { getCase } from "../service/case-service";
import { getProbateCaseDetailsTemplate } from "../service/template-service";
import { getProbateManLegacyCase } from "../service/probate-man-service";
import { getProbateManLegacyCaseTemplate } from "../service/probate-man-template-service";
import { Logger } from "@hmcts/nodejs-logging";

const nunjucks = require("nunjucks");

const router = express.Router();

const logger = Logger.getLogger("case-data-probate");

dateFilter.setDefaultFormat("YYYY-MM-DD");
const env = nunjucks.configure({ autoescape: true });
env.addFilter("date", dateFilter);
env.addFilter("money", numeralFilter);

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

module.exports = router;
