import { get } from "config";
import { fetch } from "../util/fetch";
import * as userReqAuth from "../user/user-request-authorizer";

export function getProbateManLegacyCase(req, probateManType, id) {
  const url = get("case_data_probate_template_url") + "/probateManTypes/" + probateManType + "/cases/" + id;
  const authorization = req.get(userReqAuth.AUTHORIZATION);
  if (isNaN(id)){
    return ERROR_BAD_REQUEST;
  } else {
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
    }

export const ERROR_BAD_REQUEST = {
  error: "Bad Request",
  message: "Case ID must be a valid luhn number",
  status: 400,
};