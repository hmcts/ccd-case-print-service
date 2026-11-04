import { getOrThrow } from "../util/config";
import { fetch } from "../util/fetch";
import { SERVICE_AUTHORIZATION } from "../service/service-filter";

export function getProbateManLegacyCaseTemplate(req) {
  const url = getOrThrow<string>("case_data_probate_template_url") + "/template/probateManLegacyCase";
  return fetch(url, {
                      headers: {
                        "Authorization": "Bearer " + req.cookies.jwt,
                        "Content-Type": "application/json",
                        "ServiceAuthorization": req.get(SERVICE_AUTHORIZATION)
                      },
                      method: "GET"
                    })
    .then((res) => res.text());
}
