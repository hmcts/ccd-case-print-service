import { expect } from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("probate man template service", () => {

  let getProbateManLegacyCaseTemplate;

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("case_data_probate_template_url").returns("http://localhost:4104");
    getProbateManLegacyCaseTemplate = proxyquire("../../main/service/probate-man-template-service", {
      config,
    }).getProbateManLegacyCaseTemplate;
  });

  describe("getProbateManLegacyCaseTemplate()", () => {
    it("should return probate man legacy case template", async () => {
      const serviceAuthorization = "Bearer dghdheh48";
      const req = {
        cookies: {
          jwt: "hfsjkfdhsk",
        },
        headers: {
          ServiceAuthorization : serviceAuthorization,
        },
      };
      const expectedResult = "Template";
      nock("http://localhost:4104")
        .get("/template/probateManLegacyCase")
        .reply(200, expectedResult);
      const result = await getProbateManLegacyCaseTemplate(req);
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
