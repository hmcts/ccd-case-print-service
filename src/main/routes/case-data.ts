import * as express from "express";
import { getCase } from "../service/case-service";

const router = express.Router();

router.get("/caseworkers/:uid/jurisdictions/:jid/case-types/:ctid/cases/:cid", (req, res, next) => {
  getCase(req, req.params.jid, req.params.ctid, req.params.cid)
    .then(caseData => {
      res.render('case-data', {
        title: 'Simple Case Details output template',
        caseData: caseData,
        user: req.authentication.user,
        generatedDateTime: generateDateTime()
      });
    })
    .catch(error => {
      console.error('Case data retrieval failed', error);
      res.status(error.status).send(error);
    });
});

function generateDateTime() {
  let dateTime = new Date(Date.now());
  return dateTime.toLocaleString();
}

module.exports = router;
