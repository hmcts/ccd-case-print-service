import { get } from "config";
import { fetch } from "../util/fetch";
import * as userReqAuth from "../user/user-request-authorizer";

export function getCase(req, jid, ctid, cid) {
  const userId = req.authentication.user.uid;
  const url = get("case_data_store_url") + "/caseworkers/" + userId + "/jurisdictions/" + jid + "/case-types/" + ctid +
    "/cases/" + cid;
  const authorization = req.get(userReqAuth.AUTHORIZATION);
  console.log("userId:", userId);
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
