const luhn = require("luhn");

export function isLuhn(id) {
  if (!luhn.validate(id)) {
    throw ERROR_BAD_REQUEST;
  }
}

export const ERROR_BAD_REQUEST = {
    error: "Bad Request",
    message: "Case ID must be a valid luhn number",
    status: 400,
  };
