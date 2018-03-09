import { getTokenDetails } from "./user-resolver";

export const ERROR_TOKEN_MISSING = {
  error: 'Bearer token missing',
  status: 401,
  message: 'You are not authorized to access this resource'
};
export const ERROR_UNAUTHORISED_ROLE = {
  error: 'Unauthorised role',
  status: 403,
  message: 'You are not authorized to access this resource'
};
export const ERROR_UNAUTHORISED_USER_ID = {
  error: 'Unauthorised user',
  status: 403,
  message: 'You are not authorized to access this resource'
};

export const COOKIE_ACCESS_TOKEN = 'accessToken';
export const AUTHORIZATION = 'Authorization';

export const authorise = (request) => {
  let user;
  let bearerToken = request.get(AUTHORIZATION) || (request.cookies ? request.cookies[COOKIE_ACCESS_TOKEN] : null);

  if (!bearerToken) {
    return Promise.reject(ERROR_TOKEN_MISSING);
  }

  // Use AccessToken cookie as Authorization header
  if (!request.get(AUTHORIZATION) && bearerToken) {
    if (!request.headers) {
      request.headers = {[AUTHORIZATION]: `Bearer ${bearerToken}`};
    } else {
      request.headers[AUTHORIZATION] = `Bearer ${bearerToken}`;
    }
  }

  return getTokenDetails(bearerToken)
    .then(tokenDetails => user = tokenDetails)
    .then(() => user);
};
