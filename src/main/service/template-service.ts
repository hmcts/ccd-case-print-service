import { get } from "config";
import { fetch } from "../util/fetch";

export function getProbateCaseDetailsTemplate(req, jid, ctid, cid, templateType) {
  let url = get("case_data_probate_template_url") + '/template/case-details/'+templateType;
  return fetch(url, { method: 'GET',
                      headers: {
                        'Authorization': 'Bearer ' + req.cookies['jwt'],
                        'ServiceAuthorization': req.headers.ServiceAuthorization,
                        'Content-Type': 'application/json'
                      }
                    })
    .then(res => res.text());
}
