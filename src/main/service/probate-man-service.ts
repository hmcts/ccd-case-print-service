import { getOrThrow } from "../util/config";
import { fetch } from "../util/fetch";
import * as userReqAuth from "../user/user-request-authorizer";
import { SERVICE_AUTHORIZATION } from "../service/service-filter";

export function getProbateManLegacyCase(req, probateManType, id) {
  const url = getOrThrow<string>("case_data_probate_template_url") + "/probateManTypes/" + probateManType + "/cases/" + id;
  const authorization = req.get(userReqAuth.AUTHORIZATION);
  return fetch(url, {
    headers: {
      "Authorization": authorization,
      "Content-Type": "application/json",
      "ServiceAuthorization": req.get(SERVICE_AUTHORIZATION)
    },
    method: "GET"
  })
    .then((res) => res.json());
}
