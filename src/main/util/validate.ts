export function checkCaseId(id) {
    if (!Number.isInteger(+id)) {
      throw ERROR_INVALID_CASE_ID;
    }
  }

export const ERROR_INVALID_CASE_ID = {
    code: "INVALID_CASE_ID",
    error: "Bad Request",
    message: "Case ID must be a valid number",
    status: 400,
  };
