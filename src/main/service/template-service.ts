import { getOrThrow } from "../util/config";
import { fetch } from "../util/fetch";

export function getProbateCaseDetailsTemplate(req, jid, ctid, cid, templateType) {
  const url = getOrThrow<string>("case_data_probate_template_url") + "/template/case-details/" + templateType;
  return fetch(url, {
                      headers: {
                        "Authorization": "Bearer " + req.cookies.jwt,
                        "Content-Type": "application/json",
                        "ServiceAuthorization": req.headers.ServiceAuthorization
                      },
                      method: "GET"
                    })
    .then((res) => res.text());
}
