import { expect } from "chai";
import { encodePathSegment } from "../../main/util/url";

describe("url utilities", () => {
  it("encodes path separators and traversal markers as path segment data", () => {
    expect(encodePathSegment("../templates/probate")).to.equal("..%2Ftemplates%2Fprobate");
  });
});
