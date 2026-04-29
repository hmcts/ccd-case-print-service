import { get } from "config";
import { fetch } from "../util/fetch";
import { encodePathSegment } from "../util/url";
import * as userReqAuth from "../user/user-request-authorizer";
import * as validate from "../util/validate";

export function getCase(req, jid, ctid, cid) {
  validate.checkCaseId(cid);
  const userId = req.authentication.user.uid;
  const url = get("case_data_store_url") + "/caseworkers/" + encodePathSegment(userId) + "/jurisdictions/" +
    encodePathSegment(jid) + "/case-types/" + encodePathSegment(ctid) + "/cases/" + encodePathSegment(cid);
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
