import * as config from "config";
import { fetch } from "../util/fetch";
import * as userReqAuth from "../user/user-request-authorizer";
import * as validate from "../util/validate";

export function getProbateManLegacyCase(req, probateManType, id) {
  const caseDataProbateTemplateUrl: string = config.get("case_data_probate_template_url");
  const url = `${caseDataProbateTemplateUrl}/probateManTypes/${probateManType}/cases/${id}`;
  const authorization = req.get(userReqAuth.AUTHORIZATION);
  validate.checkCaseId(id);
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
