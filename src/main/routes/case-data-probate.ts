import * as express from "express";
import * as dateFilter from "nunjucks-date-filter";
import * as numeralFilter from "nunjucks-numeral-filter";
import { getCase } from "../service/case-service";
import { getProbateCaseDetailsTemplate } from "../service/template-service";
import { getProbateManLegacyCase } from "../service/probate-man-service";
import { getProbateManLegacyCaseTemplate } from "../service/probate-man-template-service";

const nunjucks = require("nunjucks");

const router = express.Router();

dateFilter.setDefaultFormat("YYYY-MM-DD");
const env = nunjucks.configure({ autoescape: true });
env.addFilter("date", dateFilter);
env.addFilter("money", numeralFilter);

router.get("/jurisdictions/:jid/case-types/:ctid/cases/:cid/probate/:tid", (req, res) => {
  console.warn("GETTING CASE");
  getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then((caseData) => {
        console.warn("GETTING CASE DETAILS TEMPLATE");
        getProbateCaseDetailsTemplate(req, req.params.jid, req.params.ctid, req.params.cid, req.params.tid)
        .then((template) => {
          nunjucks.compile(template, env);
          const response = nunjucks.renderString(template, caseData);
          res.set("charset", "utf-8");
          res.send(response);
        })
        .catch((error) => {
          console.error("Case data response failed", error);
          res.status(error.status).send(error);
        });

      })
    .catch((error) => {
      console.error("Case data retrieval failed", error);
      res.status(error.status).send(error);
    });
});

router.get("/probateManTypes/:probateManType/cases/:caseId", (req, res) => {
  getProbateManLegacyCase(req, req.params.probateManType, req.params.caseId)
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
});

module.exports = router;
