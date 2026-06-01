import { expect } from "chai";
import proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("template service", () => {

  let getProbateCaseDetailsTemplate;
  let getOrThrow;
  let fetch;
  let responseText;

  beforeEach(() => {
    getOrThrow = sinon.stub();
    getOrThrow.withArgs("case_data_probate_template_url").returns("http://localhost:4104");

    responseText = sinon.stub().resolves("Template");
    fetch = sinon.stub().resolves({ text: responseText });

    getProbateCaseDetailsTemplate = proxyquire("../../main/service/template-service", {
      "../util/config": { getOrThrow },
      "../util/fetch": { fetch }
    }).getProbateCaseDetailsTemplate;
  });

  describe("getProbateCaseDetailsTemplate()", () => {
    it("should return probate case details template", async () => {
      const req = {
        cookies: {
          jwt: "hfsjkfdhsk"
        },
        headers: {
          ServiceAuthorization: "Bearer serviceAuth"
        }
      };

      const result = await getProbateCaseDetailsTemplate(req, "jid", "ctid", "cid", "grant");

      expect(result).to.equal("Template");
      expect(getOrThrow.calledOnceWithExactly("case_data_probate_template_url")).to.be.true;
      expect(fetch.calledOnceWithExactly(
        "http://localhost:4104/template/case-details/grant",
        {
          headers: {
            "Authorization": "Bearer hfsjkfdhsk",
            "Content-Type": "application/json",
            "ServiceAuthorization": "Bearer serviceAuth"
          },
          method: "GET"
        }
      )).to.be.true;
      expect(responseText.calledOnce).to.be.true;
    });

    it("should propagate error when fetch rejects", async () => {
      const req = {
        cookies: {
          jwt: "hfsjkfdhsk"
        },
        headers: {
          ServiceAuthorization: "Bearer serviceAuth"
        }
      };
      const expectedError = { status: 500, message: "Internal Server Error" };
      fetch.rejects(expectedError);

      try {
        await getProbateCaseDetailsTemplate(req, "jid", "ctid", "cid", "grant");
        expect.fail("Expected getProbateCaseDetailsTemplate to reject");
      } catch (error: any) {
        expect(error).to.deep.equal(expectedError);
      }
    });
  });

});