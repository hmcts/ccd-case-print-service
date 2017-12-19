import { resolveUser } from "./user-resolver";

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

export const authorise = (request) => {
  let user;
  let bearerToken = request.cookies['jwt'];

  if (!bearerToken) {
    return Promise.reject(ERROR_TOKEN_MISSING);
  }

  return resolveUser(bearerToken)
    .then(tokenDetails => user = tokenDetails)
    .then(() => user);
};
