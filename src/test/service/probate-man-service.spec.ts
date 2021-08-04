import { expect } from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("probate man service", () => {

  let getProbateManLegacyCase;

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("case_data_probate_template_url").returns("http://localhost:4104");
    getProbateManLegacyCase = proxyquire("../../main/service/probate-man-service", {
      config,
    }).getProbateManLegacyCase;
  });

  describe("getProbateManLegacyCase()", () => {
    it("should return probate man legacy case", async () => {
      const authorization = "Bearer dghdheh47";
      const serviceAuthorization = "Bearer dghdheh48";
      const req = {
        get: sinon.stub(),
        headers: {
          ServiceAuthorization : serviceAuthorization,
        },
      };
      req.get.withArgs("Authorization").returns(authorization);
      const expectedResult = {id: 1};
      nock("http://localhost:4104")
        .get("/probateManTypes/CAVEAT/cases/1")
        .reply(200, expectedResult);

      const result = await getProbateManLegacyCase(req, "CAVEAT", 1);
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
