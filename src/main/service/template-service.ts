import * as config from "config";
import { fetch } from "../util/fetch";
const caseDataProbateTemplateUrl: string = config.get("case_data_probate_template_url");
export function getProbateCaseDetailsTemplate(req, jid, ctid, cid, templateType) {
  const url = `${caseDataProbateTemplateUrl}/template/case-details/${templateType}`;
  return fetch(url, {
                      headers: {
                        "Authorization": "Bearer " + req.cookies.jwt,
                        "Content-Type": "application/json",
                        "ServiceAuthorization": req.headers.ServiceAuthorization,
                      },
                      method: "GET",
                    })
    .then((res) => res.text());
}
