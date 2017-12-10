import { get } from "config";
import { fetch } from "../util/fetch";

export function getCase(req, jid, ctid, cid) {
  let userId = req.authentication.user.id;
  let url = get("case_data_store_url") + '/caseworkers/' + userId + '/jurisdictions/' + jid + '/case-types/' + ctid +
    '/cases/' + cid;
  return fetch(url, { method: 'GET',
                      headers: {
                        'Authorization': 'Bearer ' + req.cookies['jwt'],
                        'ServiceAuthorization': req.headers.ServiceAuthorization,
                        'Content-Type': 'application/json'
                      }
                    })
    .then(res => res.json());
}
