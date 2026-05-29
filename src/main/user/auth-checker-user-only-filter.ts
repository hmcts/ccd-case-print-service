import { authorise } from "./user-request-authorizer";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("auth-checker-user-only-filter");

export const authCheckerUserOnlyFilter = (req, res, next) => {

  req.authentication = {};

  authorise(req)
    .then((user) => req.authentication.user = user)
    .then(() => next())
    .catch((error) => {
      logger.warn("Unsuccessful user authentication", error);
      error = error?.status ? error : { status: 401, message: "Unauthorized" };
      next(error);
    });
};
