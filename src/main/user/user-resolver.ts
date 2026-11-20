import { getOrThrow } from "../util/config";
import { fetch } from "../util/fetch";

export const getTokenDetails = (jwt) => {
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;

  return fetch(`${getOrThrow<string>("idam.base_url")}/o/userinfo`, {
    headers: {
      Authorization: BEARER_JWT
    }
  })
  .then((res) => res.json());
};
