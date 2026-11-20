import { expect } from "chai";
import * as jwt from "jsonwebtoken";
import moment from "moment";
import nock from "nock";
import proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("service token generator", () => {

  let serviceTokenGenerator;
  let getOrThrow;

  beforeEach(() => {
    getOrThrow = sinon.stub();
    getOrThrow.withArgs("secrets.ccd.microservicekey-ccd-ps").returns("test-secret");
    getOrThrow.withArgs("idam.s2s_url").returns("http://localhost:9999");
    getOrThrow.withArgs("idam.service_name").returns("ccd_ps");

    serviceTokenGenerator = proxyquire("../../main/service/service-token-generator", {
      "../util/config": { getOrThrow }
    }).serviceTokenGenerator;
  });

  describe("generate()", () => {
    it("should reject when the service key is missing", async () => {
      getOrThrow.withArgs("secrets.ccd.microservicekey-ccd-ps").returns("");

      const generator = proxyquire.noPreserveCache()("../../main/service/service-token-generator", {
        "../util/config": { getOrThrow }
      }).serviceTokenGenerator;

      try {
        await generator();
        expect.fail("expected missing service key to reject");
      } catch (error) {
        expect(error.message).to.equal("IDAM_PRINT_SERVICE_KEY must be configured");
      }
    });

    it("should return token", async () => {
      const expectedResult = jwt.sign({exp: moment().unix()}, "secret");
      nock("http://localhost:9999")
        .post("/lease")
        .reply(200, expectedResult);

      const secret = await serviceTokenGenerator();
      expect(secret).to.equal(expectedResult);
    });

    it("should return same token when called twice", async () => {
      const expectedResult = jwt.sign({exp: moment().add(3, "hours").unix()}, "secret");
      nock("http://localhost:9999")
        .post("/lease")
        .reply(200, expectedResult);

      const secret1 = await serviceTokenGenerator();
      expect(secret1).to.equal(expectedResult);

      const secret2 = await serviceTokenGenerator();
      expect(secret2).to.equal(expectedResult);
    });
  });
});
