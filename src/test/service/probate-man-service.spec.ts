import { expect } from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("probate man service", () => {

  let getProbateManLegacyCase;
  const authorization = "Bearer dghdheh47";
  const serviceAuthorization = "Bearer dghdheh48";

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
      const req = {
        get: sinon.stub(),
        headers: {
          ServiceAuthorization : serviceAuthorization,
        },
      };
      req.get.withArgs("Authorization").returns(authorization);
      const expectedResult = {id: 79927398713};
      nock("http://localhost:4104")
        .get("/probateManTypes/CAVEAT/cases/79927398713")
        .reply(200, expectedResult);

      const result = await getProbateManLegacyCase(req, "CAVEAT", 79927398713);
      expect(result).to.deep.equal(expectedResult);
    });

    it ("should return an error when NaN", async () => {
      const req = {
        get: sinon.stub(),
        headers: {
          ServiceAuthorization : serviceAuthorization,
        },
      };
      req.get.withArgs("Authorization").returns(authorization);
      const expectedStatus = 400;
      const expectedError = "Bad Request";
      const expectedMessage = "Case ID must be a valid luhn number";

      try {
        await getProbateManLegacyCase(req, "CAVEAT", "A1");
      } catch (error) {
        expect(error.status).to.deep.equal(expectedStatus);
        expect(error.error).to.deep.equal(expectedError);
        expect(error.message).to.deep.equal(expectedMessage);
      }
    });

    it ("should return an error when not a luhn", async () => {
      const req = {
        get: sinon.stub(),
        headers: {
          ServiceAuthorization : serviceAuthorization,
        },
      };
      req.get.withArgs("Authorization").returns(authorization);
      const expectedStatus = 400;
      const expectedError = "Bad Request";
      const expectedMessage = "Case ID must be a valid luhn number";

      try {
        await getProbateManLegacyCase(req, "CAVEAT", 1);
      } catch (error) {
        expect(error.status).to.deep.equal(expectedStatus);
        expect(error.error).to.deep.equal(expectedError);
        expect(error.message).to.deep.equal(expectedMessage);
      }
    });

    it("should return probate man legacy case when using vaild luhn string", async () => {
      const req = {
        get: sinon.stub(),
        headers: {
          ServiceAuthorization : serviceAuthorization,
        },
      };
      req.get.withArgs("Authorization").returns(authorization);
      const expectedResult = {id: 79927398713};
      nock("http://localhost:4104")
        .get("/probateManTypes/CAVEAT/cases/79927398713")
        .reply(200, expectedResult);

      const result = await getProbateManLegacyCase(req, "CAVEAT", "79927398713");
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
