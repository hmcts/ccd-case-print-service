import { expect } from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("user resolver", () => {
  const idamBaseUrl = "http://localhost:5000";
  let getTokenDetails;

  beforeEach(() => {
    const config = {
      get: sinon.stub().withArgs("idam.base_url").returns(idamBaseUrl),
    };
    getTokenDetails = proxyquire("../../main/user/user-resolver", {
      config: {default: config},
    }).getTokenDetails;
  });

  it("should return token details and add the Bearer prefix when it is missing", async () => {
    const tokenDetails = {
      roles: ["caseworker"],
      uid: "1234",
    };

    nock(idamBaseUrl)
      .get("/o/userinfo")
      .matchHeader("Authorization", "Bearer jwt-token")
      .reply(200, tokenDetails);

    const result = await getTokenDetails("jwt-token");

    expect(result).to.deep.equal(tokenDetails);
  });

  it("should not add a second Bearer prefix", async () => {
    const tokenDetails = {uid: "1234"};

    nock(idamBaseUrl)
      .get("/o/userinfo")
      .matchHeader("Authorization", "Bearer jwt-token")
      .reply(200, tokenDetails);

    const result = await getTokenDetails("Bearer jwt-token");

    expect(result).to.deep.equal(tokenDetails);
  });
});
