import { get } from "config";
import { fetch } from "../util/fetch";
import * as validate from "../util/validate";

export function getProbateManLegacyCase(req, probateManType, id) {
  validate.checkCaseId(id);
  const probateManTypeSegment = validate.safeEncodePathSegment(probateManType, "Probate man type");
  const caseId = validate.safeEncodePathSegment(id, "Case ID");
  const url = get("case_data_probate_template_url") + "/probateManTypes/" + probateManTypeSegment + "/cases/" + caseId;
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
