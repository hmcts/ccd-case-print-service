import { get } from "config";
import { fetch } from "../util/fetch";

export function getProbateCaseDetailsTemplate(req, jid, ctid, cid, caseData) {
  var templateSwitch = caseData.case_data.solicitorFirmName;
  var type = templateSwitch &&  templateSwitch != '' ? 'sols' : 'pa';
  let url = get("case_data_probate_template_url") + '/template/case-details-'+type;
  return fetch(url, { method: 'GET',
                      headers: {
                        'Authorization': 'Bearer ' + req.cookies['jwt'],
                        'ServiceAuthorization': req.headers.ServiceAuthorization,
                        'Content-Type': 'application/json'
                      }
                    })
    .then(res => res.text());
}
