import * as otp from "otp";
import { get } from "config";
import * as FormData from "form-data";
import * as jwtDecode from "jwt-decode";
import { fetch } from "../util/fetch";

const idamS2SUrl = get("idam.s2s_url");
const serviceName = get("idam.service_name");
const secret = get("idam.service_key");

// TODO Caching should be handled by a singleton service
const cache = {};

export const serviceTokenGenerator = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    if (cache[serviceName]
        && currentTime < cache[serviceName].expiresAt) {
      return Promise.resolve(cache[serviceName].token);
    } else {
      const oneTimePassword = otp({secret: secret}).totp();
      const form = new FormData();
      form.append("microservice", serviceName);
      form.append("oneTimePassword", oneTimePassword);

      return fetch(`${idamS2SUrl}/lease`, {method: "POST", body: form})
          .then(res => res.text())
          .then(token => {
            let tokenData = jwtDecode(token);

            cache[serviceName] = {
              expiresAt: tokenData.exp,
              token: token
            };

            return token;
          });
    }
};
