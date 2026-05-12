import { get } from "config";
import { fetch } from "../util/fetch";
import * as validate from "../util/validate";

export function getCase(req, jid, ctid, cid) {
  validate.checkCaseId(cid);
  const userId = validate.safeEncodePathSegment(req.authentication.user.uid, "User ID");
  const jurisdictionId = validate.safeEncodePathSegment(jid, "Jurisdiction ID");
  const caseTypeId = validate.safeEncodePathSegment(ctid, "Case type ID");
  const caseId = validate.safeEncodePathSegment(cid, "Case ID");
  const url = get("case_data_store_url") + "/caseworkers/" + userId + "/jurisdictions/" + jurisdictionId +
    "/case-types/" + caseTypeId + "/cases/" + caseId;
  const authorization = req.get("Authorization");
  return fetch(url, {
    headers: {
      "Authorization": authorization,
      "Content-Type": "application/json",
      "ServiceAuthorization": req.headers.ServiceAuthorization,
    },
    method: "GET",
  })
    .then((res) => res.json());
}
