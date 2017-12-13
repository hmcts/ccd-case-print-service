import { resolveUser } from "./user-resolver";
import { extract as authorizedRolesExtractor } from "./authorised-roles-extractor";
import { extract as userIdExtractor } from "./user-id-extractor";

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
    .then(() => Promise.all([
      authorizeRoles(request, user),
      verifyRequestUserId(request, user)
    ]))
    .then(() => user);
};

const authorizeRoles = (request, user) => {
  return new Promise((resolve, reject) => {
    let roles = authorizedRolesExtractor(request);

    if (roles
        && roles.length
        && !roles.some(role => user.roles.includes(role))) {
      reject(ERROR_UNAUTHORISED_ROLE);
    } else {
      resolve();
    }
  });
};

const verifyRequestUserId = (request, user) => {
  return new Promise((resolve, reject) => {
    let resourceUserId = userIdExtractor(request);

    if (resourceUserId && resourceUserId !== String(user.id)) {
      reject(ERROR_UNAUTHORISED_USER_ID);
    } else {
      resolve();
    }
  });
};
