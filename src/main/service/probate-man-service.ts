import * as config from "config";
import { fetch } from "../util/fetch";
import * as userReqAuth from "../user/user-request-authorizer";

export function getProbateManLegacyCase(req, probateManType, id) {
  const url = config.get("case_data_probate_template_url") + "/probateManTypes/" + probateManType + "/cases/" + id;
  const authorization = req.get(userReqAuth.AUTHORIZATION);
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
