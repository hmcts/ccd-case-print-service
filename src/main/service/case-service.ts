import { getOrThrow } from "../util/config";
import { fetch } from "../util/fetch";
import { AUTHORIZATION } from "../user/user-request-authorizer";
import { checkCaseId } from "../util/validate";

const SERVICE_AUTHORIZATION = "ServiceAuthorization";

export function getCase(req, jid, ctid, cid) {
  checkCaseId(cid);
  const userId = req.authentication.user.uid;
  const url = getOrThrow<string>("case_data_store_url") + "/caseworkers/" + userId + "/jurisdictions/" + jid + "/case-types/" + ctid +
    "/cases/" + cid;
  const authorization = req.get(AUTHORIZATION);
  const serviceAuthorization = req.get(SERVICE_AUTHORIZATION);

  return fetch(url, {
    headers: {
      "Authorization": authorization,
      "Content-Type": "application/json",
      "ServiceAuthorization": serviceAuthorization
    },
    method: "GET"
  })
    .then((res) => res.json());
}
