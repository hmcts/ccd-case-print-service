import { authorise } from "./user-request-authorizer";

export const authCheckerUserOnlyFilter = (req, res, next) => {

  req.authentication = {};

  authorise(req)
    .then((user) => req.authentication.user = user)
    .then(() => next())
    .catch((error) => {
      // console.warn("Unsuccessful user authentication", error);
      error.status = error.status || 401;
      next(error);
    });
};
