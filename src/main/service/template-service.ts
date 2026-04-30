import { get } from "config";
import { fetch } from "../util/fetch";
import * as validate from "../util/validate";

export function getProbateCaseDetailsTemplate(req, jid, ctid, cid, templateType) {
  const templateTypeSegment = validate.safeEncodePathSegment(templateType, "Template type");
  const url = get("case_data_probate_template_url") + "/template/case-details/" + templateTypeSegment;
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
