import * as express from "express";
import { getCase } from "../service/case-service";
import { getProbateCaseDetailsTemplate } from "../service/template-service";
import * as dateFilter from "nunjucks-date-filter";
import * as numeralFilter from "nunjucks-numeral-filter";

const nunjucks = require('nunjucks');

const router = express.Router();

dateFilter.setDefaultFormat('YYYY-MM-DD');
var env = nunjucks.configure({ autoescape: true });
env.addFilter('date', dateFilter);
env.addFilter('money', numeralFilter);

router.get("/jurisdictions/:jid/case-types/:ctid/cases/:cid/probate", (req, res, next) => {
  getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then(caseData => {
        getProbateCaseDetailsTemplate(req, req.params.jid, req.params.ctid, req.params.cid)
        .then(template =>
        {
          //console.log(env);
          //console.log(caseData.case_data.solsAdditionalExecutorList[0].value.additionalApplying);
          nunjucks.compile(template, env)
          var response = nunjucks.renderString(template, caseData);
          //console.log(response);
          res.send(response);
        })
        .catch(error => {
          console.error('Case data response failed', error);
          res.status(error.status).send(error);
        });

      })
    .catch(error => {
      console.error('Case data retrieval failed', error);
      res.status(error.status).send(error);
    });
});

module.exports = router;
