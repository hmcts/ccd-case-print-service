import { expect } from "chai";
import { checkCaseId, safeEncodePathSegment } from "../../main/util/validate";

describe("validate", () => {
  it("encodes valid path segments", () => {
    expect(safeEncodePathSegment("case-type_1.2", "Case type")).to.equal("case-type_1.2");
  });

  it("rejects path traversal segments", () => {
    try {
      safeEncodePathSegment("../secret", "Case type");
      throw new Error("Expected path segment validation to fail");
    } catch (error) {
      expect(error.status).to.equal(400);
      expect(error.code).to.equal("INVALID_PATH_SEGMENT");
    }
  });

  it("rejects empty path segments", () => {
    try {
      safeEncodePathSegment("", "Case type");
      throw new Error("Expected path segment validation to fail");
    } catch (error) {
      expect(error.status).to.equal(400);
      expect(error.code).to.equal("INVALID_PATH_SEGMENT");
    }
  });

  it("rejects numeric case IDs with extra characters", () => {
    try {
      checkCaseId("1e3");
      throw new Error("Expected case ID validation to fail");
    } catch (error) {
      expect(error.status).to.equal(400);
      expect(error.code).to.equal("INVALID_CASE_ID");
    }
  });
});
