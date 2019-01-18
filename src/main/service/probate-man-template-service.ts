import { get } from "config";
import { fetch } from "../util/fetch";

export function getProbateManLegacyCaseTemplate(req) {
  const url = get("case_data_probate_template_url") + "/template/probateManLegacyCase";
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
