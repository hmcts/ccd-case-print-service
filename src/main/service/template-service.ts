import { get } from "config";
import { fetch } from "../util/fetch";
import { encodePathSegment } from "../util/url";

export function getProbateCaseDetailsTemplate(req, jid, ctid, cid, templateType) {
  const url = get("case_data_probate_template_url") + "/template/case-details/" + encodePathSegment(templateType);
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
