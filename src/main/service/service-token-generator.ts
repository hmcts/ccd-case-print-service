import { jwtDecode } from "jwt-decode";
import { default as otp } from "otp";
import { fetch } from "../util/fetch";
import { getOrThrow } from "../util/config";

const idamS2SUrl: string = getOrThrow<string>("idam.s2s_url");
const serviceName: string = getOrThrow<string>("idam.service_name");
const secret: string = getOrThrow<string>("secrets.ccd.microservicekey-ccd-ps");

// TODO Caching should be handled by a singleton service
const cache: { [key: string]: { expiresAt: number; token: string } } = {};

export const serviceTokenGenerator = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    if (cache[serviceName]
        && currentTime < cache[serviceName].expiresAt) {
      return Promise.resolve(cache[serviceName].token);
    } else {
      const oneTimePassword = new otp({secret}).totp(currentTime);
      const form = {
        microservice: serviceName,
        oneTimePassword
      };
      const headers = {
        "Content-Type": "application/json"
      };

      return fetch(`${idamS2SUrl}/lease`, { body: JSON.stringify(form), headers, method: "POST" })
          .then((res) => res.text())
          .then((token) => {
            const tokenData = jwtDecode(token);

            cache[serviceName] = {
              "expiresAt": tokenData.exp || currentTime,
              "token": token
            };

            return token;
          });
    }
};
