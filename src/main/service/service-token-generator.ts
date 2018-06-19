import * as FormData from "form-data";
import * as jwtDecode from "jwt-decode";
import * as otp from "otp";
import { fetch } from "../util/fetch";
import { get } from "config";

const idamS2SUrl = get("idam.s2s_url");
const serviceName = get("idam.service_name");
const secret = get("idam.print_service_key");

// TODO Caching should be handled by a singleton service
const cache = {};

export const serviceTokenGenerator = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    if (cache[serviceName]
        && currentTime < cache[serviceName].expiresAt) {
      return Promise.resolve(cache[serviceName].token);
    } else {
      const oneTimePassword = otp({secret}).totp();
      const form = new FormData();
      form.append("microservice", serviceName);
      form.append("oneTimePassword", oneTimePassword);

      return fetch(`${idamS2SUrl}/lease`, {body: form, method: "POST"})
          .then((res) => res.text())
          .then((token) => {
            const tokenData = jwtDecode(token);

            cache[serviceName] = {
              expiresAt: tokenData.exp,
              token,
            };

            return token;
          });
    }
};
