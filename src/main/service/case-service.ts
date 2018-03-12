import { get } from "config";
import { fetch } from "../util/fetch";
import * as userReqAuth from "../user/user-request-authorizer";

export function getCase(req, jid, ctid, cid) {
  let userId = req.authentication.user.id;
  let url = get("case_data_store_url") + '/caseworkers/' + userId + '/jurisdictions/' + jid + '/case-types/' + ctid +
    '/cases/' + cid;
  let authorization = req.cookies['jwt'] ? `Bearer ${req.cookies['jwt']}` : req.headers[userReqAuth.AUTHORIZATION];
  return fetch(url, { method: 'GET',
                      headers: {
                        'Authorization': authorization,
                        'ServiceAuthorization': req.headers.ServiceAuthorization,
                        'Content-Type': 'application/json'
                      }
                    })
    .then(res => res.json());
}
