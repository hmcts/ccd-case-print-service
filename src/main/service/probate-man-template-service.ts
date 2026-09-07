import * as config from "config";
import { fetch } from "../util/fetch";

export function getProbateManLegacyCaseTemplate(req) {
  const caseDataProbateTemplateUrl: string = config.get("case_data_probate_template_url");
  const url = `${caseDataProbateTemplateUrl}/template/probateManLegacyCase`;
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
