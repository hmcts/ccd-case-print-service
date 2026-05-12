export function checkCaseId(id) {
    if (!/^\d+$/.test(String(id))) {
      throw ERROR_INVALID_CASE_ID;
    }
  }

export function safeEncodePathSegment(segment, segmentName: string): string {
    if (segment === undefined || segment === null) {
      throw invalidPathSegment(segmentName);
    }

    const value = String(segment);

    if (value.length === 0 || !/^[A-Za-z0-9._-]+$/.test(value) || value === "." || value === "..") {
      throw invalidPathSegment(segmentName);
    }

    return encodeURIComponent(value);
  }

export const ERROR_INVALID_CASE_ID = {
    code: "INVALID_CASE_ID",
    error: "Bad Request",
    message: "Case ID must be a valid number",
    status: 400,
  };

function invalidPathSegment(segmentName: string) {
    return {
      code: "INVALID_PATH_SEGMENT",
      error: "Bad Request",
      message: segmentName + " must be a valid path segment",
      status: 400,
    };
  }
