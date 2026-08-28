import { expect } from "chai";
import * as nock from "nock";
import { fetch } from "../../main/util/fetch";

describe("fetch", () => {
  const baseUrl = "http://localhost:4104";

  it("should return the response for a successful request", async () => {
    nock(baseUrl)
      .get("/case")
      .reply(200, { id: 1234 });

    const response = await fetch(`${baseUrl}/case`);

    expect(response.status).to.equal(200);
    expect(await response.json()).to.deep.equal({ id: 1234 });
  });

  it("should reject with the response attached for an unsuccessful request", async () => {
    nock(baseUrl)
      .get("/case")
      .reply(404);

    try {
      await fetch(`${baseUrl}/case`);
      expect.fail("Expected fetch to reject");
    } catch (error) {
      expect(error.message).to.equal("HTTP Error: 404");
      expect(error.response.status).to.equal(404);
    }
  });
});
