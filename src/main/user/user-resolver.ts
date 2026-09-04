import * as config from "config";
import { fetch } from "../util/fetch";

export const getTokenDetails = (jwt) => {
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;

  const idamBaseUrl: string = config.get("idam.base_url");
  return fetch(`${idamBaseUrl}/o/userinfo`, {
    headers: {
      Authorization: BEARER_JWT,
    },
  })
  .then((res) => res.json());
};
