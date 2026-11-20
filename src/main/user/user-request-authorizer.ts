import { getTokenDetails } from "./user-resolver";

export const ERROR_TOKEN_MISSING = {
  error: "Bearer token missing",
  message: "You are not authorized to access this resource",
  status: 401
};
export const ERROR_UNAUTHORISED_ROLE = {
  error: "Unauthorised role",
  message: "You are not authorized to access this resource",
  status: 403
};
export const ERROR_UNAUTHORISED_USER_ID = {
  error: "Unauthorised user",
  message: "You are not authorized to access this resource",
  status: 403
};

export const COOKIE_ACCESS_TOKEN = "accessToken";
export const AUTHORIZATION = "Authorization";

export const authorise = (request) => {
  let user;
  let bearerToken = request.get(AUTHORIZATION);
  const cookiesToken = request.cookies ? request.cookies[COOKIE_ACCESS_TOKEN] : null;

  if (!bearerToken && cookiesToken) {
    bearerToken = cookiesToken.startsWith("Bearer ") ? cookiesToken : `Bearer ${cookiesToken}`;
    const headers = request.headers || {};
    headers[AUTHORIZATION] = bearerToken;
    request.headers = headers;
  }

  if (!bearerToken) {
    return Promise.reject(ERROR_TOKEN_MISSING);
  }

  return getTokenDetails(bearerToken)
    .then((tokenDetails) => user = tokenDetails)
    .then(() => user);
};
