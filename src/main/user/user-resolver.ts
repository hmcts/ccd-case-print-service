import { get } from "config";
import { fetch } from "../util/fetch";

export const resolveUser = (jwt) => {
  let bearerJwt = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;

  return fetch(`${get('idam.base_url')}/details`, {
    headers: {
      'Authorization': bearerJwt
    }
  })
  .then(res => res.json());
};
