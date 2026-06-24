import { serviceTokenGenerator } from "./service-token-generator";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("service-filter");

export const SERVICE_AUTHORIZATION = "ServiceAuthorization";

export const serviceFilter = (req, res, next) => {
    serviceTokenGenerator()
        .then((t) => {
            req.headers[SERVICE_AUTHORIZATION] = t;
            next();
        })
        .catch((error) => {
            logger.warn("Unsuccessful S2S authentication", error?.status, error?.statusText);
            next({
                status: error.status || 401
            });
        });
};
