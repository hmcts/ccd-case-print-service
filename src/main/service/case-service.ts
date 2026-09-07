import * as config from "config";
import { fetch } from "../util/fetch";
import * as userReqAuth from "../user/user-request-authorizer";
import * as validate from "../util/validate";

export function getCase(req, jid, ctid, cid) {
  validate.checkCaseId(cid);
  const userId = req.authentication.user.uid;
  const caseDataStoreUrl: string = config.get("case_data_store_url");
  const url = `${caseDataStoreUrl}/caseworkers/${userId}/jurisdictions/${jid}/case-types/${ctid}/cases/${cid}`;
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
