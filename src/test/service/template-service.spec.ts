import { expect } from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("template service", () => {

  let getProbateCaseDetailsTemplate;
  const proxyquireNoCallThru = proxyquire.noCallThru();
  const serviceAuthorization = "Bearer dghdheh48";
  const req = {
    cookies: {
      jwt: "hfsjkfdhsk",
    },
    headers: {
      ServiceAuthorization : serviceAuthorization,
    },
  };

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("case_data_probate_template_url").returns("http://localhost:4104");
    getProbateCaseDetailsTemplate = proxyquireNoCallThru("../../main/service/template-service", {
      config,
    }).getProbateCaseDetailsTemplate;
  });

  describe("getProbateCaseDetailsTemplate()", () => {
    it("should return probate case details template", async () => {
      const expectedResult = "Template";
      nock("http://localhost:4104")
        .get("/template/case-details/default")
        .reply(200, expectedResult);

      const result = await getProbateCaseDetailsTemplate(req, "PROBATE", "Grant", "1234", "default");

      expect(result).to.deep.equal(expectedResult);
    });

    it("should reject path traversal in template type", async () => {
      try {
        await getProbateCaseDetailsTemplate(req, "PROBATE", "Grant", "1234", "../secret");
        throw new Error("Expected template type validation to fail");
      } catch (error) {
        expect(error.status).to.deep.equal(400);
        expect(error.code).to.deep.equal("INVALID_PATH_SEGMENT");
      }
    });
  });
});
