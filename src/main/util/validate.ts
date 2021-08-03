const luhn = require("luhn");

export function isLuhn(id) {
  if (!luhn.validate(id)) {
    throw ERROR_INVALID_CASE_ID;
  }
}

export const ERROR_INVALID_CASE_ID = {
  code: "INVALID_CASE_ID",
  error: "Bad Request",
  message: "Case ID must be a valid luhn number",
  status: 400,
};
